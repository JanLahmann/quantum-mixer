from pydantic import BaseSettings, BaseModel, Extra
from typing import Annotated
from quantum_mixer_backend.quantum.circuit_data import CircuitData

# class UsecaseOverview(BaseSettings):
#     id: Annotated[str, "Usecase id"]
#     name: Annotated[str, "Usecase name"]
#     description: Annotated[str, "Usecase description"]
#     loginRequired: Annotated[bool, "Require login from user (OAuth2)"]

class UsecaseBitMappingItem(BaseSettings):
    icon: Annotated[str, "Icon"]
    name: Annotated[str, "Display name"]

class UsecaseCircuitCatalogueItem(BaseSettings):
    id: Annotated[str, "Internal id"]
    name: Annotated[str, "Name"]
    description: Annotated[str, "Description"]
    data: CircuitData

class UsecaseCircuitCatalogueSection(BaseSettings):
    name: Annotated[str, "Section name"]
    items: Annotated[list[UsecaseCircuitCatalogueItem], "List of items belonging to this section"]

class UsecaseMeasurementRange(BaseSettings):
    min: Annotated[int, "Minimum number of measurements"]
    max: Annotated[int, "Maximum number of measurements (0 for inifite)"]
    default: Annotated[int, "Default number of measurements"]

class UsecaseData(BaseSettings):
    id: Annotated[str, "Usecase id"]
    name: Annotated[str, "Usecase name"]
    description: Annotated[str, "Usecase Description"]
    numQubits: Annotated[int, "Number of qubits"]
    loginRequired: Annotated[bool, "Requires login from user (OAuth2)"]
    circuitsCatalogue: Annotated[list[UsecaseCircuitCatalogueSection], "Initial circuit configurations to start from"]

    class Config:
        extra = Extra.ignore

class UsecasePreferences(BaseSettings):
    bitMapping: Annotated[dict[str, UsecaseBitMappingItem], "Mapping of bit configurations to products/items"]
    numMeasurements: UsecaseMeasurementRange
    class Config:
        extra = Extra.ignore

class OrderData(BaseModel):
    items: Annotated[list[str], "Bit configurations of items to order"]
