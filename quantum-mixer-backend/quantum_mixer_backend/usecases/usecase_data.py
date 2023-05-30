from pydantic import BaseSettings, BaseModel, Extra
from typing import Annotated, Optional
from quantum_mixer_backend.quantum.circuit_data import CircuitData

class UsecaseBitMappingItem(BaseSettings):
    bits: Annotated[str, "Bit configuration"]
    icon: Annotated[Optional[str], "Icon"]
    name: Annotated[str, "Display name"]

class UsecaseMeasurementRange(BaseSettings):
    min: Annotated[int, "Minimum number of measurements"]
    max: Annotated[int, "Maximum number of measurements (0 for inifite)"]
    default: Annotated[int, "Default number of measurements"]

class UsecaseExternalLink(BaseSettings):
    name: Annotated[str, "Display name of external link"]
    url: Annotated[str, "URL of external link"]

class UsecaseData(BaseSettings):
    id: Annotated[str, "Usecase id"]
    name: Annotated[str, "Usecase name"]
    description: Annotated[str, "Usecase Description"]
    numQubits: Annotated[int, "Number of qubits"]
    loginRequired: Annotated[bool, "Requires login from user (OAuth2)"]
    hasOrder: Annotated[bool, "Provides an order endpoint"]
    externalLinks: Annotated[list[UsecaseExternalLink], "External links"]

    class Config:
        extra = Extra.ignore

class UsecasePreferences(BaseSettings):
    bitMapping: Annotated[list[UsecaseBitMappingItem], "Mapping of bit configurations to products/items"]
    numMeasurements: UsecaseMeasurementRange
    class Config:
        extra = Extra.ignore

class OrderData(BaseModel):
    items: Annotated[list[str], "Bit configurations of items to order"]
