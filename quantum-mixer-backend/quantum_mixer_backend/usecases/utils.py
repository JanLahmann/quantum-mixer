from typing import Callable
import enum
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


class StrEnum(str, enum.Enum):
    """
    StrEnum is a Python ``enum.Enum`` that inherits from ``str``. The default
    ``auto()`` behavior uses the member name as its value.
    Example usage::
        class Example(StrEnum):
            UPPER_CASE = auto()
            lower_case = auto()
            MixedCase = auto()
        assert Example.UPPER_CASE == "UPPER_CASE"
        assert Example.lower_case == "lower_case"
        assert Example.MixedCase == "MixedCase"
    """

    def __new__(cls, value, *args, **kwargs):
        if not isinstance(value, (str, enum.auto)):
            raise TypeError(
                f"Values of StrEnums must be strings: {value!r} is a {type(value)}"
            )
        return super().__new__(cls, value, *args, **kwargs)

    def __str__(self):
        return str(self.value)

    def _generate_next_value_(name, *_):
        return 