import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircuitComposerOperationDetailsComponent } from './circuit-composer-operation-details.component';

describe('CircuitComposerOperationDetailsComponent', () => {
  let component: CircuitComposerOperationDetailsComponent;
  let fixture: ComponentFixture<CircuitComposerOperationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CircuitComposerOperationDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircuitComposerOperationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
