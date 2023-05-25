import { CircuitData } from "./circuit-composer/model/circuit"

export const API_BASE_URL = ''

export interface UsecaseBitMappingItem {
  icon?: string,
  name: string,
  bits: string
}

export interface UsecaseCircuitCatalogueItem {
  id: string,
  name: string,
  description: string,
  data: CircuitData,
  isPrimary?: boolean
}

export interface UsecaseCircuitCatalogueSection {
  name: string,
  items: UsecaseCircuitCatalogueItem[]
}

export interface UsecaseMeasurementRange {
  min: number,
  max: number,
  default: number
}

export interface UsecaseData {
  id: string,
  name: string,
  description: string,
  numQubits: string,
  loginRequired: string,
  circuitsCatalogue: UsecaseCircuitCatalogueSection[]
}

export interface UsecasePreferences {
  bitMapping: UsecaseBitMappingItem[]
  numMeasurements: UsecaseMeasurementRange
}

export interface OrderData {
  items: string[]
}
