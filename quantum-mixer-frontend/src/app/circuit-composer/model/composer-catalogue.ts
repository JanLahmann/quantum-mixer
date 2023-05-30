import { OperationData, OperationType, Operation } from "./operation"

export enum ComposerCatalogueType {
  HADAMARD = 'hadamard',
  NOT      = 'not',
  CNOT     = 'cnot',
  // CCNOT    = 'ccnot',
  // IDENTITY = 'identity',
  Z        = 'z',
  RY       = 'ry',
  SWAP     = 'swap'
}

export interface ComposerCatalogueItem {
  operations: OperationData[]
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
    ]
  },
  [ComposerCatalogueType.SWAP]: {
    operations: [
      {
        type: OperationType.SWAP,
        targetQubits: [0, 1],
        controlQubits: [],
        parameterValues: []
      }
    ]
  },
  [ComposerCatalogueType.NOT]: {
    operations: [
      {
        type: OperationType.NOT,
        targetQubits: [0],
        controlQubits: [],
        parameterValues: []
      }
    ]
  },
  [ComposerCatalogueType.CNOT]: {
    operations: [
      {
        type: OperationType.NOT,
        targetQubits: [1],
        controlQubits: [0],
        parameterValues: []
      }
    ]
  },
  // [ComposerCatalogueType.CCNOT]: {
  //   operations: [
  //     {
  //       type: OperationType.NOT,
  //       targetQubits: [2],
  //       controlQubits: [0, 1],
  //       parameterValues: []
  //     }
  //   ]
  // },
  // [ComposerCatalogueType.IDENTITY]: {
  //   operations: [
  //     {
  //       type: OperationType.IDENTITY,
  //       targetQubits: [0],
  //       controlQubits: [],
  //       parameterValues: []
  //     }
  //   ]
  // },
  [ComposerCatalogueType.Z]: {
    operations: [
      {
        type: OperationType.Z,
        targetQubits: [0],
        controlQubits: [],
        parameterValues: []
      }
    ]
  },
  [ComposerCatalogueType.RY]: {
    operations: [
      {
        type: OperationType.RY,
        targetQubits: [0],
        controlQubits: [],
        parameterValues: ['pi/2']
      }
    ]
  }
}


export function createOperations(type: ComposerCatalogueType, renderWithWhiteBackground: boolean = false) {
  const composerCatalogueItem = ComposerCatalogue[type];
  return composerCatalogueItem.operations.map(operationData => Operation.fromData(operationData, renderWithWhiteBackground));
}

