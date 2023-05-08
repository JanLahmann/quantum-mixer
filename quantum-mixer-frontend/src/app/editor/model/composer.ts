import { ComposerCatalogueType } from "./composer-catalogue"

/**
 * View data for a single slot in composer
 */
export interface ComposerSlotViewData {
  relativeWidth: number,
  operations: {
    operationSvg?:    string,
    operationId:      string,
    firstQubit:       number,
    numQubitsCovered: number,
    relativeWidth:    number
  }[]
}

/**
 * View data for all slots in composer
 */
export interface ComposerViewData {
  relativeWidth: number,
  slots: ComposerSlotViewData[]
}

/**
 * Drag data for composer
 */
export interface ComposerDragData {
  type: 'qo-move' | 'qo-add',
  catalogueType?: ComposerCatalogueType,
  operationId?: string,
  dragOffset: number,
  qubitsCovered: number
}
