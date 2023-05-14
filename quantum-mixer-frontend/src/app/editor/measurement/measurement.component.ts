import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsecaseService } from 'src/app/usecase.service';
import { CircuitService } from 'src/app/circuit-composer/circuit.service';

@Component({
  selector: 'app-measurement',
  templateUrl: './measurement.component.html',
  styleUrls: ['./measurement.component.scss']
})
export class MeasurementComponent implements OnInit {

  public status: 'ready' | 'loading' | 'measured' | 'ordered' = 'ready';
  public data: {bit: string, icon: string, display: string}[] = [];
  public numMeasurements: number = 1;

  constructor(private circuitService: CircuitService, private usecaseService: UsecaseService) {

  }

  ngOnInit(): void {
      this.usecaseService.initialLoadingPromise.then(_ => {
        this.numMeasurements = this.usecaseService.data?.numMeasurements.default || 1;
      })
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
          this.data.push({
            bit: result,
            icon: this.usecaseService.data!.bitMapping[result].icon,
            display: this.usecaseService.data!.bitMapping[result].name+ ` (${result})`
          });
        }, (i+1)*500);
      })
      setTimeout(() => {
        this.status = 'measured';
      }, data.results.length*500);
    } catch (error) {
      this.data = [];
      this.status = 'ready';
    }
  }

  async order() {
    this.status = 'loading';
    const data = this.data.map(d => d.bit);
    this.data = [];
    await this.usecaseService.order(data);
    this.status = 'ordered';
    setTimeout(() => {
      this.status = 'ready';
      this.circuitService.circuit.reset();
    }, 5000)
  }
}
