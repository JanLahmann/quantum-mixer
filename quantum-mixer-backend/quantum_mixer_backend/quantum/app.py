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
        'results': {
            'analytical': result_analytical,
            'qasm': result_qasm,
            'mock': result_mock
        },
        'circuit_drawing': circuit_drawing
    }
