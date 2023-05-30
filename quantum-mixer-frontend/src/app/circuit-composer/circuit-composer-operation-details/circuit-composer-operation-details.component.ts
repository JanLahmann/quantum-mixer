import { Component, Input, SimpleChanges } from '@angular/core';
import { Operation } from '../model/operation';
import { CircuitService } from '../circuit.service';

@Component({
  selector: 'app-circuit-composer-operation-details',
  templateUrl: './circuit-composer-operation-details.component.html',
  styleUrls: ['./circuit-composer-operation-details.component.scss']
})
export class CircuitComposerOperationDetailsComponent {

  // This has to be an input because we need to detect changes
  /** Operation to show details for. */
  @Input('operation') operation: Operation | null = null;

  /** Number of target qubits for operation. Set when `operation` changes. */
  public numTargetQubits: number = 0;
  /** Minimum number of control qubits for operation. Set when `operation` changes. */
  public minNumControlQubits: number = 0;
  /** Maximum number of control qubits for operarion. Set when `operation` changes. */
  public maxNumControlQubits: number = 0;
  /** Index of target qubit temporary removed */
  public tmpRemoved: number | null = null;

  public parameters: {name: string, options: {content: string, selected: boolean}[]}[] = [];

  constructor(public circuitService: CircuitService) {

  }


  ngOnChanges(changes: SimpleChanges): void {
    // get new operation
    const newOperation = (<Operation|null>changes['operation'].currentValue);
    if(newOperation) {
      // update numbers
      this.numTargetQubits     = newOperation.properties.numTargetQubits;
      this.minNumControlQubits = newOperation.properties.numControlQubits[0];
      this.maxNumControlQubits = newOperation.properties.numControlQubits[1];
      this.tmpRemoved          = null
      this.parameters          = newOperation.properties.parameters.map((p, i) => {
        return {
          name: p.name,
          options: p.options.map(option => {
            return {
              content: option,
              selected: option == newOperation.parameterValues[i]
            }
          })
        }
      })
    }
  }


  handleControlQubitClick(clickedIdx: number) {
    if(!this.operation) {
      return;
    }
    // get copy of control qubits
    let newControlQubits = this.operation.controlQubits;
    // if clicked on checked control qubit remove it from list
    if(newControlQubits.indexOf(clickedIdx) > -1) {
      newControlQubits = newControlQubits.filter(el => el != clickedIdx);
    }
    // if clicked on not-checked control qubit add it to list
    else {
      newControlQubits.push(clickedIdx);
    }
    // try to set
    try {
      this.operation.setQubits(this.operation.targetQubits, newControlQubits);
    }
    catch(err) {
      console.warn(`Error setting control qubits`, err);
    }
    finally {
    }

  }


  handleTargetQubitClick(clickedIdx: number) {
    if(!this.operation) {
      return;
    }

    // Idea: click on an existing target qubit to _temporarily_ remove it.
    // Then click on a non-exisiting target qubit to add the previosly removed qubit.
    // For operations with a single target qubit, this can be done in one step.

    // for operation with single target qubit: remove target qubit
    if(this.operation.numTargetQubits == 1 && clickedIdx != this.operation.targetQubits[0]) {
      this.tmpRemoved = this.operation.targetQubits[0];
    }

    // if click on existing: tmp remove it
    if(this.operation.targetQubits.indexOf(clickedIdx) > -1) {
      this.tmpRemoved = clickedIdx;
    }

    // if click on empty and had tmp removed before: update operation
    if(this.operation.targetQubits.indexOf(clickedIdx) == -1 && this.tmpRemoved !== null) {
      const newTargetQubits = this.operation.targetQubits.filter(q => q != this.tmpRemoved);
      newTargetQubits.push(clickedIdx);
      // if there was a control qubit at new position, switch with previous position of target qubit
      let newControlQubits = this.operation.controlQubits;
      if(newControlQubits.indexOf(clickedIdx) > -1) {
        newControlQubits = newControlQubits.filter(q => q != clickedIdx);
        newControlQubits.push(this.tmpRemoved);
      }
      // reset
      this.tmpRemoved = null;
      // update
      try {
        this.operation.setQubits(newTargetQubits, newControlQubits);
      }
      catch(err) {
        console.warn(`Error setting target qubits`, err);
      }
    }
  }

  setParameter(name: string, ev: any) {
    if(!ev || !ev.item) {
      return;
    }
    const value = ev.item.content;
    this.operation?.setParameter(name, value);
  }
}
