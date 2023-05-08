import { Component, Input, ViewChild } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-probabilities-chart',
  templateUrl: './probabilities-chart.component.html',
  styleUrls: ['./probabilities-chart.component.scss']
})
export class ProbabilitiesChartComponent {

  public showLegend = true;
  public plugins = {
    legend: {
      display: true,
      position: 'top',
    },
    datalabels: {
      formatter: (value: any, ctx: any) => {
        return 'yolo'
      },
    },
  }

  @ViewChild('chart') chart: BaseChartDirective | undefined = undefined;

  @Input('data') data: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  }

  options: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    animation: {
      duration: 200
    }
  };
}
