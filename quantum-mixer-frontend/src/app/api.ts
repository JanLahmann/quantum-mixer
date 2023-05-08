export interface ApiProbabilitiesResponse {
  bits: string[]
  results: {
    analytical: number[]
    qasm: number[]
    mock: number[]
  },
  circuit_drawing: string
}
