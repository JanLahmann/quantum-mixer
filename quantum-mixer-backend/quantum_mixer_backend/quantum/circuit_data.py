from typing import Annotated
from pydantic import BaseModel
from enum import Enum

class OperationTypeEnum(str, Enum):
    HADAMARD = 'h'
    NOT      = 'x'
    Z        = 'z'
    RY       = 'ry'
    IDENTITY = 'i'
    SWAP     = 'swap'

class OperationData(BaseModel):
    id: Annotated[str, "Unique id of operation"]
    type: Annotated[OperationTypeEnum, "Base type of an operation (without controls)"]
    targetQubits: Annotated[list[int], "Indices of target qubits"]
    controlQubits: Annotated[list[int], "Indices of control qubits"]
    parameterValues: Annotated[list[str], "Parameters for gate"]

class CircuitData(BaseModel):
    numQubits: Annotated[int, "Number of qubits"]
    operations: Annotated[list[OperationData], "List of operations"]

class DeviceEnum(str, Enum):
    ANALYTICAL = 'analytical'
    QASM       = 'qasm'
    MOCK       = 'mock'

class ProbabilitiesResponse(BaseModel):
    bits: Annotated[list[str], "Ordered list of bit configuration, corrsponds to order in results"]
    results: Annotated[dict[DeviceEnum, list[float]], "Results for each device"]
    circuit: Annotated[str, "ASCII drawing of circuit"]
    qasm: Annotated[str, "QASM code of circuit"]

class MeasurementResponse(BaseModel):
    shots: Annotated[int, "Number of shots"]
    device: Annotated[DeviceEnum, "Device used to do measurement"]
    results: Annotated[list[str], "List of measured bit configurations"]
