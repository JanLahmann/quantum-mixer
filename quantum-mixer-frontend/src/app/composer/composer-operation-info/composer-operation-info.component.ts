import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Operation } from '../operation';

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

  error: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    const newOperation = (<Operation|null>changes['operation'].currentValue);
    if(newOperation) {
      this.numTargetQubits = newOperation.properties.numTargetQubits;
      this.minNumControlQubits = newOperation.properties.numControlQubits[0];
      this.maxNumControlQubits = newOperation.properties.numControlQubits[1];
    }
  }

  handleTargetQubitChange(inputEl: HTMLInputElement, clickedIdx: number) {
    if(this.operation && this.numTargetQubits == 1) {
      // if we have a control qubit at this position swap it with target
      let newControlQubits = this.operation.controlQubits;
      if(newControlQubits.indexOf(clickedIdx) > -1) {
        newControlQubits = newControlQubits.filter(el => el != clickedIdx);
        newControlQubits.push(this.operation.targetQubits[0]);
      }
      this.operation?.setQubits([clickedIdx], newControlQubits);
      inputEl.checked = true;
    }
    // TODO: handle operations with multiple target qubits
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
