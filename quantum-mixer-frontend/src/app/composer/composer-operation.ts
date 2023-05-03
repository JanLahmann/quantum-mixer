import { ReplaySubject } from "rxjs";
import { OperationData, OperationType } from "./operation";
import { v4 as uuidv4 } from 'uuid';
import * as svg from '@svgdotjs/svg.js';
import * as math from "mathjs";

/** Options to create ComposerOperations from */
export interface ComposerOperationOptions {
  /** Base type of operation (without controls) */
  type: OperationType;
  /** Number of target qubits. Can not be changed. */
  numTargetQubits: number;
  /** Number of control qubits. First number is minimum, second is maximum and third number is default */
  numControlQubits: number[];
  /** Parameters */
  parameters: {name: string, default: string}[];
  /** Color of operation in composer */
  color: string;
  /** Text inside main block */
  text: string;
  /** Relative width of main block */
  relativeWidth: number;
}

// some constants for SVG creation, note that this only affects the relation
/** Height of a qubit line. This is our main reference point */
const QUBIT_HEIGHT = 100;
/** Radius of control qubit (relative to 100) */
const CONTROL_RADIUS = 20;
/** Width of connection between control and target qubit (relative to 100) */
const CONNECTION_WIDTH = 5;


export class ComposerOperation implements OperationData {

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

  /** All QubitOptions used for initialization */
  public readonly options: ComposerOperationOptions;


  constructor(options: ComposerOperationOptions) {
    // create id
    this.id   = uuidv4();

    // save options
    this.type             = options.type;
    this.numControlQubits = options.numControlQubits;
    this.numTargetQubits  = options.numTargetQubits;
    this._parameters      = options.parameters.map(p => {
      return {
        name: p.name,
        default: p.default,
        value: p.default
      }
    })
    this.options          = options;

    // initialize
    this.init(0);
  }

  /** List of parameters with their default and actual value */
  private _parameters: {name: string, default: string, value: string}[];
  get parameterValues(): number[] {
    return this._parameters.map(p => p.value).map(val => math.evaluate(`${val}`));
  }

  private _targetQubits: number[] = [];
  get targetQubits(): number[] {
    return this._targetQubits;
  }

  private _controlQubits: number[] = [];
  get controlQubits(): number[] {
    return this._controlQubits;
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
   * Convenience function to move control qubit
   * @param qubit - source index of control
   * @param newQubit - target index of control
   */
  public moveControl(qubit: number, newQubit: number) {
    return this.setQubits(
      this.targetQubits,
      this._controlQubits.filter(e => e != qubit).concat(newQubit)
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
   * Initialize operation arount a start qubits
   * @param startQubit
   */
  public init(startQubit: number) {
    // first add all target qubits below each other.
    this._targetQubits = Array<void>(this.numTargetQubits).fill().map((_, i) => i+startQubit);
    // then add all control qubits below
    const firstControlQubit = this.targetQubits[this.targetQubits.length - 1] + 1;
    this._controlQubits = Array<void>(this.numControlQubits[2]).fill().map((_, i) => i+firstControlQubit);
    this._notifyChange();
  }

  /**
   * Do work required on every update (rerender, publish change event)
   */
  private _notifyChange() {
    this._renderSvg();  // rerender on every change
    this.change.next();
  }

  private _svg: svg.Svg | null = null;
  /**
   * SVG Object representing current operation.
   * Note that the operation will always start at top of SVG image,
   * even if first qubit index > 0.You need to add the distance to top in the composer.
   */
  get svg(): svg.Svg | null {
    return this._svg;
  }

  private _whiteBackground: boolean = false;
  /**
   * Create SVG with white background. This is especially useful for drag-and-drop previews
   */
  get whiteBackground(): boolean {
    return this._whiteBackground;
  }
  set whiteBackground(wb: boolean) {
    this._whiteBackground = wb;
    this._notifyChange();
  }

  /**
   * Render current state of operation to SVG object
   */
  private _renderSvg() {

    // We will render image as first qubit would be on 0.
    // Therefore we need to substract minQubit from all other qubits
    const minQubit  = this.getFirstQubit();
    const numQubitsCovered = this.getNumQubitsCovered();

    const operationWidth = this.options.relativeWidth*QUBIT_HEIGHT;

    // setup view
    const qoSvg = svg.SVG();
    qoSvg.viewbox(0, 0, operationWidth, numQubitsCovered*QUBIT_HEIGHT);

    // create background rectangle
    qoSvg.rect(operationWidth, numQubitsCovered*QUBIT_HEIGHT).fill(this._whiteBackground ? 'white' : 'transparent');

    // if we have controls, create connection line and controls
    if(this._controlQubits.length > 0) {
      // connection line: in center of image, always from top to bottom (independent of where control qubits are)
      qoSvg.line(operationWidth/2, QUBIT_HEIGHT/2, operationWidth/2, QUBIT_HEIGHT*(numQubitsCovered - 0.5)).stroke({
        width: CONNECTION_WIDTH,
        color: this.options.color
      });
      // create control qubits as circles
      for(let control of this.controlQubits) {
        qoSvg.circle(CONTROL_RADIUS).fill(this.options.color).move(0.5*operationWidth - CONTROL_RADIUS/2, (0.5+control-minQubit)*QUBIT_HEIGHT - CONTROL_RADIUS/2);
      }
    }

    // create target block
    const firstTargetQubit = Math.min(...this._targetQubits)-minQubit;
    const lastTargetQubit = Math.max(...this._targetQubits)-minQubit;
    const targetHeight = (lastTargetQubit-firstTargetQubit+1)*QUBIT_HEIGHT
    const targetFromTop = firstTargetQubit*QUBIT_HEIGHT;
    qoSvg.rect(operationWidth, targetHeight).fill(this.options.color).move(0, targetFromTop).stroke({width: 0})

    // create text element
    qoSvg.text(t => {
      t.tspan(this.options.text).dx("50%").dy(targetFromTop+(targetHeight/2)).font({
        anchor: 'middle'
      }).attr('dominant-baseline', 'middle')
    }).font({
      size: 50,
      leading: 1.0
    });

    // save svg
    this._svg = qoSvg;
  }

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

}
