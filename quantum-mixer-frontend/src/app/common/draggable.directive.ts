import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

export interface CustomPointerEvent {
  originalPointerEvent: PointerEvent
}

@Directive({
  selector: '[appDraggable]'
})
export class DraggableDirective {

  /** Boolean to check if dragging was started (by pointer-down event) */
  private isDragging: boolean = false;
  /** Element which follows the cursor while dragging (like setDragImage) */
  private dragElement: HTMLElement | undefined;
  /** Emulate drag data */
  private dragDataTransfer: DataTransfer | null = null;

  /** Absolute dimensions of drag element (in px) */
  private dragElementDimensions: {width: number, height: number} = {width: 0, height: 0};
  /** Absolute offset values in px for drag element (calculated from input which can reference percentages) */
  private calculatedDragElementOffset: {x: number, y: number} = {x: 0, y: 0}

  /** List of nodes the dragging is currently over */
  private dragOverElements: HTMLElement[] = [];


  /** Image source (URL, data URL) to use as drag image */
  @Input('dragImage') dragImage : string | null = null;
  /** Size of drag image (use with dragImage) */
  @Input('dragImageSize') dragImageSize: {width: number, height: number} = {width: 0, height: 0};
  /** Offset for drag element (dragImage and HTML element), string can contain percentage value */
  @Input('dragElementOffset') dragElementOffset : {x: number | string, y: number | string} = {x: 0, y: 0};

  /** Drop target elements */
  @Output('dropTargets') dropTarget: EventEmitter<HTMLElement[]> = new EventEmitter();
  /** Drag Over target elements */
  @Output('dragOverTargets') dragOverTargets: EventEmitter<HTMLElement[]> = new EventEmitter();
  /** Drag Enter target elements */
  @Output('dragEnterTargets') dragEnterTargets: EventEmitter<HTMLElement[]> = new EventEmitter();
  /** Drag Leave target elements */
  @Output('dragLeaveTargets') dragLeaveTargets: EventEmitter<HTMLElement[]> = new EventEmitter();

  /** Drag start */
  @Output('dragstart') dragStarted: EventEmitter<{originalPointerEvent: PointerEvent, dataTransfer: DataTransfer}> = new EventEmitter();
  /** Drag start */
  @Output('dragend') dragEnded: EventEmitter<{originalPointerEvent: PointerEvent, dataTransfer: DataTransfer}> = new EventEmitter();

  constructor(private element: ElementRef) {
    this.element.nativeElement.style.touchAction = 'none';
  }

  /**
   * Find all HTML elements below current cursor. Filters for elements with data-drop attribute.
   * @param ev
   * @returns
   */
  private findElementsUnderPointer(ev: PointerEvent): HTMLElement[] {
    let elements = document.elementsFromPoint(ev.clientX, ev.clientY) as HTMLElement[];
    elements = elements.filter(el => el.dataset['drop']);
    return elements;
  }

  /**
   * Reposition drag element to be under cursor, using the `calculatedDragElementOffset` variable as offset
   * @param ev
   */
  private positionDragElement(ev: PointerEvent) {
    if(this.dragElement) {
      this.dragElement.style.left = (Math.floor(ev.pageX) + this.calculatedDragElementOffset.x)+'px';
      this.dragElement.style.top = (Math.floor(ev.pageY) + this.calculatedDragElementOffset.y)+'px';
    }
  }

  /**
   * Remove drag element and release pointer events
   * @param ev
   */
  private reset(ev: PointerEvent) {
    if(this.dragOverElements.length > 0) {
      this.dragLeaveTargets.emit(this.dragOverElements);
      this.dispatchCustomEvent(this.dragOverElements, 'dragleave');
      this.dragOverElements = [];
    }
    this.element.nativeElement.releasePointerCapture(ev.pointerId);
    this.dragElement?.remove();
    this.isDragging = false;
  }

  private parseOffsetValue(value: string | number, referenceValue: number): number {
    // return numbers directly
    if(typeof value == 'number') {
      return value;
    }
    // check for percentage
    if(value.indexOf('%') > -1) {
      const percentageValue = (+value.replace('%', '')/100);
      return referenceValue*percentageValue;
    }
    // remove px values
    return +value.replace('px', '');
  }

  /**
   * Calculate offset in px from input (can be string, e.g. percentage)
   */
  private calculateOffset() {
    this.calculatedDragElementOffset.x = this.parseOffsetValue(this.dragElementOffset.x, this.dragElementDimensions.width);
    this.calculatedDragElementOffset.y = this.parseOffsetValue(this.dragElementOffset.y, this.dragElementDimensions.height);
  }

  /**
   * Dispatch custom event on all elements in list
   * @param el
   * @param type
   * @param originalEvent
   */
  private dispatchCustomEvent(items: HTMLElement[], type: 'dragover' | 'dragleave' | 'dragenter' | 'drop') {
    const ev = new DragEvent(type, {
      dataTransfer: this.dragDataTransfer
    })
    items.map(item => {
      item.dispatchEvent(ev);
    })
  }

  /**
   * Calculate all elements where we are currently over, also check which we left and which we entered
   * @param ev
   */
  private updateCurrentDragOver(ev: PointerEvent) {
    const newDragOverElements = this.findElementsUnderPointer(ev);
    if(newDragOverElements.length > 0) {
      this.dragOverTargets.emit(newDragOverElements);
      this.dispatchCustomEvent(newDragOverElements, 'dragover');
    }
    const elementsToRemove = this.dragOverElements.filter(el => newDragOverElements.indexOf(el) == -1);
    if(elementsToRemove.length > 0) {
      this.dragLeaveTargets.emit(elementsToRemove);
      this.dispatchCustomEvent(elementsToRemove, 'dragleave');
    }
    const elementsToAdd    = newDragOverElements.filter(el => this.dragOverElements.indexOf(el) == -1);
    if(elementsToAdd.length > 0) {
      this.dragEnterTargets.emit(elementsToAdd);
      this.dispatchCustomEvent(elementsToAdd, 'dragenter');
    }
    this.dragOverElements = newDragOverElements;
  }


  /**
   * PointerDown - Initialize drag
   * @param ev
   * @returns
   */
  @HostListener('pointerdown', ['$event']) onPointerDown(ev: PointerEvent) {

    // dragImage is not set, try to clone the HTML element as good as possible
    if(!this.dragImage) {
      // get current width and height
      const computed = window.getComputedStyle(this.element.nativeElement);
      this.dragElementDimensions.width  = +computed.width.replace('px', '');
      this.dragElementDimensions.height = +computed.height.replace('px', '');
      //precalculate offset
      this.calculateOffset();
      // clone node
      this.dragElement = this.element.nativeElement.cloneNode();
      if(!this.dragElement) {
        console.warn(`Could not initiate dragElement, abort dragging`);
        return;
      }
      // adjust styles
      this.dragElement.style.margin   = '0px';
      this.dragElement.style.width    = Math.floor(this.dragElementDimensions.width)+'px';
      this.dragElement.style.height   = Math.floor(this.dragElementDimensions.height)+'px';
    }

    // use specified drag image
    else {
      this.dragElement = new Image();
      // after image loaded, get and set size
      this.dragElement.onload = () => {
        const imgWidth  = (<HTMLImageElement>this.dragElement).width;
        const imgHeight = (<HTMLImageElement>this.dragElement).height;
        // if no size specified, use image size
        if(this.dragImageSize.width == 0 && this.dragImageSize.height == 0) {
          this.dragElementDimensions.width  = imgWidth;
          this.dragElementDimensions.height = imgHeight;
        }
        // if both width and height specified, use them
        if(this.dragImageSize.width > 0 && this.dragImageSize.height > 0) {
          this.dragElementDimensions.width  = this.dragImageSize.width;
          this.dragElementDimensions.height = this.dragImageSize.height;
        }
        // if only width specified, calculate height from aspect ratio
        if(this.dragImageSize.width > 0 && this.dragImageSize.height == 0) {
          this.dragElementDimensions.width  = this.dragImageSize.width;
          this.dragElementDimensions.height = this.dragImageSize.width * imgHeight / imgWidth;
        }
        // if only height specified, calculate width from aspect ratio
        if(this.dragImageSize.width == 0 && this.dragImageSize.height > 0) {
          this.dragElementDimensions.width  = this.dragImageSize.height * imgWidth / imgHeight;
          this.dragElementDimensions.height = this.dragImageSize.height;
        }
        // adjust size of image
        this.dragElement!.style.width  = Math.floor(this.dragElementDimensions.width)+'px';
        this.dragElement!.style.height = Math.floor(this.dragElementDimensions.height)+'px';
        //precalculate offset
        this.calculateOffset();
      }
      (<HTMLImageElement>this.dragElement).src = this.dragImage;
    }
    // set style
    this.dragElement.style.display  = 'block';
    this.dragElement.style.position = 'absolute';
    this.dragElement.style.zIndex   = '9000';
    this.dragElement.style.pointerEvents = 'none';
    this.dragElement.style.userSelect = 'none';

    // add element to body
    document.getElementsByTagName('body')[0].appendChild(this.dragElement!);
    // reposition
    this.positionDragElement(ev);
    // start dragging
    this.isDragging = true;
    // make sure we get all move and cancel events
    this.element.nativeElement.setPointerCapture(ev.pointerId);
    // reset
    this.dragOverElements = [];
    // emit event
    this.dragDataTransfer = new DataTransfer();
    this.dragStarted.emit({
      originalPointerEvent: ev,
      dataTransfer: this.dragDataTransfer
    });
  }

  /**
   * PointerMove - Adjust positions on the way
   * @param ev
   */
  @HostListener('pointermove', ['$event']) onPointerMove(ev: PointerEvent) {
    if(this.isDragging) {
      this.positionDragElement(ev);
      this.updateCurrentDragOver(ev);
    }
  }

  /**
   * PointerCancel - Abort
   * @param ev
   */
  @HostListener('pointercancel', ['$event']) onPointerCancel(ev: PointerEvent) {
    this.reset(ev);
  }

  /**
   * PointerUp - A possible drop
   * @param ev
   */
  @HostListener('pointerup', ['$event']) onPointerUp(ev: PointerEvent) {
    this.reset(ev);
    // dispatch event on all elements under pointer
    const items = this.findElementsUnderPointer(ev);
    this.dispatchCustomEvent(items, 'drop');
    // also emit as dropTarget
    this.dropTarget.emit(items);
  }


}