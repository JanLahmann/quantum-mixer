/**
 * This object is required to determine the best positions for all operations.
 * The best position is most left in circuit. Operations can move left until they hit
 * a qubit occupied by another operation (a target or control qubit) with one of their own qubits.
 * However, they can move "through" other operations if they only cover these operations. But they
 * can not occupy qubits covered by another operation.
 * Note the terms:
 * - Occupied: a qubit is occupied by an operation if the qubit index appears in target qubit indices or control qubit indices
 * - Covered: a qubit is covered by an operation if the qubit index is in the range of all qubit indices of an operation (visually: all qubits where connection line goes through)
 * Example 1: The H gate can be moved to the most left position, because it goes through the connection line
 * --x--
 * --|-H
 * --x--
 *
 * Example 2: The H gate can not move further left because it would hit the single x and is not allowed to stay under connection line
 * -x---
 * x|-H-
 * -x---
 */
export class ComposerMatrix {

  /** 2d matrix of occupied qubits, first qubit index, second is slot */
  private _occupied: {[qubitIdx: number]: number[]} = {};
  /** 2d matrix of covered qubits, first qubit index, second is slot */
  private _covered: {[qubitIdx: number]: number[]} = {};

  /**
   * Utility function to get a maximum from a 2d matrix (like above).
   * Instead of returning Inf (like Math.max does), we use 0 if not found
   * @param obj
   * @param qubitIdx
   * @returns
   */
  private getMax(obj: {[qubitIdx: number]: number[]}, qubitIdx: number): number {
    if(!obj[qubitIdx] || obj[qubitIdx].length == 0) {
      return 0;
    }
    return Math.max(...obj[qubitIdx]);
  }

  /**
   * Check if a qubit slot is covered
   * @param qubitIdx
   * @param slot
   * @returns
   */
  private isQubitSlotCovered(qubitIdx: number, slot: number) {
    if(!this._covered[qubitIdx]) {
      this._covered[qubitIdx] = [];
    }
    return this._covered[qubitIdx].indexOf(slot) > -1;
  }

  /**
   * Create an array of qubit indices _covered_ by an operation based on an
   * array of qubit indices _occupied_ by an operation
   * @param qubitIdxs
   * @returns
   */
  private getCoveredQubitIdxs(qubitIdxs: number[]) {
    const lowestQubitIdx = Math.min(...qubitIdxs);
    const highestQubitIdx = Math.max(...qubitIdxs);
    return Array<void>(highestQubitIdx-lowestQubitIdx+1).fill().map((x, i) => i+lowestQubitIdx);
  }

  /**
   * Find best slot for an array of _occupied_ qubit indices
   * @param qubitIdxs
   * @returns
   */
  public getBestSlot(qubitIdxs: number[]) {
    // we start by querying the _occupied_ data
    // because this determines what the most left position would be
    const largestSlotNumberOccupied = Math.max(
      ...qubitIdxs.map(idx => this.getMax(this._occupied, idx))
    )

    // new we need to make sure that we do not place the operation onto _covered_ qubit slots

    // first, create an array with _covered_ qubit indices for this operation
    const coveredQubitIdxs = this.getCoveredQubitIdxs(qubitIdxs);
    // now we iterate over slots (starting from `largestSlotNumberOccupied`) to find a slot
    // where all qubit indices in `coveredQubitIdxs` are _not_ covered already
    let slot = largestSlotNumberOccupied;
    while(slot < 500) {
      if(coveredQubitIdxs.every(qubitIdx => !this.isQubitSlotCovered(qubitIdx, slot))) {
        // we found a slot, break
        break;
      }
      slot += 1;
    }
    return slot;
  }

  /**
   * Register a new qubit operation to internal 2d matrices
   * @param qubitIdxs
   * @param slot
   */
  public register(qubitIdxs: number[], slot: number) {
    // save to `_occupied` first
    qubitIdxs.map(idx => {
      if(!this._occupied[idx]) {
        this._occupied[idx] = [];
      }
      this._occupied[idx].push(slot);
    })

    // now also add to `_covered`. Here, we first need to calculate which indices are coverd
    const coveredQubitIdxs = this.getCoveredQubitIdxs(qubitIdxs);
    coveredQubitIdxs.map(idx => {
      if(!this._covered[idx]) {
        this._covered[idx] = [];
      }
      this._covered[idx].push(slot);
    })
  }
}
