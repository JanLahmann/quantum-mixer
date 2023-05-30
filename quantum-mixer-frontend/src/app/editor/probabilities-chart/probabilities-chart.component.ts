import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, Chart, ChartDataset, ChartType, ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Unsubscribable } from 'rxjs';
import { UsecaseService } from '../../usecase/usecase.service';
import { BaseChartDirective } from 'ng2-charts';
import { CircuitService, DeviceType, ProbabilitiesResponse } from '../../circuit-composer/circuit.service';

const DeviceNames: {[key in DeviceType]: string} = {
  [DeviceType.ANALYTICAL]: 'Theory',
  [DeviceType.MOCK]: 'Real Device',
  [DeviceType.QASM]: 'Simulator'
}

const DeviceColors: {[key in DeviceType]: string} = {
  [DeviceType.ANALYTICAL]: '#3498db',
  [DeviceType.MOCK]: '#8e44ad',
  [DeviceType.QASM]: '#2ecc71',
}

@Component({
  selector: 'app-probabilities-chart',
  templateUrl: './probabilities-chart.component.html',
  styleUrls: ['./probabilities-chart.component.scss']
})
export class ProbabilitiesChartComponent implements OnInit, OnDestroy  {

  public plugins = [ChartDataLabels];
  private _changeSub: Unsubscribable | null = null;
  private _sub: Unsubscribable | null = null;

  @ViewChild('chart') chart: BaseChartDirective | undefined;

  constructor(public circuitService: CircuitService, private usecaseService: UsecaseService) {
  }

  ngOnInit() {
    Chart.register(ChartDataLabels);
    this._sub = this.usecaseService.preferences.subscribe(_ => {
      this.chart?.chart?.update();
    })
    this._changeSub = this.circuitService.probabilities.subscribe(async res => {
      const isHidden: {[key: number]: boolean} = {};
      // get view status from previous
      this.chart?.chart?.data.datasets.map((dataset, i) => {
        isHidden[i] = !this.chart?.chart?.isDatasetVisible(i);
      })
      // set data
      this.data = {
        labels: res.bits,
        datasets: Object.keys(res.results).map((key, i) => {
          const data = res.results[<DeviceType>key];
          return {
            label: DeviceNames[<DeviceType>key],
            data: data,
            hidden: !!isHidden[i],
            barPercentage: 0.9,
            barThickness: 'flex',
            backgroundColor: DeviceColors[<DeviceType>key]
          }
        })
      }
    })
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
    indexAxis: 'y',
    scales: {
      x: {
        display: true,
        min: 0,
        max: 1,
        ticks: {
          maxTicksLimit: 10,
          callback: (value: string|number) => {
            return Math.round(+value*100)+'%'
          },
          font: {
            size: 18,
            family: 'IBM Plex Sans'
          },
          color: 'black'
        }
      },
      y: {
        ticks: {
          font: {
            size: 18,
            family: 'IBM Plex Sans'
          },
          color: 'black',
          maxRotation: 90,
          minRotation: 90,
          labelOffset: -18
        }
      },
      y1: {
        position: 'right',
        ticks: {
          callback: (value: string|number, index:number) => {
            return this.data.labels ? this.usecaseService.getBitMapping(this.data.labels[index] as string)?.name : ''
          },
          font: {
            size: 24,
            family: 'IBM Plex Sans'
          },
          color: 'black'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 24,
            family: 'IBM Plex Sans'
          },
          color: 'black'
        }
      },
      datalabels: {
        anchor: 'end',
        //textAlign: 'start',
        align: 'end',
        formatter: (val: number) => {
          const newVal = Math.round(val * 100);
          if(newVal == 0) {
            return '';
          } else {
            return newVal+'%'
          }
        },
        font: {
          size: 14,
          family: 'IBM Plex Sans',
        },
        color: 'black'
      }
    }
  }

  ngOnDestroy(): void {
    if(this._changeSub) {
      this._changeSub.unsubscribe();
    }
    if(this._sub) {
      this._sub.unsubscribe();
    }
  }
}
