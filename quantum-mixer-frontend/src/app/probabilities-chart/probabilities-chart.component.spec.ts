import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbabilitiesChartComponent } from './probabilities-chart.component';

describe('ProbabilitiesChartComponent', () => {
  let component: ProbabilitiesChartComponent;
  let fixture: ComponentFixture<ProbabilitiesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProbabilitiesChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProbabilitiesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
