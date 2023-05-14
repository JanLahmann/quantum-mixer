import { OperationData, Operation } from "./operation";
import { ReplaySubject, Unsubscribable } from "rxjs";
import { CircuitMatrix } from './circuit-matrix';


/**
 * Data for building circuit
 */
export interface CircuitData {
  /** number of qubits */
  numQubits: number,
  /** list of operations */
  operations: OperationData[]
}

export class Circuit {

  /** Subject to get notified on changes */
  public readonly change: ReplaySubject<void> = new ReplaySubject();

  /** Number of qubits in circuit */
  private _numQubits: number = 3;
  /** Number of qubits in circuit */
  get numQubits(): number {
    return this._numQubits;
  }
  set numQubits(n: number) {
    // TODO: make sure all operations fit into new numQubits (if reduced)
    this._numQubits = n;
    this._notifyChange();
  }

  /** Array of all operations */
  private _operations: {slot: number, operation: Operation}[] = [];
  /** Array of all operations */
  get operations(): {slot: number, operation: Operation}[] {
    return this._operations;
  }

  /** Map to manage subscriptions to change events of operations */
  private _subs: {[opId: string]: Unsubscribable} = {};

  /**
   * Add an operation
   * @param op - Operation to add
   * @param qubitIdx - Initialize operation on qubitIdx
   * @param beforeSlot - inject operation at specific horizontal order
   */
  public addOperations(ops: Operation[], firstQubit: number, beforeSlot: number = -1) {
    // initialize op
    ops.map(op => {
      op.shift(firstQubit - op.getFirstQubit());
      // subscribe to changs
      this._subs[op.id] = op.change.subscribe(() => {
        this._notifyChange();
      })
      // before pushing to internal, we get index of first element with slot == beforeSlot
      let idx = this.operations.map(item => item.slot).indexOf(beforeSlot);
      idx = (idx == -1) ? this.operations.length : idx;
      // now insert element _before_ the found index
      this.operations.splice(idx, 0, {
        operation: op,
        slot: 0
      });
    });
    // publish
    this._notifyChange();
  }

  /**
   * Remove an operation from composer using its id
   * @param opId
   */
  public removeOperation(opId: string) {
    // remove from internal
    this._operations = this.operations.filter(op => op.operation.id !== opId);
    // unsubscribe from change
    this._subs[opId]?.unsubscribe();
    // publish
    this._notifyChange();
  }

  /**
   * Recalculate slots for all operations using optimized packing
   */
  private _updateSlots() {
    // init
    const slotMatrix = new CircuitMatrix();

    // loop through operations
    this.operations.forEach(opO => {
      const occupiedQubits = opO.operation.getQubits();
      const slot = slotMatrix.getBestSlot(occupiedQubits);
      opO.slot = slot;
      slotMatrix.register(occupiedQubits, slot);
    })

    // make sure optimization is sorting internal array
    this._operations.sort((op1, op2) => op1.slot - op2.slot);
  }

  /**
   * Get all operations for a given slot
   * @param slot
   */
  public getOperationsForSlot(slot: number) {
    return this.operations.filter(op => op.slot == slot).map(item => item.operation).sort((op1, op2) => op1.getFirstQubit() - op2.getFirstQubit())
  }

  /**
   * Get an operation by its unique id
   * @param id - id to search
   * @returns
   */
  public getOperationById(id: string): Operation | null {
    const items = this.operations.filter(op => op.operation.id == id);
    if(items.length == 0) {
      return null;
    } else {
      return items[0].operation;
    }
  }

  /**
   * Trigger internal change, rerender and publish event.
   */
  private _notifyChange() {
    this._updateSlots();
    this.change.next();
  }

  /**
   * Export circuit data
   * @returns
   */
  public export(): CircuitData {
    return {
      numQubits: this._numQubits,
      operations: this.operations.map(op => op.operation.export())
    }
  }

  /**
   * Reset circuit
   */
  public reset(notify: boolean = true) {
    // reset
    this._operations = [];
    Object.values(this._subs).map(sub => sub.unsubscribe());
    this._subs = {};
    if(notify) {
      this._notifyChange();
    }
  }

  /**
   * Load circuit data
   * @param data
   */
  public load(data: CircuitData) {
    this.reset();
    this._numQubits = data.numQubits;
    // load operations
    this._operations = data.operations.map((operationData, idx) => {
      return {
        slot: idx,
        operation: Operation.fromData(operationData, false)
      }
    });

    // subscribe to changes
    this.operations.map(operation => {
      this._subs[operation.operation.id] = operation.operation.change.subscribe(_ => {
        this._notifyChange();
      })
    })

    this._notifyChange();
  }

}

