import { Component, OnInit } from '@angular/core';
import { EditorService } from '../../editor.service';
import { ComposerCatalogueType, createOperations } from '../../model/composer-catalogue';
import { cssRelValue } from 'src/app/common/utils';
import { ComposerDragData } from '../../model/composer';
import { Operation } from '../../model/operation';

@Component({
  selector: 'app-composer-operation-catalogue',
  templateUrl: './composer-operation-catalogue.component.html',
  styleUrls: ['./composer-operation-catalogue.component.scss']
})
export class ComposerOperationCatalogueComponent implements OnInit {

  constructor(public editorService: EditorService) {

  }

  ngOnInit(): void {
      Object.values(ComposerCatalogueType).map(value => {
        const op = createOperations(value)[0];
        const img = new Image();
        img.src = op.png || '';
        img.style.width = '50px';
        this.catalogue.push({
          type: value,
          name: value,
          img: img,
          operation: op
        })
      })
  }

  public catalogue: {type: ComposerCatalogueType, name: string, img: HTMLImageElement, operation: Operation}[] = [];

  /**
   * Start dragging of buttons/icons to add new operations to the composer.
   * @param ev
   * @param catalogueType
   */
  handleNewOperationDragStart(ev: DragEvent, catalogueType: ComposerCatalogueType, container: HTMLDivElement) {
    this.editorService.isDragging = true;
    const item = this.catalogue.filter(i => i.type == catalogueType)[0];
    ev.dataTransfer?.setData('text/plain', JSON.stringify(<ComposerDragData>{
      type: 'qo-add',
      catalogueType: catalogueType,
      dragOffset: 0,
      qubitsCovered: item.operation.getNumQubitsCovered()
    }));
    // hacky solution: add image to body
    const div = document.createElement('div');
    div.id = 'new-operation-preview';
    div.appendChild(item.img);
    div.style.position = "absolute";
    div.style.top = "0px"; div.style.left= "-50px";
    document.querySelector('body')?.appendChild(div);
    ev.dataTransfer?.setDragImage(div, 0, 0);
  }

  /**
   * Stop dragging
   */
  handleDragEnd() {
    document.getElementById('new-operation-preview')?.remove();
    this.editorService.isDragging = false;
  }
}
