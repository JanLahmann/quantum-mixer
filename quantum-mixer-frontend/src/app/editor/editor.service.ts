import { Injectable } from '@angular/core';
import { Circuit } from './model/circuit';
import { Operation } from './model/operation';
import { ReplaySubject, Subject } from 'rxjs';

export interface ApiProbabilitiesResponse {
  bits: string[]
  results: {
    analytical: number[]
    qasm: number[]
    mock: number[]
  },
  circuit_drawing: string
}

export interface ApiMeasurementResponse {
  results: string[]
}


@Injectable({
  providedIn: 'root'
})
export class EditorService {

  public isDragging: boolean = false;
  public readonly circuit: Circuit = new Circuit();
  public probabilities: ReplaySubject<ApiProbabilitiesResponse> = new ReplaySubject();

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
        fetch('http://localhost:8000/api/probabilities', {
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

  public measure(num_shots: number): Promise<ApiMeasurementResponse> {
    return new Promise((resolve, reject) => {
      fetch(`http://localhost:8000/api/measurements?num_shots=${num_shots}`, {
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
