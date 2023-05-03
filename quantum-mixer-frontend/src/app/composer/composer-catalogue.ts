import { ComposerOperation, ComposerOperationOptions } from "./composer-operation"
import { OperationType } from "./operation"

export enum ComposerCatalogueType {
  HADAMARD = 'hadamard',
  NOT      = 'not',
  CNOT     = 'cnot',
  CCNOT    = 'ccnot',
  IDENTITY = 'identity',
  Z        = 'z',
  RY       = 'ry'
}

export const ComposerCatalogue: {[key: string]: ComposerOperationOptions} = {
  [ComposerCatalogueType.HADAMARD]: {
    type: OperationType.HADAMARD,
    text: 'H',
    color: 'orange',
    numTargetQubits: 1,
    numControlQubits: [0, 1, 0],
    relativeWidth: 1.0,
    parameters: []
  },
  [ComposerCatalogueType.NOT]: {
    type: OperationType.NOT,
    text: 'X',
    color: 'blue',
    numTargetQubits: 1,
    numControlQubits: [0, 3, 0],
    relativeWidth: 1.0,
    parameters: []
  },
  [ComposerCatalogueType.CNOT]: {
    type: OperationType.NOT,
    text: 'X',
    color: 'blue',
    numTargetQubits: 1,
    numControlQubits: [0, 3, 1],
    relativeWidth: 1.0,
    parameters: []
  },
  [ComposerCatalogueType.CCNOT]: {
    type: OperationType.NOT,
    text: 'X',
    color: 'blue',
    numTargetQubits: 1,
    numControlQubits: [0, 3, 2],
    relativeWidth: 1.0,
    parameters: []
  },
  [ComposerCatalogueType.IDENTITY]: {
    type: OperationType.IDENTITY,
    text: 'I',
    color: 'blue',
    numTargetQubits: 1,
    numControlQubits: [0, 0, 0],
    relativeWidth: 1.0,
    parameters: []
  },
  [ComposerCatalogueType.Z]: {
    type: OperationType.Z,
    text: 'Z',
    color: 'grey',
    numTargetQubits: 1,
    numControlQubits: [0, 0, 0],
    relativeWidth: 1.0,
    parameters: []
  },
  [ComposerCatalogueType.RY]: {
    type: OperationType.RY,
    text: 'RY',
    color: 'pink',
    numTargetQubits: 1,
    numControlQubits: [0, 1, 0],
    relativeWidth: 1.0,
    parameters: [{
      name: 'lambda',
      default: 'pi/2'
    }]
  }
}

export function createOperation(type: ComposerCatalogueType) {
  const options = ComposerCatalogue[type];
  if(!options) {
    throw new Error(`Error getting options for ${type}`);
  }
  return new ComposerOperation(options);
}

