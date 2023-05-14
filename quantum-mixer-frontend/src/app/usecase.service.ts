import { Injectable } from '@angular/core';
import { CircuitData } from './circuit-composer/model/circuit';

export interface UsecaseData {
  name: string,
  numQubits: number,
  numMeasurements: {
    min: number,
    max: number,
    default: number
  },
  bitMapping: {
    [bitConfiguration: string]: {
      id: string,
      icon: string,
      name: string
    }
  },
  initialCircuits: {
    name: string,
    circuits: {
      id: string,
      name: string,
      description: string,
      data: CircuitData
    }[]
  }[]
}

@Injectable({
  providedIn: 'root'
})
export class UsecaseService {

  public data: UsecaseData | null = null;
  public initialLoadingPromise: Promise<void>;

  constructor() {
    this.initialLoadingPromise = this.loadData();
  }

  private loadData(): Promise<void> {
    return new Promise((resolve, reject) => {
      fetch(`/api/usecase/data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(async res => {
        const data = await res.json();
        this.data = data;
        resolve();
      }, error => {
        console.error(`Error fetching usecase from server`, error);
        reject(error);
      })
    })
  }

  public order(items: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      fetch(`/api/usecase/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: items
        })
      }).then(async res => {
        resolve();
      }, error => {
        console.error(`Error placing order`, error);
        reject(error);
      })
    })
  }

}
