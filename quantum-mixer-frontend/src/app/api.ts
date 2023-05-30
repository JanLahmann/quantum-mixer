import { CircuitData } from "./circuit-composer/model/circuit"

export const API_BASE_URL = ''

export interface UsecaseBitMappingItem {
  icon?: string,
  name: string,
  bits: string
}

export interface UsecaseMeasurementRange {
  min: number,
  max: number,
  default: number
}

export interface UsecaseExternalLink {
  name: string,
  url: string
}

export interface UsecaseData {
  id: string,
  name: string,
  description: string,
  numQubits: string,
  loginRequired: string,
  hasOrder: boolean,
  externalLinks: UsecaseExternalLink[]
}

export interface UsecasePreferences {
  bitMapping: UsecaseBitMappingItem[]
  numMeasurements: UsecaseMeasurementRange
}

export interface OrderData {
  items: string[]
}
