import { Injectable } from '@angular/core';
import { Circuit } from './model/circuit';
import { ReplaySubject } from 'rxjs';

export enum DeviceType {
  ANALYTICAL = 'analytical',
  MOCK       = 'mock',
  QASM       = 'qasm'
}

export const DeviceNames: {[device in DeviceType]: string} = {
  [DeviceType.ANALYTICAL]: 'Analytical',
  [DeviceType.MOCK]: 'Mock Device',
  [DeviceType.QASM]: 'QASM Simulator'
}

export interface ProbabilitiesResponse {
  bits: string[],
  results: {[key in DeviceType]: number[]},
  circuit: string,
  qasm: string
}

export interface MeasurementResponse {
  shots: number,
  device: DeviceType,
  results: string[]
}

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  public isDragging: boolean = false;
  public readonly circuit: Circuit = new Circuit();
  public probabilities: ReplaySubject<ProbabilitiesResponse> = new ReplaySubject();

  constructor() {
    this.circuit.change.subscribe(_ => {
      this.fetchProbabilities();
    })
  }

  private _bufferedRequestTimeout: any = null;
  public fetchProbabilities(): Promise<void> {
    return new Promise((resolve, reject) => {
      clearTimeout(this._bufferedRequestTimeout);
      this._bufferedRequestTimeout = setTimeout(() => {
        fetch('http://localhost:8000/api/quantum/probabilities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.circuit.export())
        }).then(async res => {
          const data = await res.json();
          this.probabilities.next(<any>data);
          resolve();
        }, error => {
          console.error(`Error fetching probabilities from server`, error);
          reject(error);
        })
      }, 200);
    })
  }

  public measure(numShots: number): Promise<MeasurementResponse> {
    return new Promise((resolve, reject) => {
      fetch(`http://localhost:8000/api/quantum/measurements?shots=${numShots}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.circuit.export())
      }).then(async res => {
        const data = await res.json();
        resolve(data);
      }, error => {
        console.error(`Error fetching measurement from server`, error);
        reject(error);
      })
    })
  }


}
