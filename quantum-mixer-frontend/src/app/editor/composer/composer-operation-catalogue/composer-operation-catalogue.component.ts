import { Component } from '@angular/core';
import { EditorService } from '../../editor.service';
import { ComposerCatalogueType, createOperations } from '../../model/composer-catalogue';
import { cssRelValue } from 'src/app/common/utils';
import { ComposerDragData } from '../../model/composer';

@Component({
  selector: 'app-composer-operation-catalogue',
  templateUrl: './composer-operation-catalogue.component.html',
  styleUrls: ['./composer-operation-catalogue.component.scss']
})
export class ComposerOperationCatalogueComponent {

  constructor(public editorService: EditorService) {

  }

  ComposerCatalogueType = ComposerCatalogueType;

  /**
   * Start dragging of buttons/icons to add new operations to the composer.
   * @param ev
   * @param catalogueType
   */
  handleNewOperationDragStart(ev: DragEvent, catalogueType: ComposerCatalogueType) {

    // init drag
    this.editorService.isDragging = true;

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
      element!.style.width = cssRelValue(newOperation.properties.relativeWidth);
      element!.style.height = cssRelValue(newOperation.getNumQubitsCovered());
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
   * Stop dragging
   */
  handleDragEnd() {
    this.editorService.isDragging = false;
  }
}
