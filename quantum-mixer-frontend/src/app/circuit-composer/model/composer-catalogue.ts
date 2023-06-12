import { OperationData, OperationType, Operation, OperationProperties } from "./operation"

export enum ComposerCatalogueType {
  HADAMARD = 'hadamard',
  NOT      = 'not',
  CNOT     = 'cnot',
  Z        = 'z',
  RY       = 'ry',
  SWAP     = 'swap'
}

export interface ComposerCatalogueItem {
  operations: OperationData[],
  description: string
}

export const ComposerCatalogue: {[key in ComposerCatalogueType]: ComposerCatalogueItem} = {
  [ComposerCatalogueType.HADAMARD]: {
    operations: [
      {
        type: OperationType.HADAMARD,
        targetQubits: [0],
        controlQubits: [],
        parameterValues: []
      }
    ],
    description: OperationProperties[OperationType.HADAMARD].description
  },
  [ComposerCatalogueType.SWAP]: {
    operations: [
      {
        type: OperationType.SWAP,
        targetQubits: [0, 1],
        controlQubits: [],
        parameterValues: []
      }
    ],
    description: OperationProperties[OperationType.SWAP].description
  },
  [ComposerCatalogueType.NOT]: {
    operations: [
      {
        type: OperationType.NOT,
        targetQubits: [0],
        controlQubits: [],
        parameterValues: []
      }
    ],
    description: OperationProperties[OperationType.NOT].description
  },
  [ComposerCatalogueType.CNOT]: {
    operations: [
      {
        type: OperationType.NOT,
        targetQubits: [1],
        controlQubits: [0],
        parameterValues: []
      }
    ],
    description: 'The controlled-NOT gate, also known as the controlled-x (CX) gate, acts on a pair of qubits, with one acting as control and the other as target. It performs a NOT on the target whenever the control is in state ∣1⟩. If the control qubit is in a superposition, this gate creates entanglement.'
  },
  [ComposerCatalogueType.Z]: {
    operations: [
      {
        type: OperationType.Z,
        targetQubits: [0],
        controlQubits: [],
        parameterValues: []
      }
    ],
    description: OperationProperties[OperationType.Z].description
  },
  [ComposerCatalogueType.RY]: {
    operations: [
      {
        type: OperationType.RY,
        targetQubits: [0],
        controlQubits: [],
        parameterValues: ['pi/2']
      }
    ],
    description: OperationProperties[OperationType.RY].description
  }
}


export function createOperations(type: ComposerCatalogueType, renderWithWhiteBackground: boolean = false) {
  const composerCatalogueItem = ComposerCatalogue[type];
  return composerCatalogueItem.operations.map(operationData => Operation.fromData(operationData, renderWithWhiteBackground));
}

