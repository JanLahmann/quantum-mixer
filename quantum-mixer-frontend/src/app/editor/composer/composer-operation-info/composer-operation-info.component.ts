import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Operation } from '../../model/operation';

@Component({
  selector: 'app-composer-operation-info',
  templateUrl: './composer-operation-info.component.html',
  styleUrls: ['./composer-operation-info.component.scss']
})
export class ComposerOperationInfoComponent implements OnChanges {

  @Input('numQubits') numQubits: number = 0;
  @Input('operation') operation: Operation | null = null;

  numTargetQubits: number = 0;
  minNumControlQubits: number = 0;
  maxNumControlQubits: number = 0;

  public tmpTargetQubits: number[] = [];
  public tmpRemoved: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    const newOperation = (<Operation|null>changes['operation'].currentValue);
    if(newOperation) {
      this.numTargetQubits = newOperation.properties.numTargetQubits;
      this.minNumControlQubits = newOperation.properties.numControlQubits[0];
      this.maxNumControlQubits = newOperation.properties.numControlQubits[1];
      this.tmpTargetQubits = newOperation.targetQubits;
      this.tmpRemoved = null
    }
  }

  handleTargetQubitChange(inputEl: HTMLInputElement, clickedIdx: number) {
    if(!this.operation) {
      return;
    }

    if(this.operation.numTargetQubits == 1 && clickedIdx != this.operation.targetQubits[0]) {
      // single qubit hack: mimick a removal before
      this.tmpRemoved = this.operation.targetQubits[0];
      this.tmpTargetQubits = []; // this will allow us to do the same for 1 and many target qubits
    }

    // if we click on existing temporarily remove it (but only one at a time)
    if(this.tmpTargetQubits.indexOf(clickedIdx) > -1 && this.tmpTargetQubits.length == this.operation.numTargetQubits) {
      this.tmpTargetQubits = this.tmpTargetQubits.filter(q => q != clickedIdx);
      this.tmpRemoved = clickedIdx;
      inputEl.checked = false;
      return;
    }

    // if we click on empty and temporarily have one less as expected: add and update
    if(this.tmpTargetQubits.indexOf(clickedIdx) == -1 && this.tmpTargetQubits.length < this.operation.numTargetQubits) {
      // if there is a control qubit at new position, switch it with previous
      let newControlQubits = this.operation.controlQubits;
      if(newControlQubits.indexOf(clickedIdx) > -1) {
        newControlQubits = newControlQubits.filter(el => el != clickedIdx);
        if(this.tmpRemoved !== null) {
          newControlQubits.push(this.tmpRemoved);
        }
      }
      // mark as checked
      this.tmpTargetQubits.push(clickedIdx);
      inputEl.checked = true;
      // update
      this.operation.setQubits(this.tmpTargetQubits, newControlQubits);
      // unset
      this.tmpRemoved = null;
      this.tmpTargetQubits = this.operation.targetQubits;
      return;
    }

    // default: prevent
    inputEl.checked = false;
  }

  handleControlQubitChange(inputEl: HTMLInputElement, clickedIdx: number) {
    if(!this.operation) {
      return;
    }
    let newControlQubits = this.operation.controlQubits;
    // toggle
    if(newControlQubits.indexOf(clickedIdx) > -1) {
      newControlQubits = newControlQubits.filter(el => el != clickedIdx);
    } else {
      newControlQubits.push(clickedIdx);
    }
    // try to set
    try {
      this.operation.setQubits(this.operation.targetQubits, newControlQubits);
    }
    catch(error) {
      console.warn("Tried to set invalid control qubits", error);
    }
    finally {
      inputEl.checked = this.operation.controlQubits.indexOf(clickedIdx) > -1;
    }
  }

}
