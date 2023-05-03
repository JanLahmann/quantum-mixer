from typing import Annotated
from pydantic import BaseModel
from enum import Enum

class OperationTypeEnum(str, Enum):
    HADAMARD = 'h'
    NOT      = 'x'
    Z        = 'z'
    RY       = 'ry'
    IDENTITY = 'i'

class OperationData(BaseModel):
    id: Annotated[str, "Unique id of operation"]
    type: Annotated[OperationTypeEnum, "Base type of an operation (without controls)"]
    targetQubits: Annotated[list[int], "Indices of target qubits"]
    controlQubits: Annotated[list[int], "Indices of control qubits"]
    parameterValues: Annotated[list[float], "Parameters for gate"]

class CircuitData(BaseModel):
    numQubits: Annotated[int, "number of qubits"]
    operations: Annotated[list[OperationData], "list of operations"]

