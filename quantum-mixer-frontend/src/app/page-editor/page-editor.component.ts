import { Component, OnInit, ViewChild } from '@angular/core';
import { CircuitData } from '../composer/circuit';
import { ApiProbabilitiesResponse } from '../api';
import { ChartConfiguration } from 'chart.js';
import { ComposerMainComponent } from '../composer/composer-main/composer-main.component';
import { OperationType } from '../composer/operation';


@Component({
  selector: 'app-page-editor',
  templateUrl: './page-editor.component.html',
  styleUrls: ['./page-editor.component.scss']
})
export class PageEditorComponent implements OnInit {

  @ViewChild('appComposer') appComposer: ComposerMainComponent | undefined;

  public chartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  }

  ngOnInit(): void {
      setTimeout(() => {
        this.appComposer?.loadCircuit({
          numQubits: 3,
          operations: [
            {
              type: OperationType.HADAMARD,
              targetQubits: [0],
              controlQubits: [],
              parameterValues: []
            },
            {
              type: OperationType.HADAMARD,
              targetQubits: [1],
              controlQubits: [],
              parameterValues: []
            },
            {
              type: OperationType.NOT,
              targetQubits: [1],
              controlQubits: [0],
              parameterValues: []
            },
            {
              type: OperationType.HADAMARD,
              targetQubits: [0],
              controlQubits: [],
              parameterValues: []
            }
          ]
        })
      }, 500)
  }

  private _updateTimeout: any = null;
  updateData(circuitData: CircuitData) {
    clearTimeout(this._updateTimeout);
    this._updateTimeout = setTimeout(() => {
      this.fetchProbabilities(circuitData).then(res => {
        this.chartData = {
          labels: res.bits,
          datasets: Object.keys(res.results).map(key => {
            const data = res.results[<'analytical'|'qasm'|'mock'>key];
            return {
              label: key,
              data: data
            }
          })
        }
      }, error => {
        console.error(error);
      })
    }, 200)
  }

  async fetchProbabilities(circuitData: CircuitData): Promise<ApiProbabilitiesResponse> {
    return new Promise((resolve, reject) => {
      fetch('http://localhost:8000/api/probabilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(circuitData)
      }).then(async res => {
        const data = res.json();
        resolve(data);
      }, error => {
        reject(error);
      })
    })
  }

}
