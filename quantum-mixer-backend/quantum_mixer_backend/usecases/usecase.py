import yaml
import json
from fastapi import FastAPI
from quantum_mixer_backend.usecases.usecase_data import UsecaseData, UsecasePreferences
from quantum_mixer_backend.usecases.utils import get_return_type


class Usecase:

    data: UsecaseData
    preferences: UsecasePreferences

    def __init__(self, data: UsecaseData, preferences: UsecasePreferences):
        self.data        = data
        self.preferences = preferences

    def get_data(self) -> UsecaseData:
        return self.data
    
    def get_preferences(self) -> UsecasePreferences:
        return self.preferences
    
    def set_preferences(self, preferences: UsecasePreferences) -> bool:
        self.preferences = preferences
        return True

    def get_preferences_schema(self):
        return self.preferences.schema()

    def set_endpoints(self, app: FastAPI, prefix: str):

        @app.get('{}'.format(prefix))
        async def get_data() -> get_return_type(self.get_data):
            return self.get_data()
        
        @app.get('{}/preferences'.format(prefix))
        async def get_preferences() -> get_return_type(self.get_preferences):
            return self.get_preferences()

        @app.post('{}/preferences'.format(prefix))
        async def set_preferences(data: get_return_type(self.get_preferences)) -> bool:
            return self.set_preferences(data)
        
        @app.get('{}/preferences/schema'.format(prefix))
        async def get_schema():
            return self.get_preferences_schema()
    
    @classmethod
    def from_file(cls, path: str):
        with open(path, 'r') as f:
            all_data = yaml.safe_load(f)
        usecase_data_class = get_return_type(cls.get_data)
        usecase_pref_class = get_return_type(cls.get_preferences)
        obj = cls(usecase_data_class(**all_data), usecase_pref_class(**all_data))
        return obj