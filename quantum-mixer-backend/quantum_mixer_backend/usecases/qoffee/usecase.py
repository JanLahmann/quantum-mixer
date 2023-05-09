from quantum_mixer_backend.usecases.usecase_abstract import AbstractUsecase, OrderData
from quantum_mixer_backend.quantum.circuit_data import OperationTypeEnum

class QoffeeUsecase(AbstractUsecase):

    def __init__(self):
        pass

    name = 'QoffeeMaker'
    bit_mapping = {
        "000": {
            "id": "tea",
            "name": "Tea",
            "icon": ""
        },
        "001": {
            "id": "hotchocolate",
            "name": "Hot Chocolate",
            "icon": ""
        },
        "010": {
            "id": "espresso",
            "name": "Espresso",
            "icon": ""
        },
        "011": {
            "id": "coffee",
            "name": "Coffee",
            "icon": ""
        },
        "100": {
            "id": "cappucino",
            "name": "Cappucino",
            "icon": ""
        },
        "101": {
            "id": "lattemacchiato",
            "name": "Latte Macchiato",
            "icon": ""
        },
        "110": {
            "id": "wienermelange",
            "name": "Viennese Melange",
            "icon": ""
        },
        "111": {
            "id": "americano",
            "name": "Americano",
            "icon": ""
        }
    }
    num_qubits = 3
    initial_circuits = [{
        "name": "From Scratch",
        "circuits": [{
            "id": "superposition",
            "name": "Superposition",
            "description": "All in superposition",
            "data": {
                "numQubits": 3,
                "operations": [{
                    "id": "<>",
                    "type": OperationTypeEnum.HADAMARD,
                    "targetQubits": [0],
                    "controlQubits": [],
                    "parameterValues": []
                }, {
                    "id": "<>",
                    "type": OperationTypeEnum.HADAMARD,
                    "targetQubits": [1],
                    "controlQubits": [],
                    "parameterValues": []
                }, {
                    "id": "<>",
                    "type": OperationTypeEnum.HADAMARD,
                    "targetQubits": [2],
                    "controlQubits": [],
                    "parameterValues": []
                }]
            }
        }]
    }]
    num_measurements = {
        "min": 1,
        "max": 1,
        "default": 1
    }
    
    def order(self, data: OrderData) -> bool:
        if len(data.items) != 1:
            raise RuntimeError("Unable to process other than {} item, got {}".format(self.num_measurements["max"], len(data.items)))
        return True

    