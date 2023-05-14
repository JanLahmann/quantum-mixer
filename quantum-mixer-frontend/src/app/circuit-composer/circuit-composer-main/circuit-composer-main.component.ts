import { Component } from '@angular/core';
import { CircuitService } from '../circuit.service';
import { cssRelValue } from 'src/app/common/utils';
import { Operation } from '../model/operation';
import { createOperations } from '../model/composer-catalogue';
import { ComposerDragData } from '../model/composer';

@Component({
  selector: 'app-circuit-composer-main',
  templateUrl: './circuit-composer-main.component.html',
  styleUrls: ['./circuit-composer-main.component.scss']
})
export class CircuitComposerMainComponent {

  public activeOperation: Operation | undefined;
  public qubitHeight: number;
  public activeSlot: number | null = null;
  public showRemove: boolean = false;

  constructor(public circuitService: CircuitService) {
    // store value of --qo-qubit-height
    this.qubitHeight = +getComputedStyle(document.documentElement).getPropertyValue('--qo-qubit-height').replace('px', '');
  }

  cssRelValue = cssRelValue;

  /**
   * Toggle Active Operation
   * @param operationId
   */
  public toggleActiveOperation(operationId: string) {
    if(this.activeOperation && this.activeOperation.id == operationId) {
      this.activeOperation = undefined;
    } else {
      const op = this.circuitService.circuit.getOperationById(operationId);
      this.activeOperation = op ? op : undefined;
    }
  }

  /**
   * Extract drag data from current DragEvent
   * @param ev
   * @returns
   */
  private getDragData(ev: DragEvent): ComposerDragData | undefined {
    const dataS = ev.dataTransfer?.getData('text/plain');
    const data: ComposerDragData | null = dataS ? JSON.parse(dataS) : null;
    if(data && (data.type == 'qo-move' || data.type == 'qo-add')) {
      return data;
    } else {
      return undefined;
    }
  }

  /**
   * Check if drop is allowed (i.e. if drop would be out of bounds)
   * @param qubitIdx
   * @param qubitsCovered
   * @returns
   */
  private isDropAllowed(qubitIdx: number | undefined, qubitsCovered: number | undefined) {
    if(qubitIdx === undefined || qubitsCovered === undefined) {
      return false;
    }
    return qubitIdx >= 0 && (qubitIdx + qubitsCovered <= this.circuitService.circuit.numQubits);
  }

  /**
   * Handle drops on dropzones. This handle both cases: new operations and existing operations
   * @param ev
   * @param qubitIdx
   * @param slot
   * @returns
   */
  public handleDropzoneDrop(ev: DragEvent, qubitIdx: number, slot: number) {

    // get data from drop
    const evData = this.getDragData(ev);
    if(!evData) {
      return;
    }

    // check if drop allowed
    if(!this.isDropAllowed(qubitIdx - evData.dragOffset, evData.qubitsCovered)) {
      return;
    }

    // if moving operation
    if(evData.type == 'qo-move') {
      // remove and add operation at correct place
      const operation = this.circuitService.circuit.getOperationById(evData.operationId!)!;
      this.circuitService.circuit.removeOperation(evData.operationId!);
      this.circuitService.circuit.addOperations([operation], qubitIdx - evData.dragOffset, slot);
    }

    // if adding operation
    if(evData.type == 'qo-add' && evData.catalogueType) {
      const newOperations = createOperations(evData.catalogueType)
      this.circuitService.circuit.addOperations(newOperations, qubitIdx, slot);
    }

    this.activeSlot = null;
  }

  /**
   * Start dragging of existing operations
   * @param ev
   * @param opId
   */
  handleOperationDragStart(ev: Pick<DragEvent, 'dataTransfer'>, opId: string) {
    // get offset data from draggable event
    const dataString = ev.dataTransfer?.getData('_draggable');
    const data = dataString ? JSON.parse(dataString) : null;
    const qubitDragOffset = data ? Math.floor(Math.abs(data.calculatedDragElementOffset.y)/this.qubitHeight) : 0;
    // set drag data
    const operation = this.circuitService.circuit.getOperationById(opId)!;
    ev.dataTransfer?.setData('text/plain', JSON.stringify(<ComposerDragData>{
      type: 'qo-move',
      operationId: opId,
      dragOffset: qubitDragOffset,
      qubitsCovered: operation.getNumQubitsCovered()
    }));
    // show remove section
    this.showRemove = true;
    this.activeOperation = undefined;
  }

  /**
   * Stop operation dragging
   */
  handleOperationDragEnd() {
    this.activeSlot = null;
    this.activeOperation = undefined;
    this.showRemove = false;
  }


  /**
   * Handle drop on remove
   * @param ev
   */
  handleRemovezoneDrop(ev: DragEvent) {
    // get data from drop
    const evData = this.getDragData(ev);
    console.log(evData);
    if(!evData || !evData.operationId) {
      return;
    }
    // delete operation
    this.circuitService.circuit.removeOperation(evData.operationId);
  }

}
