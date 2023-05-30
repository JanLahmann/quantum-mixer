import { ReplaySubject, first } from "rxjs";
import { v4 as uuidv4 } from 'uuid';
import { fabric } from 'fabric';
import { OperationRenderer } from './operation-render';


export enum OperationType {
  /** Hadamard */
  HADAMARD = 'h',
  /** Not */
  NOT      = 'x',
  /** Z */
  Z        = 'z',
  /** Ry */
  RY       = 'ry',
  /** Identity */
  IDENTITY = 'i',
  /** Swap */
  SWAP     = 'swap'
}

export interface OperationProperties {
  /** Operation type */
  type: OperationType,
  /** Title */
  title: string,
  /** Description */
  description: string,
  /** Number of target qubits. Can not be changed. */
  numTargetQubits: number,
  /** Number of control qubits. First number is minimum, second is maximum. */
  numControlQubits: number[],
  /** Parameters */
  parameters: {
    /** Parameter name */
    name: string,
    /** Parameter value. Supports e.g. `pi/2`, therefore a string */
    default: string,
    /** Options to choose from */
    options: string[]
  }[],
  /** Color of operation in composer */
  color: string;
  /** Text inside main block */
  text: string;
  /** Relative width of main block */
  relativeWidth?: number;
  /** Render with white background */
  whiteBackground?: boolean;
}

export const OperationProperties: {[key in OperationType]: OperationProperties} = {
  [OperationType.HADAMARD]: {
    type: OperationType.HADAMARD,
    title: 'Hadamard',
    description: 'The H, or Hadamard, gate rotates the states ∣0⟩∣0⟩ and ∣1⟩∣1⟩ to ∣+⟩∣+⟩ and ∣−⟩∣−⟩, respectively. It is useful for making superpositions. If you have a universal gate set on a classical computer and add the Hadamard gate, it becomes a universal gate set on a quantum computer.',
    numTargetQubits: 1,
    numControlQubits: [0, 1],
    parameters: [],
    color: 'rgb(232, 90, 92)',
    text: 'H',
    relativeWidth: 1.0
  },
  [OperationType.NOT]: {
    type: OperationType.NOT,
    title: 'NOT',
    description: 'The NOT gate, also known as the Pauli X gate, flips the ∣0⟩∣0⟩ state to ∣1⟩∣1⟩, and vice versa. The NOT gate is equivalent to RX for the angle ππ or to HZH.',
    numTargetQubits: 1,
    numControlQubits: [0, 4],
    parameters: [],
    color: 'rgb(83, 139, 247)',
    text: '+',
    relativeWidth: 1.0
  },
  [OperationType.Z]: {
    type: OperationType.Z,
    title: 'Z',
    description: 'The Pauli Z gate acts as identity on the ∣0⟩∣0⟩ state and multiplies the sign of the ∣1⟩∣1⟩ state by -1. It therefore flips the ∣+⟩∣+⟩ and ∣−⟩∣−⟩ states. In the +/- basis, it plays the same role as the NOT gate in the ∣0⟩∣0⟩/∣1⟩∣1⟩ basis.',
    numTargetQubits: 1,
    numControlQubits: [0, 2],
    parameters: [],
    color: 'rgb(194, 229, 252)',
    text: 'Z',
    relativeWidth: 1.0
  },
  [OperationType.IDENTITY]: {
    type: OperationType.IDENTITY,
    title: 'Identity',
    description: 'The identity gate (sometimes called the Id or the I gate) is actually the absence of a gate. It ensures that nothing is applied to a qubit for one unit of gate time.',
    numTargetQubits: 1,
    numControlQubits: [0, 0],
    parameters: [],
    color: 'rgb(194, 229, 252)',
    text: 'I',
    relativeWidth: 1.0
  },
  [OperationType.RY]: {
    type: OperationType.RY,
    title: 'Rotation Y',
    description: 'On the Bloch sphere, this gate corresponds to rotating the qubit state around the y axis by the given angle and does not introduce complex amplitudes.',
    numTargetQubits: 1,
    numControlQubits: [0, 1],
    parameters: [{
      name: 'lambda',
      default: 'pi/2',
      options: ['pi/8', '2*pi/8', '3*pi/8', '4*pi/8', '5*pi/8', '6*pi/8', '7*pi/8', 'pi']
    }],
    color: 'rgb(239, 184, 230)',
    text: 'RY',
    relativeWidth: 1.3
  },
  [OperationType.SWAP]: {
    type: OperationType.SWAP,
    title: 'Swap',
    description: 'The SWAP gate swaps the states of two qubits.',
    numTargetQubits: 2,
    numControlQubits: [0, 1],
    parameters: [],
    color: 'rgb(83, 139, 247)',
    text: '',
    relativeWidth: 1.0
  },
}

export interface OperationData {
  /** Unique id of operation */
  readonly id?: string;
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
  readonly parameterValues: string[]
}

export class Operation {

  public readonly type: OperationType;

  /**
   * Number of target qubits.
   * Example: H = 1, CNOT = 1, RXX = 3
   */
  public readonly numTargetQubits: number;

  /**
   * Number of supported control qubits.
   * First number is minimum, second is maximum and third is default.
   * Example: NOT = [0, 2, 0] (covers NOT, CNOT and CCNOT)
   */
  public readonly numControlQubits: number[];

  /** Unique id of operation */
  public readonly id: string;

  /** Subject to get notified on changes */
  public readonly change: ReplaySubject<void> = new ReplaySubject(0);

  /** All properties used for initialization */
  public readonly properties: OperationProperties;

  /** Relative width */
  get relativeWidth(): number {
    return this.properties.relativeWidth || 1.0;
  }

  constructor(properties: OperationProperties) {
    // create id
    this.id   = uuidv4();

    // save options
    this.type             = properties.type;
    this.numControlQubits = properties.numControlQubits;
    this.numTargetQubits  = properties.numTargetQubits;
    this._parameters      = properties.parameters.map(p => {
      return {
        name: p.name,
        default: p.default,
        value: p.default
      }
    })
    this.properties       = JSON.parse(JSON.stringify(properties));

    // initialize
    // first add all target qubits below each other.
    this._targetQubits = Array<void>(this.numTargetQubits).fill().map((_, i) => i);
    // then add all control qubits below (minimum number)
    const firstControlQubit = this.targetQubits[this.targetQubits.length - 1] + 1;
    this._controlQubits = Array<void>(this.numControlQubits[0]).fill().map((_, i) => i+firstControlQubit);
  }

  /** List of parameters with their default and actual value */
  private _parameters: {name: string, default: string, value: string}[];
  get parameterValues(): string[] {
    return this._parameters.map(p => p.value);
  }

  private _targetQubits: number[] = [];
  get targetQubits(): number[] {
    return JSON.parse(JSON.stringify(this._targetQubits));
  }

  private _controlQubits: number[] = [];
  get controlQubits(): number[] {
    return JSON.parse(JSON.stringify(this._controlQubits));
  }

  /**
   * Set a parameter value
   * @param name
   * @param value
   */
  public setParameter(name: string, value: string) {
    const ps = this._parameters.filter(p => p.name == name);
    if(ps.length == 1) {
      ps[0].value = value;
      this._notifyChange();
    }
  }

  /**
   * Set qubits (target and control qubits)
   * @param targetQubits
   * @param controlQubits
   */
  public setQubits(targetQubits: number[], controlQubits: number[]) {
    // check that new target qubit indices do not cover new control qubit indices
    if(controlQubits.some(cq => targetQubits.indexOf(cq) > -1)) {
      throw new Error(`Error setting target qubits: target qubit is same as control qubit`);
    }
    // check that new control qubit indices do not cover new target qubit indices
    if(targetQubits.some(cq => controlQubits.indexOf(cq) > -1)) {
      throw new Error(`Error setting control qubits: target qubit is same as control qubit`);
    }
    // check that we always have correct number of target qubits
    if(targetQubits.length != this.numTargetQubits) {
      throw new Error(`Error setting target qubits: number of indices does not match number of target qubits`);
    }
    // check that its in correct range of target qubits
    if(controlQubits.length < this.numControlQubits[0] || controlQubits.length > this.numControlQubits[1]) {
      throw new Error(`Error setting control qubits: number of control qubits must be between ${this.numControlQubits[0]} and ${this.numControlQubits[1]}`)
    }
    // check that all indices are valid
    if(targetQubits.some(idx => idx < 0) || controlQubits.some(idx => idx < 0)) {
      throw new Error(`Error setting qubitss: idxs are not allowed to be < 0`)
    }
    // set data
    this._targetQubits  = targetQubits;
    this._controlQubits = controlQubits;

    this._notifyChange();
  }

  /**
   * Convenience function to create control qubit
   * @param qubit - index of qubit to add control to
   */
  public addControl(qubit: number) {
    return this.setQubits(
      this.targetQubits,
      this._controlQubits.filter(e => e != qubit).concat(qubit)
    )
  }

  /**
   * Convenience function to remove control qubit
   * @param qubit - index of qubit to add control to
   */
  public removeControl(qubit: number) {
    return this.setQubits(
      this.targetQubits,
      this._controlQubits.filter(e => e != qubit)
    )
  }

  /**
   * Get all qubit indices occupied (target and control)
   * @returns
   */
  public getQubits(): number[] {
    return (<number[]>[]).concat(...this.targetQubits, ...this.controlQubits).sort();
  }

  /**
   * Get first qubit index occupied (target and control)
   * @returns
   */
  public getFirstQubit(): number {
    return Math.min(...this.getQubits());
  }

  /**
   * Get first qubit index occupied (target and control)
   * @returns
   */
  public getLastQubit(): number {
    return Math.max(...this.getQubits());
  }

  /**
   * Get number of qubits covered. Note that this is different
   * from the number of qubits occupied, because it also includes
   * the qubits lying between the occupied qubits
   */
  public getNumQubitsCovered() {
    return this.getLastQubit() - this.getFirstQubit() + 1;
  }

  /**
   * Convenience function to shift all qubits by given offset
   * @param offset - value to shift qubits
   */
  public shift(offset: number) {
    // make sure we do not move out of bounds
    if(this.getFirstQubit() + offset < 0) {
      throw new Error('Error shifting qubits: shift would move qubits below 0')
    }
    // we use this._ directly to avoid checking of overrides
    this._controlQubits = this._controlQubits.map(el => el + offset);
    this._targetQubits = this._targetQubits.map(el => el + offset);

    this._notifyChange();
  }

  /**
   * Do work required on every update (rerender, publish change event)
   */
  private _notifyChange() {
    this._render();  // rerender on every change
    this.change.next();
  }

  private _png: string | null = null;
  /**
   * SVG Object representing current operation.
   * Note that the operation will always start at top of SVG image,
   * even if first qubit index > 0.You need to add the distance to top in the composer.
   */
  get png(): string | null {
    return this._png;
  }

  /**
   * Render current state of operation to SVG object
   */
  private _render() {

    // We will render image as first qubit would be on 0.
    // Therefore we need to substract minQubit from all other qubits
    const minQubit         = this.getFirstQubit();
    const numQubitsCovered = this.getNumQubitsCovered();

    const renderer = new OperationRenderer(this.properties.relativeWidth || 1, numQubitsCovered, -1, this.properties.whiteBackground);

    // add controls
    if(this._controlQubits.length > 0) {
      renderer.addControls(this._controlQubits.map(c => c - minQubit), this.properties.color)
    }

    // add target
    switch (this.type) {
      /** Special: NOT */
      case OperationType.NOT:
        renderer.addNot(this._targetQubits[0] - minQubit, this.properties.color);
        break;
      /** Special: SWAP */
      case OperationType.SWAP:
        renderer.addSwap(this._targetQubits[0] - minQubit, this._targetQubits[1] - minQubit, this.properties.color)
        break;
      /** Else: General Target */
      default:
        const text2 = this.parameterValues.length > 0 ? '(' + this.parameterValues.join(',') + ')' : undefined;
        renderer.addGeneralTarget(this._targetQubits.map(t => t-minQubit), this.properties.color, this.properties.text, text2);
        break;
    }

    renderer.canvas.renderAll();

    this.canvas = renderer.canvas.toCanvasElement();

    // save svg
    this._png = renderer.canvas.toDataURL({
      format: 'png'
    })
  }

  public canvas: HTMLCanvasElement | undefined;

  /**
   * Export values for operation
   * @returns
   */
  public export(): OperationData {
    return {
      controlQubits: this._controlQubits,
      targetQubits: this._targetQubits,
      type: this.type,
      parameterValues: this.parameterValues,
      id: this.id
    }
  }

  /**
   * Create an Operation object from operation data
   * @param operationData
   * @returns
   */
  public static fromData(operationData: OperationData, renderWithWhiteBackground: boolean) {
    const properties = OperationProperties[operationData.type];
    const newOperation = new Operation(properties);
    newOperation.properties.whiteBackground = renderWithWhiteBackground;
    newOperation.setQubits(operationData.targetQubits, operationData.controlQubits);
    operationData.parameterValues.map((value, idx) => {
      newOperation.setParameter(properties.parameters[idx].name, value);
    })
    return newOperation;
  }

}
