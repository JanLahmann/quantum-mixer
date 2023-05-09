import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { createOperations } from '../../model/composer-catalogue';
import { Unsubscribable } from 'rxjs';
import { Operation, OperationProperties, OperationType } from '../../model/operation';
import { EditorService } from '../../editor.service';
import { cssRelValue } from '../../../common/utils';
import { ComposerDragData, ComposerSlotViewData, ComposerViewData } from '../../model/composer';
import { ActivatedRoute } from '@angular/router';
import { UsecaseService } from 'src/app/usecase.service';

@Component({
  selector: 'app-composer-main',
  templateUrl: './composer-main.component.html',
  styleUrls: ['./composer-main.component.scss']
})
export class ComposerMainComponent implements OnInit, OnDestroy {

  constructor(public editorService: EditorService, private route: ActivatedRoute, private usecaseService: UsecaseService) {

  }

  /**
   * If set, show information and settings for this operation
   */
  public activeOperation: Operation | null = null;

  /**
   * Show additional panel
   */
  public showPanel: boolean = false;

  /**
   * View data
   */
  public viewData: ComposerViewData | null = null;

  /**
   * Subscription for circuit changes
   */
  private _changeSub: Unsubscribable | null = null;

  ngOnInit() {
    this._changeSub = this.editorService.circuit.change.subscribe(_ => {
      this._buildViewData();
    });

    this.route.params.subscribe(async param => {
      await this.usecaseService.initialLoadingPromise;
      if(param['catalogueid']) {
        const allCircuits = this.usecaseService.data?.initialCircuits.map(section => section.circuits).flat();
        const circuitData = allCircuits ? allCircuits.filter(circuit => circuit.id == param['catalogueid']) : [];
        if(circuitData.length > 0) {
          this.editorService.circuit.load(circuitData[0].data);
        }
      }
    })
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
    const slots = this.editorService.circuit.operations.length > 0 ? Math.max(...this.editorService.circuit.operations.map(op => op.slot)) : 0;
    // loop slots
    for(let slot = 0; slot <= slots; slot++) {
      const slotOperations = this.editorService.circuit.getOperationsForSlot(slot);
      const slotViewData: ComposerSlotViewData = {
        relativeWidth: slotOperations.length > 0 ? Math.max(...slotOperations.map(op => op.relativeWidth)) : 0,
        operations: this.editorService.circuit.getOperationsForSlot(slot).map(op => {
          const opSvg = op.svg?.svg();
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
    this.viewData = newViewData;
  }

  /**
   * Reset all internal values for drag and drop functionality
   */
  resetDragDrop() {
    this.editorService.isDragging = false;
    this.showPanel = false;
    this.currentDragZoneOver = -1;
    document.querySelectorAll('.dragging-operation').forEach(el => el.classList.remove('dragging-operation'));
  }

  /**
   * Start dragging of existing operations
   * @param ev
   * @param opId
   */
  handleOperationDragStart(ev: DragEvent, opId: string) {
    // calculate at which qubit the user grabbed the image (as an offset)
    const layerY: number = (<any>ev).layerY;
    const qubitHeight: number = +getComputedStyle(<any>ev.target).getPropertyValue('--qo-qubit-height').replace('px', '');
    const qubitDragOffset = (layerY && isFinite(qubitHeight)) ? Math.floor(layerY/qubitHeight) : 0;
    // mark item as being dragged
    (<HTMLDivElement>ev.target).classList.add('dragging-operation');
    this.editorService.isDragging = true;

    this.activeOperation = null; // set to null, will show delete instead
    this.showPanel = true; // required to enable delete button

    if(ev.dataTransfer) {
      // Clear the drag data cache (for all formats/types)
      ev.dataTransfer.clearData();
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.setDragImage(<any>ev.target, isFinite(qubitHeight) ? qubitHeight/2 : 0, (<any>ev).layerY || 0);
      const operation = this.editorService.circuit.getOperationById(opId)!;
      // Set drag data: id
      ev.dataTransfer.setData('qo-json', JSON.stringify(<ComposerDragData>{
        type: 'qo-move',
        operationId: opId,
        dragOffset: qubitDragOffset,
        qubitsCovered: operation.getNumQubitsCovered()
      }));
    }
  }

  /**
   * Extract drag data from current DragEvent
   * @param ev
   * @returns
   */
  private _getDragData(ev: DragEvent): ComposerDragData | undefined {
    const dataS = ev.dataTransfer?.getData('qo-json');
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
  private _isDropAllowed(qubitIdx: number | undefined, qubitsCovered: number | undefined) {
    if(qubitIdx === undefined || qubitsCovered === undefined) {
      return false;
    }
    return qubitIdx >= 0 && (qubitIdx + qubitsCovered <= this.editorService.circuit.numQubits);
  }

  /** While dragging, save the current slot the user is dragging over */
  public currentDragZoneOver: number = -1;

  /**
   * Dragover handler for drop zones. Need to call preventDefault in order to allow for drops
   * @param ev
   * @param qubitIdx
   * @param slot
   * @returns
   */
  public handleDropzoneDragOver(ev: DragEvent, qubitIdx: number, slot: number) {
    this.currentDragZoneOver = slot;
    ev.preventDefault();
    const evData = this._getDragData(ev);
    return evData ? this._isDropAllowed(qubitIdx - evData.dragOffset, evData.qubitsCovered) : false;
  }

  /**
   * Dragover handler for removal. Need to call preventDefault in order to allow for drops
   * @param ev
   */
  public handleRemoveZoneDragOver(ev: DragEvent) {
    this.currentDragZoneOver = -1;
    ev.preventDefault();
  }

  /**
   * Handle drops on dropzones. This handle both cases: new operations and existing operations
   * @param ev
   * @param qubitIdx
   * @param slot
   * @returns
   */
  public handleDropzoneDrop(ev: DragEvent, qubitIdx: number, slot: number) {
    ev.preventDefault();
    this.resetDragDrop();
    // get data from drop
    const evData = this._getDragData(ev);
    if(!evData) {
      return;
    }

    // if moving operation
    if(evData.type == 'qo-move') {
      // reset opacity
      document.getElementById('op-'+evData.operationId)!.style.opacity = '1';
      if(!this._isDropAllowed(qubitIdx - evData.dragOffset, evData.qubitsCovered)) {
        return;
      }
      const operation = this.editorService.circuit.getOperationById(evData.operationId!)!;
      this.editorService.circuit.removeOperation(evData.operationId!);
      this.editorService.circuit.addOperations([operation], qubitIdx - evData.dragOffset, slot);
    }

    // if adding operation
    if(evData.type == 'qo-add' && evData.catalogueType) {
      const newOperations = createOperations(evData.catalogueType)
      this.editorService.circuit.addOperations(newOperations, qubitIdx, slot);
    }
  }

  /**
   * Handle drops on removal zone (i.e. delete operation)
   * @param ev
   * @returns
   */
  public handleRemoveZoneDrop(ev: DragEvent) {
    ev.preventDefault();
    this.resetDragDrop();
    // get data from drop
    const evData = this._getDragData(ev);
    if(!evData || !evData.operationId) {
      return;
    }
    // delete operation
    this.editorService.circuit.removeOperation(evData.operationId);
  }

  /**
   * Reset everything if not dropped
   */
  public handleDragEnd() {
    this.resetDragDrop();
  }

  /**
   * Set active operation by id
   * @param opId
   */
  public setActiveOperation(opId: string) {
    const operation = this.editorService.circuit.getOperationById(opId);
    if(operation) {
      this.activeOperation = operation;
      this.showPanel = true;
    }
  }

  ngOnDestroy() {
    if(this._changeSub) {
      this._changeSub.unsubscribe();
    }
  }

  cssRelValue = cssRelValue

}
