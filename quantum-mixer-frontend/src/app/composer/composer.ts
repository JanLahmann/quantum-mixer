import { ReplaySubject, Unsubscribable } from "rxjs";
import { CircuitData } from "./circuit";
import { ComposerMatrix } from './composer-matrix';
import { Operation, OperationData } from "./operation";

/**
 * View data for a single slot in composer
 */
export interface ComposerSlotViewData {
  relativeWidth: number,
  operations: {
    operationSvg?:    string,
    operationId:      string,
    firstQubit:       number,
    numQubitsCovered: number,
    relativeWidth:    number
  }[]
}

/**
 * View data for all slots in composer
 */
export interface ComposerViewData {
  relativeWidth: number,
  slots: ComposerSlotViewData[]
}

export class Composer {

  /** Subject to get notified on changes */
  public readonly change: ReplaySubject<void> = new ReplaySubject();

  /** Number of qubits in composer */
  private _numQubits: number = 3;
  /** Number of qubits in composer */
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
      let idx = this._operations.map(item => item.slot).indexOf(beforeSlot);
      idx = (idx == -1) ? this._operations.length : idx;
      // now insert element _before_ the found index
      this._operations.splice(idx, 0, {
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
    this._operations = this._operations.filter(op => op.operation.id !== opId);
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
    const slotMatrix = new ComposerMatrix();

    // loop through operations
    this._operations.forEach(opO => {
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
    return this._operations.filter(op => op.slot == slot).map(item => item.operation).sort((op1, op2) => op1.getFirstQubit() - op2.getFirstQubit())
  }

  /**
   * Get an operation by its unique id
   * @param id - id to search
   * @returns
   */
  public getOperationById(id: string): Operation | null {
    const items = this._operations.filter(op => op.operation.id == id);
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
    this._buildViewData();
    this.change.next();
  }

  private _viewData: ComposerViewData | null = null;
  /**
   * View Data for Composer
   */
  get viewData(): ComposerViewData | null {
    return this._viewData;
  }

  /**
   * Rebuild view data
   */
  private _buildViewData() {

    // init data structure
    const newViewData: ComposerViewData = {
      relativeWidth: 0,
      slots: []
    }
    // get number of slots
    const slots = this._operations.length > 0 ? Math.max(...this._operations.map(op => op.slot)) : 0;
    // loop slots
    for(let slot = 0; slot <= slots; slot++) {
      const slotOperations = this.getOperationsForSlot(slot);
      const slotViewData: ComposerSlotViewData = {
        relativeWidth: slotOperations.length > 0 ? Math.max(...slotOperations.map(op => op.relativeWidth)) : 0,
        operations: this.getOperationsForSlot(slot).map(op => {
          const opSvg    = op.svg?.svg();
          return {
            operationId: op.id,
            operationSvg: opSvg,
            firstQubit: op.getFirstQubit(),
            numQubitsCovered: op.getNumQubitsCovered(),
            relativeWidth: op.relativeWidth
          }
        })
      }
      newViewData.slots.push(slotViewData);
    }

    newViewData.relativeWidth = newViewData.slots.map(s => s.relativeWidth).reduce((ps, s) => ps + s, 0);
    this._viewData = newViewData;
  }

  /**
   * Export circuit data
   * @returns
   */
  public export(): CircuitData {
    return {
      numQubits: this._numQubits,
      operations: this._operations.map(op => op.operation.export())
    }
  }

  /**
   * Load circuit data
   * @param data
   */
  public load(data: CircuitData) {
    // reset
    this._operations = [];
    Object.values(this._subs).map(sub => sub.unsubscribe());
    this._subs = {};
    this._numQubits = data.numQubits;

    // load operations
    this._operations = data.operations.map((operationData, idx) => {
      return {
        slot: idx,
        operation: Operation.fromData(operationData)
      }
    });

    // subscribe to changes
    this._operations.map(operation => {
      this._subs[operation.operation.id] = operation.operation.change.subscribe(_ => {
        this._notifyChange();
      })
    })

    this._notifyChange();
  }

}
