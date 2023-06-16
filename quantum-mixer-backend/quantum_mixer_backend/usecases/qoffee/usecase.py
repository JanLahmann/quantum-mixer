from typing import Optional, Annotated, Union
import json
import os
from pydantic import BaseModel
from fastapi import FastAPI, Request, HTTPException
from starlette.responses import RedirectResponse
from requests_oauthlib import OAuth2Session
from quantum_mixer_backend.usecases.usecase import Usecase
from quantum_mixer_backend.usecases.usecase_data import OrderData, UsecaseData, UsecasePreferences, UsecaseBitMappingItem
from quantum_mixer_backend.usecases.utils import handle_response, get_return_type, StrEnum

class QoffeeUsecaseDrinkOptions(BaseModel):
    key: Annotated[str, 'Key for option']
    value: Annotated[str, 'Value for option']

class QoffeeUsecaseBitmappingItem(UsecaseBitMappingItem):
    key: Annotated[str, 'Key for Homeconnect API']
    options: Annotated[Optional[list[QoffeeUsecaseDrinkOptions]], 'Options for Homeconnect API']

class QoffeeUsecasePreferences(UsecasePreferences):
    selectedMachineHaId: Optional[str]
    bitMapping: Annotated[list[QoffeeUsecaseBitmappingItem], "Mapping of bit configurations to products/items"]

class QoffeeUsecase(Usecase):

    preferences: QoffeeUsecasePreferences
    post_login_redirect: Union[str, None] = None

    def __init__(self, data: UsecaseData, preferences: QoffeeUsecasePreferences):
        super().__init__(data, preferences)

        self.client_id     = os.getenv('HOMECONNECT_CLIENT_ID')
        self.client_secret = os.getenv('HOMECONNECT_CLIENT_SECRET')
        self.base_url      = os.getenv('HOMECONNECT_BASE_URL')
        self.host_address  = os.getenv('HOST_ADDRESS')

        # create oauth2 session
        self.session = OAuth2Session(
            client_id=self.client_id, 
            redirect_uri='{}/api/usecase/qoffee/auth/callback'.format(self.host_address),
            scope=["IdentifyAppliance", "CoffeeMaker"],
            auto_refresh_url='{}/security/oauth/token'.format(self.base_url),
            auto_refresh_kwargs={
                'client_id': self.client_id,
                'client_secret': self.client_secret
            },
            token_updater=self.set_token
        )
    
    def set_token(self, token):
        self.data.loginRequired = False
        self.token = token

    def get_preferences(self) -> QoffeeUsecasePreferences:
        return super().get_preferences()
    
    def get_preferences_schema(self):
        # get all available coffee machines
        coffee_machines = self.get_coffee_machines()
        # create a new pydantic model and allow selectedMachineHaId to be only one of the coffee machines
        CoffeeMachines = StrEnum('CoffeeMachines', {'cm{}'.format(i): x['haId'] for i, x in enumerate(coffee_machines)})
        class QoffeeUsecasePreferences_(QoffeeUsecasePreferences):
            selectedMachineHaId: CoffeeMachines
        # return schema
        return QoffeeUsecasePreferences_.schema()
    
    def set_preferences(self, preferences: QoffeeUsecasePreferences) -> bool:
        worked = super().set_preferences(preferences)
        # return early
        if not worked:
            return False
        # make sure coffee machine is turned on
        if preferences.selectedMachineHaId is not None:
            self.fetch_put('/api/homeappliances/{}/settings/BSH.Common.Setting.PowerState'.format(preferences.selectedMachineHaId), {
                "data": {
                    "key": "BSH.Common.Setting.PowerState",
                    "value": "BSH.Common.EnumType.PowerState.On"
                }
            })
        return True

    def fetch_put(self, path: str, body) -> tuple[int, any]:
        response = self.session.put('{}{}'.format(self.base_url, path), json.dumps(body), headers={
            'Content-Type': 'application/json'
        })
        status, data = handle_response(response)

        if status >= 300:
            raise HTTPException(
                status_code=status,
                detail=data,
            )

        return data

    def fetch_get(self, path: str) -> tuple[int, any]:
        response = self.session.get('{}{}'.format(self.base_url, path))
        status, data = handle_response(response)

        if status >= 300:
            raise HTTPException(
                status_code=status,
                detail=data,
            )

        return data

    def get_coffee_machines(self):
        data = self.fetch_get('/api/homeappliances')
        coffee_machines = list(filter(lambda x: x['type'] == 'CoffeeMaker', data['data']['homeappliances']))
        return coffee_machines
        
    def set_endpoints(self, app: FastAPI, prefix: str):
        super().set_endpoints(app, prefix)

        @app.get('{}/auth/login'.format(prefix))
        def login(redirect: str = '') -> RedirectResponse:
            authorization_url, _ = self.session.authorization_url(
                '{}/security/oauth/authorize'.format(self.base_url),
            )
            self.post_login_redirect = redirect
            return RedirectResponse(authorization_url)

        @app.get('{}/auth/callback'.format(prefix))
        def handle_authorization_callback(request: Request, code: str = '') -> RedirectResponse: 
            token = self.session.fetch_token(
                '{}/security/oauth/token'.format(self.base_url),
                client_secret=self.client_secret,
                authorization_response=request.url._url.replace('http://', 'https://')
            )
            self.set_token(token)
            coffee_machines = self.get_coffee_machines()
            if len(coffee_machines) > 0:
                self.preferences.selectedMachineHaId = coffee_machines[0]['haId']
            return RedirectResponse(self.post_login_redirect)

        @app.post('{}/order'.format(prefix))
        async def handle_order(data: OrderData) -> get_return_type(self.handle_order):
            return self.handle_order(data)

    def handle_order(self, data: OrderData) -> bool:
        if len(data.items) != 1:
            raise RuntimeError("Unable to process other than 1 item, got {}".format(len(data.items)))

        drink_data = next(
            filter(lambda x: x.bits == data.items[0], self.preferences.bitMapping)
        )
        drink_data_key     = drink_data.key
        drink_data_options = [] if drink_data.options is None else list(map(lambda x: x.dict(), drink_data.options))

        # quickfix: homeconnect api only accepts integer values, not strings
        for option in drink_data_options:
            if option["value"].isnumeric():
                option["value"] = int(option["value"])

        self.fetch_put('/api/homeappliances/{}/programs/active'.format(self.preferences.selectedMachineHaId), {
            'data': {
                'key': drink_data_key,
                'options': drink_data_options
            }
        })

        return True

