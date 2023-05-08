from fastapi import FastAPI
from .circuit_data import CircuitData
from .circuit_executor import CircuitExecutor

app = FastAPI()

@app.post('/probabilities')
async def get_probabilities(circuit_data: CircuitData):

    # create executor
    executor = CircuitExecutor.from_circuit_data(circuit_data)

    # calculate probabilities
    result_analytical = executor.probabilities_analytical()
    result_qasm = executor.probabilities_qasm()
    result_mock = executor.probabilities_mock()

    # get an ASCII drawing
    circuit_drawing = executor.circuit.draw('text').__str__()

    # return data
    return {
        'bits': executor.bit_order,
        'results': {
            'analytical': [result_analytical[b] for b in executor.bit_order],
            'qasm': [result_qasm[b] for b in executor.bit_order],
            'mock': [result_mock[b] for b in executor.bit_order],
        },
        'circuit_drawing': circuit_drawing
    }

@app.post('/measurements')
async def get_measurements(circuit_data: CircuitData, num_shots: int = 1):

    # create executor
    executor = CircuitExecutor.from_circuit_data(circuit_data)

    # get results
    results = []
    for _ in range(num_shots):
        result_analytical = executor.probabilities_qasm(num_shots=1)
        result_analytical_bits = max(result_analytical, key=result_analytical.key)
        results.push(result_analytical_bits)
    
    # return data
    return {
        'results': results
    }