import { Component, Input } from '@angular/core';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-probabilities-chart',
  templateUrl: './probabilities-chart.component.html',
  styleUrls: ['./probabilities-chart.component.scss']
})
export class ProbabilitiesChartComponent {

  public showLegend = true;

  @Input('data') data: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  }

  options: ChartConfiguration<'bar'>['options'] = {
    responsive: false,
  };
}
