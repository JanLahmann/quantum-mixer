import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsecaseSelectionComponent } from './usecase-selection.component';

describe('UsecaseSelectionComponent', () => {
  let component: UsecaseSelectionComponent;
  let fixture: ComponentFixture<UsecaseSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsecaseSelectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsecaseSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
