from qiskit import QuantumCircuit
from .circuit_data import CircuitData
from sympy.parsing.sympy_parser import parse_expr

def parse_circuit_data(circuit_data: CircuitData) -> QuantumCircuit:

    # create circuit
    qc = QuantumCircuit(circuit_data.numQubits, circuit_data.numQubits)

    # add operations
    for operation in circuit_data.operations:
        # get method name
        method_name = 'c'*len(operation.controlQubits) + operation.type
        
        # transform parameters
        parameterValueFloats = list(map(lambda x: float(parse_expr(x.lower()).evalf()), operation.parameterValues))

        # get method arguments (order: parameters, control qubits, target qubits)
        method_arguments = parameterValueFloats + operation.controlQubits + operation.targetQubits
        qc.__getattribute__(method_name)(*method_arguments)

    # return circuit
    return qc

