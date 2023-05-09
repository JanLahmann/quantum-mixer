from abc import ABC, abstractmethod
from typing import Annotated
from pydantic import BaseModel
from quantum_mixer_backend.quantum.circuit_data import CircuitData

class BitMappingItem(BaseModel):
    id: Annotated[str, "Internal id"]
    icon: Annotated[str, "Icon"]
    name: Annotated[str, "Display name"]    

class InitialCircuit(BaseModel):
    id: Annotated[str, "Internal id"]
    name: Annotated[str, "Name"]
    description: Annotated[str, "Description"]
    data: CircuitData

class InitialCircuitCatalogueSection(BaseModel):
    name: Annotated[str, "Section name"]
    circuits: Annotated[list[InitialCircuit], "List of circuits belonging to this section"]

class NumMeasurementConfiguration(BaseModel):
    min: Annotated[int, "Minimum number of measurements"]
    max: Annotated[int, "Maximum number of measurements (0 for inifite)"]
    default: Annotated[int, "Default number of measurements"]

class UsecaseData(BaseModel):
    name: Annotated[str, "Usecase name"]
    initialCircuits: Annotated[list[InitialCircuitCatalogueSection], "Initial circuit configurations to start from"]
    numQubits: Annotated[int, "Number of qubits"]
    numMeasurements: Annotated[NumMeasurementConfiguration, "Number of measurements"]
    bitMapping: Annotated[dict[str, BitMappingItem], "Mapping of bit configurations to products/items"]

class OrderData(BaseModel):
    items: Annotated[list[str], "Bit configurations of items to order"]

class AbstractUsecase(ABC):

    def __init__(self):
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        raise NotImplementedError()

    @property
    @abstractmethod
    def bit_mapping(self) -> dict[str, BitMappingItem]:
        raise NotImplementedError()
    
    @property
    @abstractmethod
    def num_qubits(self) -> int:
        raise NotImplementedError()
    
    @property
    @abstractmethod
    def initial_circuits(self) -> list[InitialCircuitCatalogueSection]:
        raise NotImplementedError()
    
    @property
    @abstractmethod
    def num_measurements(self) -> NumMeasurementConfiguration:
        raise NotImplementedError()
    
    @abstractmethod
    def order(self, data: OrderData) -> bool:
        raise NotImplementedError()

    def get_data(self) -> UsecaseData:
        return {
            "name": self.name,
            "initialCircuits": self.initial_circuits,
            "bitMapping": self.bit_mapping,
            "numQubits": self.num_qubits,
            "numMeasurements": self.num_measurements
        }

    



    