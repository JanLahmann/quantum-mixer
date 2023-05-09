from fastapi import FastAPI
from .utils import get_return_type
from .usecase_abstract import AbstractUsecase, OrderData
from .usecase import usecase

app = FastAPI()

@app.get('/data')
async def get_usecase_data() -> get_return_type(AbstractUsecase.get_data):
    return usecase.get_data()

@app.post('/order')
async def place_order(data: OrderData) -> get_return_type(AbstractUsecase.order):
    return usecase.order(data)