import { Injectable } from '@angular/core';
import { Circuit } from './model/circuit';
import { ComposerSlotViewData, ComposerViewData } from './model/composer';
import { ReplaySubject } from 'rxjs';
import { API_BASE_URL } from '../api';

export enum DeviceType {
  ANALYTICAL = 'analytical',
  MOCK       = 'mock',
  QASM       = 'qasm'
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
export class CircuitService {

  public readonly circuit: Circuit = new Circuit();

  public viewData: ComposerViewData | undefined;
  public probabilities: ReplaySubject<ProbabilitiesResponse> = new ReplaySubject();

  constructor() {
    this.circuit.change.subscribe(_ => {
      this.buildViewData();
      this.fetchProbabilities();
    })
  }

  /**
   * Rebuild view data
   */
  private buildViewData() {

    // init data structure
    const newViewData: ComposerViewData = {
      relativeWidth: 0,
      slots: []
    }
    // get number of slots
    const slots = this.circuit.operations.length > 0 ? Math.max(...this.circuit.operations.map(op => op.slot)) : 0;
    // loop slots
    for(let slot = 0; slot <= slots; slot++) {
      // get operations
      const slotOperations = this.circuit.getOperationsForSlot(slot);
      const slotViewData: ComposerSlotViewData = {
        // get relative width of slot as max of relative width of operations
        relativeWidth: slotOperations.length > 0 ? Math.max(...slotOperations.map(op => op.relativeWidth)) : 0,
        // loop operations
        operations: slotOperations.map(op => {
          const opImg = op.png || '';
          return {
            operationId: op.id,
            operationImg: opImg,
            firstQubit: op.getFirstQubit(),
            numQubitsCovered: op.getNumQubitsCovered(),
            relativeWidth: op.relativeWidth
          }
        })
      }
      newViewData.slots.push(slotViewData);
    }

    newViewData.relativeWidth = newViewData.slots.map(s => s.relativeWidth).reduce((ps, s) => ps + s, 0);
    this.viewData = newViewData;
  }


  private async fetchProbabilities(): Promise<void> {
    fetch(`${API_BASE_URL}/api/quantum/probabilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.circuit.export())
    }).then(async res => {
      const data = await res.json();
      this.probabilities.next(<any>data);
    }, error => {
      console.error(`Error fetching probabilities from server`, error);
    });

  }

  public async measure(numShots: number): Promise<MeasurementResponse> {
    return new Promise((resolve, reject) => {
      fetch(`${API_BASE_URL}/api/quantum/measurements?shots=${numShots}`, {
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
