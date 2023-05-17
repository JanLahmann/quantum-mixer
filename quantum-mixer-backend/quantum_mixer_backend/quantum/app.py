from fastapi import FastAPI
from .circuit_data import CircuitData, ProbabilitiesResponse, MeasurementResponse, DeviceEnum
from .circuit_executor import CircuitExecutor

def build(app: FastAPI, prefix: str):
    
    @app.post('{}/probabilities'.format(prefix))
    async def get_probabilities(circuit_data: CircuitData) -> ProbabilitiesResponse:

        # create executor
        executor = CircuitExecutor.from_circuit_data(circuit_data)

        # calculate probabilities
        result_analytical = executor.probabilities_analytical()
        result_qasm = executor.probabilities_qasm()
        result_mock = executor.probabilities_mock()

        # get an ASCII drawing
        circuit_drawing = executor.circuit.draw('text').__str__()

        # get qasm code
        circuit_qasm = executor.circuit.qasm()

        # return data
        return {
            'bits': executor.bit_order,
            'results': {
                DeviceEnum.ANALYTICAL: [result_analytical[b] for b in executor.bit_order],
                DeviceEnum.QASM: [result_qasm[b] for b in executor.bit_order],
                DeviceEnum.MOCK: [result_mock[b] for b in executor.bit_order],
            },
            'circuit': circuit_drawing,
            'qasm': circuit_qasm
        }


    @app.post('{}/measurements'.format(prefix))
    async def get_measurements(circuit_data: CircuitData, shots: int = 1, device: DeviceEnum = DeviceEnum.QASM) -> MeasurementResponse:

        # create executor
        executor = CircuitExecutor.from_circuit_data(circuit_data)

        # get results
        results = []
        for _ in range(shots):
            result_qasm = executor.probabilities_qasm(num_shots=1) if device == DeviceEnum.QASM else executor.probabilities_mock(num_shots=1)
            result_qasm_bits = max(result_qasm, key=result_qasm.get)
            results.append(result_qasm_bits)
        
        # return data
        return {
            'device': device,
            'results': results,
            'shots': shots
        }
