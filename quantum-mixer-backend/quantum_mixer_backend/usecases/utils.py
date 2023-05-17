from typing import Callable
from pydantic import BaseModel
from requests import Response
import json

def get_return_type(fn: Callable):
    """
    Return the return type of a given function
    """
    return fn.__annotations__["return"]

def handle_response(request_response: Response):
    """
    Try to parse the response and return tuple of (statusCode, body)
    """
    data = {}
    try:
        data = json.loads(request_response.text)
    except json.JSONDecodeError:
        data = {
            "response_text": request_response.text
        }
    status = request_response.status_code
    return status, data
