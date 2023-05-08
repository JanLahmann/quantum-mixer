import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ApiProbabilitiesResponse } from '../api';

const RESULT_NAMES: {[key: string]: string} = {
  analytical: 'Analytical',
  qasm: 'QASM',
  mock: 'Mock Device'
}

@Component({
  selector: 'app-probabilities-chart',
  templateUrl: './probabilities-chart.component.html',
  styleUrls: ['./probabilities-chart.component.scss']
})
export class ProbabilitiesChartComponent implements OnInit {

  public showLegend = true;
  public plugins = [ChartDataLabels];

  ngOnInit() {
    Chart.register(ChartDataLabels);
  }

  public update(res: ApiProbabilitiesResponse) {
    this.data = {
      labels: res.bits,
      datasets: Object.keys(res.results).map(key => {
        const data = res.results[<'analytical'|'qasm'|'mock'>key];
        return {
          label: RESULT_NAMES[key],
          data: data
        }
      })
    }
  }

  public data: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  }

  public options: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    animation: {
      duration: 200
    },
    scales: {
      y: {
        display: true,
        min: 0,
        max: 1,
        ticks: {
          maxTicksLimit: 10,
          format: {
            style: 'percent'
          }
        }
      }
    },
    plugins: {
      datalabels: {
        anchor: 'center',
        textAlign: 'center',
        // align: 'top',
        rotation: -90,
        formatter: val => {
          const newVal = Math.round(val * 100);
          if(newVal == 0) {
            return '';
          } else {
            return newVal+'%'
          }
        }
      }
    }
  };
}
