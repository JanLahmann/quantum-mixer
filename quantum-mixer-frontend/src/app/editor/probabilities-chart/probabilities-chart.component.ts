import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Unsubscribable } from 'rxjs';
import { DeviceNames, DeviceType, EditorService } from '../editor.service';
import { UsecaseService } from 'src/app/usecase.service';

@Component({
  selector: 'app-probabilities-chart',
  templateUrl: './probabilities-chart.component.html',
  styleUrls: ['./probabilities-chart.component.scss']
})
export class ProbabilitiesChartComponent implements OnInit, OnDestroy {

  public showLegend = true;
  public plugins = [ChartDataLabels];
  private _changeSub: Unsubscribable | null = null;

  constructor(public editorService: EditorService, private usecaseService: UsecaseService) {

  }

  async createLabels(bitConfiguration: string[]) {
    await this.usecaseService.initialLoadingPromise;
    return bitConfiguration.map(config => {
      return [this.usecaseService.data?.bitMapping[config].name, config];
    })
  }

  ngOnInit() {
    Chart.register(ChartDataLabels);
    this._changeSub = this.editorService.probabilities.subscribe(async res => {
      this.data = {
        labels: await this.createLabels(res.bits),
        datasets: Object.keys(res.results).map(key => {
          const data = res.results[<DeviceType>key];
          return {
            label: DeviceNames[<DeviceType>key],
            data: data
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
    // font: {
    //   family: "IBM Plex Sans",
    //   size: 34
    // },
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
          },
          font: {
            size: 14,
            family: 'IBM Plex Sans'
          },
          color: 'black'
        }
      },
      x: {
        ticks: {
          font: {
            size: 14,
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
            size: 14,
            family: 'IBM Plex Sans'
          },
          color: 'black'
        }
      },
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
  }
}
