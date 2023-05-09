from typing import Callable

def get_return_type(fn: Callable):
    return fn.__annotations__["return"]