export enum OperationType {
  HADAMARD = 'h',
  NOT      = 'x',
  Z        = 'z',
  RY       = 'ry',
  IDENTITY = 'i'
}

export interface OperationData {
  /** Unique id of operation */
  readonly id: string;
  /**
   * Base type of an operation (without controls)
   */
  readonly type: OperationType;
  /**
   * Indices of target qubits
   */
  readonly targetQubits: number[];
  /**
   * Indices of control qubits
   */
  readonly controlQubits: number[];
  /**
   * Parameters for gate
   */
  readonly parameterValues: number[]
}
