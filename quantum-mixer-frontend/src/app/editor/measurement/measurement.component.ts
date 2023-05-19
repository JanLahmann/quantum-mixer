import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsecaseService } from '../../usecase/usecase.service';
import { CircuitService } from 'src/app/circuit-composer/circuit.service';

@Component({
  selector: 'app-measurement',
  templateUrl: './measurement.component.html',
  styleUrls: ['./measurement.component.scss']
})
export class MeasurementComponent implements OnInit {

  public status: 'ready' | 'loading' | 'measured' | 'ordered' | 'error' = 'ready';
  public data: {bit: string, icon?: string, display: string}[] = [];
  public numMeasurements: number = 1;
  public error: string | null = null;

  constructor(private circuitService: CircuitService, private usecaseService: UsecaseService) {

  }

  ngOnInit(): void {
    if(this.usecaseService.preferences) {
      this.numMeasurements = this.usecaseService.preferences.numMeasurements.default;
    }
  }

  async measure() {
    if(this.status == 'loading') {
      return;
    }
    this.data = [];
    this.status = 'loading';
    try {
      const data = await this.circuitService.measure(this.numMeasurements);
      data.results.map((result, i) => {
        setTimeout(() => {
          const bitMapping = this.usecaseService.getBitMapping(result);
          this.data.push({
            bit: result,
            icon: bitMapping ? bitMapping.icon : '',
            display: bitMapping ? `${bitMapping.name} (${result})` : ''
          });
        }, (i+1)*500);
      })
      setTimeout(() => {
        this.status = 'measured';
      }, data.results.length*500);
    } catch (error) {
      this.data = [];
      this.status = 'error';
      this.error = error as any;
      setTimeout(() => {
        this.status = 'ready';
      }, 5000)
    }
  }

  async order() {
    this.status = 'loading';
    const data = this.data.map(d => d.bit);
    await this.usecaseService.order(data);
    this.status = 'ordered';
    setTimeout(() => {
      this.status = 'ready';
      this.circuitService.circuit.reset();
    }, 5000)
  }
}
