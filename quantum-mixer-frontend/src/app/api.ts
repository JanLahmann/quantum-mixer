export interface ApiProbabilitiesResponse {
  results: {
    analytical: {[key: string]: number},
    qasm: {[key: string]: number},
    mock: {[key: string]: number}
  },
  circuit_drawing: string
}
