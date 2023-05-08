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
      })
  }

  updateData(circuitData: CircuitData) {
    this.fetchProbabilities(circuitData).then(res => {
      this.chartData = {
        labels: Object.keys(res.results),
        datasets: Object.keys(res.results).map(key => {
          const data = res.results[<'analytical'|'qasm'|'mock'>key];
          const order = Object.keys(data).sort();
          return {
            label: key,
            data: order.map(o => data[o])
          }
        })
      }
    }, error => {
      console.error(error);
    })
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
