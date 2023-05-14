import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircuitComposerMainComponent } from './circuit-composer-main.component';

describe('CircuitComposerMainComponent', () => {
  let component: CircuitComposerMainComponent;
  let fixture: ComponentFixture<CircuitComposerMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CircuitComposerMainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircuitComposerMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
