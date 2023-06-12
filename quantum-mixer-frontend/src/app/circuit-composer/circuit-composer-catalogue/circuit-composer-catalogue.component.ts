import { Component } from '@angular/core';
import { ComposerCatalogue, ComposerCatalogueItem, ComposerCatalogueType, createOperations } from '../model/composer-catalogue';
import { ComposerDragData } from '../model/composer';
import { Operation } from '../model/operation';

interface ComposerCatalogueItemDisplay {
  type: ComposerCatalogueType,
  name: string,
  operation: Operation,
  description: string
}

@Component({
  selector: 'app-circuit-composer-catalogue',
  templateUrl: './circuit-composer-catalogue.component.html',
  styleUrls: ['./circuit-composer-catalogue.component.scss']
})
export class CircuitComposerCatalogueComponent {

  public active: ComposerCatalogueItemDisplay|null = null;

  constructor() {

  }

  ngOnInit(): void {
      Object.values(ComposerCatalogueType).map(value => {
        const op = createOperations(value, true)[0];
        this.catalogue.push({
          type: value,
          name: value,
          operation: op,
          description: ComposerCatalogue[value].description
        })
      })
  }

  public catalogue: ComposerCatalogueItemDisplay[] = [];

  /**
   * Start dragging of buttons/icons to add new operations to the composer.
   * @param ev
   * @param catalogueType
   */
  handleNewOperationDragStart(ev: Pick<DragEvent, 'dataTransfer'>, catalogueType: ComposerCatalogueType) {
    const item = this.catalogue.filter(i => i.type == catalogueType)[0];
    ev.dataTransfer?.setData('text/plain', JSON.stringify(<ComposerDragData>{
      type: 'qo-add',
      catalogueType: catalogueType,
      dragOffset: 0,
      qubitsCovered: item.operation.getNumQubitsCovered()
    }));
  }
}
