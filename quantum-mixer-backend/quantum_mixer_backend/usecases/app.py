import os
from fastapi import FastAPI
from .qoffee import QoffeeUsecase
from .usecase import Usecase
from .usecase_data import UsecaseData

USECASES = [
    QoffeeUsecase.from_file(
        os.path.join(os.path.dirname(os.path.realpath(__file__)), 'qoffee', 'usecase.yml')
    ),
    Usecase.from_file(
        os.path.join(os.path.dirname(os.path.realpath(__file__)), 'usecase_ice.yml')
    ),
    Usecase.from_file(
        os.path.join(os.path.dirname(os.path.realpath(__file__)), 'usecase_cocktail.yml')
    )
]

def set_endpoints(app: FastAPI, prefix: str):

    usecase_data = []

    for usecase in USECASES:
        # create overview
        overview = usecase.get_data()
        usecase_data.append(overview)
        # append endpoints
        usecase.set_endpoints(app, '{}/{}'.format(prefix, overview.id))
        
    @app.get('{}'.format(prefix))
    def get_usecases() -> list[UsecaseData]:
        return usecase_data