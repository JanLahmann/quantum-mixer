import { ReplaySubject } from "rxjs";
import { v4 as uuidv4 } from 'uuid';
import * as svg from '@svgdotjs/svg.js';


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
  IDENTITY = 'i'
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
    default: string
  }[],
  /** Color of operation in composer */
  color: string;
  /** Text inside main block */
  text: string;
  /** Relative width of main block */
  relativeWidth?: number;
}

export const OperationProperties: {[key in OperationType]: OperationProperties} = {
  [OperationType.HADAMARD]: {
    type: OperationType.HADAMARD,
    title: 'Hadamard',
    description: '',
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
    description: '',
    numTargetQubits: 1,
    numControlQubits: [0, 2],
    parameters: [],
    color: 'rgb(83, 139, 247)',
    text: '+',
    relativeWidth: 1.0
  },
  [OperationType.Z]: {
    type: OperationType.Z,
    title: 'Z',
    description: '',
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
    description: '',
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
    description: '',
    numTargetQubits: 1,
    numControlQubits: [0, 2],
    parameters: [{
      name: 'lambda',
      default: 'pi/2'
    }],
    color: 'rgb(239, 184, 230)',
    text: 'RY',
    relativeWidth: 1.0
  }
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


// some constants for SVG creation, note that this only affects the relation
/** Height of a qubit line. This is our main reference point */
const QUBIT_HEIGHT = 100;
/** Radius of control qubit (relative to 100) */
const CONTROL_RADIUS = 20;
/** Width of connection between control and target qubit (relative to 100) */
const CONNECTION_WIDTH = 5;
/** Padding for target blocks */
const TARGET_PADDING = 5;
/** Font size */
const FONT_SIZE = 25;
const FONT_SIZE_PARAMS = 10;

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
    this.properties       = properties;

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
    this._renderSvg();  // rerender on every change
    console.log('change', this.id);
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

    const operationWidth = (this.properties.relativeWidth || 1)*QUBIT_HEIGHT;

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
        color: this.properties.color
      });
      // create control qubits as circles
      for(let control of this.controlQubits) {
        qoSvg.circle(CONTROL_RADIUS).fill(this.properties.color).move(0.5*operationWidth - CONTROL_RADIUS/2, (0.5+control-minQubit)*QUBIT_HEIGHT - CONTROL_RADIUS/2);
      }
    }

    // create target block
    const firstTargetQubit = Math.min(...this._targetQubits)-minQubit;
    const lastTargetQubit = Math.max(...this._targetQubits)-minQubit;
    const targetHeight = (lastTargetQubit-firstTargetQubit+1)*QUBIT_HEIGHT
    const targetFromTop = firstTargetQubit*QUBIT_HEIGHT;

    // special treatment for not
    if(this.type == OperationType.NOT) {
      qoSvg.circle(operationWidth-(2*TARGET_PADDING)).fill(this.properties.color).move(TARGET_PADDING, targetFromTop+TARGET_PADDING).stroke({width: 0});
      qoSvg.text(t => {
        t.tspan(this.properties.text).dx("50%").y(targetFromTop + targetHeight/2 - 0.08*QUBIT_HEIGHT);
      }).font({
        size: 0.8*QUBIT_HEIGHT,  // actual font size is 0.6*size, dont ask me why
        leading: 1.0,
        weight: 'lighter'
      }).attr({
        "dominant-baseline": "central",
        "text-anchor": "middle"
      });
    }
    else {
      qoSvg.rect(operationWidth-(2*TARGET_PADDING), targetHeight-(2*TARGET_PADDING)).fill(this.properties.color).move(TARGET_PADDING, targetFromTop+TARGET_PADDING).stroke({width: 0});
      // add text for main block
      const offsetForParameters = (this.parameterValues.length > 0) ? 0.8*FONT_SIZE_PARAMS : 0;
      qoSvg.text(t => {
        t.tspan(this.properties.text).dx("50%").y(targetFromTop + targetHeight/2 - offsetForParameters);
      }).font({
        size: FONT_SIZE/0.6,  // actual font size is 0.6*size, dont ask me why
        leading: 1.0
      }).attr({
        "dominant-baseline": "central",
        "text-anchor": "middle"
      });
      if(this.parameterValues.length > 0) {
        const parameterStr = '(' + this.parameterValues.join(',') + ')'
        qoSvg.text(t => {
          t.tspan(parameterStr).dx("50%").y(targetFromTop + targetHeight/2 + 0.8*FONT_SIZE);
        }).font({
          size: FONT_SIZE_PARAMS/0.6,
          leading: 1.0
        }).attr({
          "dominant-baseline": "central",
          "text-anchor": "middle"
        });
      }
    }
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

  /**
   * Create an Operation object from operation data
   * @param operationData
   * @returns
   */
  public static fromData(operationData: OperationData) {
    const properties = OperationProperties[operationData.type];
    const newOperation = new Operation(properties);
    newOperation.setQubits(operationData.targetQubits, operationData.controlQubits);
    operationData.parameterValues.map((value, idx) => {
      newOperation.setParameter(properties.parameters[idx].name, value);
    })
    return newOperation;
  }

}
