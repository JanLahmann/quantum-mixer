import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Composer } from '../composer';
import { ComposerCatalogueType, createOperations } from '../composer-catalogue';
import { CircuitData } from '../circuit';
import { Unsubscribable } from 'rxjs';

export interface ComposerDragData {
  type: 'qo-move' | 'qo-add',
  catalogueType?: ComposerCatalogueType,
  operationId?: string,
  dragOffset: number,
  qubitsCovered: number
}

@Component({
  selector: 'app-composer-main',
  templateUrl: './composer-main.component.html',
  styleUrls: ['./composer-main.component.scss']
})
export class ComposerMainComponent implements OnInit, OnDestroy {


  @ViewChild('operationsContainer') operationsContainer: ElementRef<HTMLDivElement> | undefined;
  public composer = new Composer();

  /** Supported Qubit Operation Types */
  public ComposerCatalogueType = ComposerCatalogueType;

  /** if true, enable drop zones and listen for drops */
  public isDragging: boolean = false;
  /** show info field to the right */
  public hasInfo: boolean = false;

  @Output('change') change: EventEmitter<CircuitData> = new EventEmitter();
  private _changeSub: Unsubscribable | null = null;

  ngOnInit() {
    this._changeSub = this.composer.change.subscribe(_ => {
      this.change.emit(this.composer.export());
    })
  }

  /**
   * Load circuit data
   * @param data
   */
  loadCircuit(data: CircuitData) {
    return this.composer.load(data);
  }

  /**
   * Reset all internal values for drag and drop functionality
   */
  resetDragDrop() {
    this.isDragging = false;
    this.hasInfo = false;
    this.currentDragZoneOver = -1;
    document.querySelectorAll('.dragging-operation').forEach(el => el.classList.remove('dragging-operation'));
  }

  /**
   * Start dragging of buttons/icons to add new operations to the composer.
   * @param ev
   * @param catalogueType
   */
  handleNewOperationDragStart(ev: DragEvent, catalogueType: ComposerCatalogueType) {

    // init drag
    this.isDragging = true;
    this.hasInfo = false;

    // create new operation
    const newOperation = createOperations(catalogueType)[0];
    newOperation.whiteBackground = true;

    if(ev.dataTransfer) {

      // Clear the drag data cache (for all formats/types)
      ev.dataTransfer.clearData();
      ev.dataTransfer.effectAllowed = 'move';
      // create preview
      // The element needs to be visible, so we will add it to the view for 100ms
      const element = document.getElementById('composer-newoperation-render');
      element!.style.width = this.cssRelValue(newOperation.properties.relativeWidth);
      element!.style.height = this.cssRelValue(newOperation.getNumQubitsCovered());
      element?.classList.add('active');
      element!.innerHTML = newOperation.svg!.svg();
      ev.dataTransfer.setDragImage(element!, 0, 0);
      setTimeout(() => {
        element?.classList.remove('active');
      }, 100)

      // Set drag data
      ev.dataTransfer.setData('qo-json', JSON.stringify(<ComposerDragData>{
        type: 'qo-add',
        catalogueType: catalogueType,
        dragOffset: 0,
        qubitsCovered: newOperation.getNumQubitsCovered()
      }));
    }
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
    this.isDragging = true;
    this.hasInfo = true; // required to enable delete button

    if(ev.dataTransfer) {
      // Clear the drag data cache (for all formats/types)
      ev.dataTransfer.clearData();
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.setDragImage(<any>ev.target, isFinite(qubitHeight) ? qubitHeight/2 : 0, (<any>ev).layerY || 0);
      const operation = this.composer.getOperationById(opId)!;
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
    return qubitIdx >= 0 && (qubitIdx + qubitsCovered <= this.composer.numQubits);
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
  handleDropzoneDragOver(ev: DragEvent, qubitIdx: number, slot: number) {
    this.currentDragZoneOver = slot;
    ev.preventDefault();
    const evData = this._getDragData(ev);
    return evData ? this._isDropAllowed(qubitIdx - evData.dragOffset, evData.qubitsCovered) : false;
  }

  /**
   * Dragover handler for removal. Need to call preventDefault in order to allow for drops
   * @param ev
   */
  handleRemoveZoneDragOver(ev: DragEvent) {
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
  handleDropzoneDrop(ev: DragEvent, qubitIdx: number, slot: number) {
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
      const operation = this.composer.getOperationById(evData.operationId!)!;
      this.composer.removeOperation(evData.operationId!);
      this.composer.addOperations([operation], qubitIdx - evData.dragOffset, slot);
    }

    // if adding operation
    if(evData.type == 'qo-add' && evData.catalogueType) {
      const newOperations = createOperations(evData.catalogueType)
      this.composer.addOperations(newOperations, qubitIdx, slot);
    }
  }

  /**
   * Handle drops on removal zone (i.e. delete operation)
   * @param ev
   * @returns
   */
  handleRemoveZoneDrop(ev: DragEvent) {
    ev.preventDefault();
    this.resetDragDrop();
    // get data from drop
    const evData = this._getDragData(ev);
    if(!evData || !evData.operationId) {
      return;
    }
    // delete operation
    this.composer.removeOperation(evData.operationId);
  }

  /**
   * Reset everything if not dropped
   */
  handleDragEnd() {
    this.resetDragDrop();
  }

  /**
   * Get a CSS value relative to CSS variable `--qo-qubit-height`
   * @param value
   * @returns
   */
  cssRelValue(value?: number): string {
    if(!value) {
      return '0';
    }
    return `calc(${value} * var(--qo-qubit-height))`;
  }

  ngOnDestroy() {
    if(this._changeSub) {
      this._changeSub.unsubscribe();
    }
  }

}
