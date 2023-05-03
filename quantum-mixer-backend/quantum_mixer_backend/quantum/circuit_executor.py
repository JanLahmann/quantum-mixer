import numpy as np
from itertools import product
from random import randint
from qiskit import transpile, execute, QuantumCircuit
from qiskit_aer import StatevectorSimulator, QasmSimulator
from qiskit.test.mock import FakeMontreal
from typing import Union, Dict
from .circuit_parser import parse_circuit_data
from .circuit_data import CircuitData

# initialize backends
backend_ideal = StatevectorSimulator()
backend_qasm = QasmSimulator()
backend_mock = FakeMontreal()

# execute circuit
class CircuitExecutor:
    
    def __init__(self, circuit: QuantumCircuit):
        """
        Helper Class to execute circuits on different backends.
        """
        self.circuit = circuit
        self.bit_order = list(map(''.join, product(['0', '1'], repeat=circuit.num_qubits)))
        

    def _fill_with_zero(self, results: Dict[str, float]):
        """
        Make sure that all keys defined in bit_order are present in the resulting dict.
        """
        new_results = {}
        for bit in self.bit_order:
            if bit not in results:
                new_results[bit] = 0
            else:
                new_results[bit] = results[bit]
        return new_results
    

    def _probabilities_backend(self, backend, num_shots: int = 800, seed: Union[int, None] = None, result_options={}, transpile_before: bool = False):
        """
        Calculate probabilities on a given backend.
        """
        # copy current circuit
        mqc = self.circuit.copy()
        # add measurement
        mqc.measure(range(mqc.num_qubits), range(mqc.num_qubits))
        # transpile
        mqc_transpiled = mqc if not transpile_before else transpile(mqc, backend)
        # run job
        job = backend.run(mqc_transpiled, shots=num_shots, seed=seed)
        # get results
        result = job.result(**result_options)
        counts = result.get_counts(mqc_transpiled)
        # divide by num_shots to get probabilities
        assert num_shots == np.sum([c for c in counts.values()]), (num_shots, counts)
        for b in counts:
            counts[b] = float(counts[b])/num_shots
        return self._fill_with_zero(counts)
    
    
    def get_maximum_key(self, results: Dict[str, float]):
        """
        Get the key which has the highest maximum
        """
        max_key = max(results, key=results.get)
        return max_key
    
    
    def probabilities_qasm(self, num_shots: int = 800):
        """
        Calculate probabilities on QASM Simulator
        """
        return self._probabilities_backend(backend_qasm, num_shots=num_shots, seed=randint(0, 2500), transpile_before=True)
    
    
    def probabilities_mock(self, num_shots: int = 800):
        """
        Calculate probabilities on Mock Device
        """
        return self._probabilities_backend(backend_mock, num_shots=num_shots, transpile_before=True)

    
    def probabilities_analytical(self):
        """
        Calculate probabilities using the state vector (analytical solution)
        """
        mqc = self.circuit.copy()
        # run circuit on state vector
        result = execute(mqc, backend_ideal).result()
        # get state vector and calculate probabilities
        state_vector = result.get_statevector(mqc, decimals=5)
        probs = state_vector.probabilities() if hasattr(state_vector, "probabilities") else np.abs(state_vector ** 2)
        # map back to bit configurations
        results = {
            key: probs[i] for i, key in enumerate(self.bit_order)
        }
        return self._fill_with_zero(results)
    
    
    @staticmethod
    def from_circuit_data(circuit_data: CircuitData):
        # parse data
        qc = parse_circuit_data(circuit_data)
        return CircuitExecutor(qc)