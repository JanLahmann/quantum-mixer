import { fabric } from 'fabric';

export class OperationRenderer {

  public readonly viewWidth: number;
  public readonly viewHeight: number;
  public readonly qubitHeight: number;
  public readonly qubitWidth: number;
  public readonly padding: number;
  public readonly canvas: fabric.StaticCanvas;

  constructor(relativeWidth: number, numCoveredQubits: number, padding: number = -1, renderWithWhiteBackground: boolean = false) {
    this.qubitHeight = 150;
    this.qubitWidth  = relativeWidth*this.qubitHeight;
    this.viewHeight  = numCoveredQubits * this.qubitHeight;
    this.viewWidth   = this.qubitWidth;
    this.padding     = padding >= 0 ? padding : 0.1*this.qubitHeight;
    this.canvas = new fabric.StaticCanvas(null, {
      width: this.viewWidth,
      height: this.viewHeight,
      backgroundColor: renderWithWhiteBackground ? 'white' : 'transparent'
    })
  }

  addControls(controlQubits: number[], color: string) {
    // connection line: in center of image, always from top to bottom (independent of where control qubits are)
    this.canvas.add(new fabric.Line([this.viewWidth/2, this.qubitHeight/2, this.viewWidth/2, this.viewHeight - this.qubitHeight/2], {
      strokeWidth: 0.05*this.qubitHeight,
      stroke: color,
      width: 0,
      originX: 'center'
    }));

    // create control qubits as circles
    for(let control of controlQubits) {
      this.canvas.add(new fabric.Circle({
        radius: 0.12*this.qubitHeight,
        fill: color,
        top: (0.5+control)*this.qubitHeight,
        left: this.viewWidth/2,
        originX: 'center',
        originY: 'center',
        strokeWidth: 0
      }))
    }
  }

  addNot(qubit: number, color: string = 'rgb(83, 139, 247)') {
    // add large blue circle
    this.canvas.add(new fabric.Circle({
      radius: this.qubitWidth/2 - this.padding,
      fill: color,
      top: (qubit+0.5)*this.qubitHeight,
      left: this.viewWidth/2,
      originX: 'center',
      originY: 'center',
      strokeWidth: 0
    }))
    // add cross to circle (text +)
    this.canvas.add(new fabric.Text('+', {
      lineHeight: 0.8*this.qubitHeight,
      textAlign: 'center',
      top: (qubit+0.5)*this.qubitHeight,
      left: this.viewWidth/2,
      originX: 'center',
      originY: 'center',
      fontSize: 0.8*this.qubitHeight
    }))
  }

  addSwap(qubit1: number, qubit2: number, color: string = 'rgb(83, 139, 247)') {
    const swapPadding = 0.3*this.qubitHeight;
    const strokeWidth = 0.05*this.qubitHeight;
    // add crosses
    for(let qubit of [qubit1, qubit2]) {
      this.canvas.add(new fabric.Line([swapPadding, swapPadding, this.qubitHeight-swapPadding, this.qubitHeight-swapPadding], {
        left: this.viewWidth/2,
        top: (qubit+0.5)*this.qubitHeight,
        originX: 'center',
        originY: 'center',
        stroke: color,
        strokeWidth: strokeWidth
      }));
      this.canvas.add(new fabric.Line([this.qubitHeight-swapPadding, swapPadding, swapPadding, this.qubitHeight-swapPadding], {
        left: this.viewWidth/2,
        top: (qubit+0.5)*this.qubitHeight,
        originX: 'center',
        originY: 'center',
        stroke: color,
        strokeWidth: strokeWidth
      }));
    }
    // draw connection line
    this.canvas.add(new fabric.Line([this.viewWidth/2, (qubit1+0.5)*this.qubitHeight, this.viewWidth/2, (qubit2+0.5)*this.qubitHeight], {
      strokeWidth: strokeWidth,
      stroke: color,
      width: 0,
      originX: 'center'
    }));
  }

  addGeneralTarget(targetQubits: number[], color: string, text: string, text2?: string) {
    const firstTargetQubit = Math.min(...targetQubits);
    const lastTargetQubit  = Math.max(...targetQubits);
    const targetHeight = (lastTargetQubit-firstTargetQubit+1)*this.qubitHeight;
    // draw rectangle
    this.canvas.add(new fabric.Rect({
      width:  this.viewWidth - (2*this.padding),
      height: targetHeight - (2*this.padding),
      fill: color,
      strokeWidth: 0,
      left: this.viewWidth/2,
      top: firstTargetQubit*this.qubitHeight + this.padding,
      originX: 'center'
    }));
    // add main text
    const mainTextOffset = text2 ? -0.1*this.qubitHeight : 0;
    this.canvas.add(new fabric.Text(text, {
      lineHeight: 0.4*this.qubitHeight,
      textAlign: 'center',
      top: firstTargetQubit*this.qubitHeight + targetHeight/2 + mainTextOffset,
      left: this.viewWidth/2,
      originX: 'center',
      originY: 'center',
      fontFamily: 'IBM Plex Sans',
      fontSize: 0.4*this.qubitHeight
    }));
    // add text2
    if(text2) {
      this.canvas.add(new fabric.Text(text2, {
        lineHeight: 0.25*this.qubitHeight,
        textAlign: 'center',
        top: firstTargetQubit*this.qubitHeight + targetHeight/2 + 0.22*this.qubitHeight,
        left: this.viewWidth/2,
        originX: 'center',
        originY: 'center',
        fontFamily: 'IBM Plex Sans',
        fontSize: 0.25*this.qubitHeight
      }))
    }
  }


}

