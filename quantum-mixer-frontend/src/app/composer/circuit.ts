import { OperationData } from "./operation";

/**
 * Data for building circuit
 */
export interface CircuitData {
  /** number of qubits */
  numQubits: number,
  /** list of operations */
  operations: OperationData[]
}
