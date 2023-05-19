import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsecasePreferencesComponent } from './usecase-preferences.component';

describe('UsecasePreferencesComponent', () => {
  let component: UsecasePreferencesComponent;
  let fixture: ComponentFixture<UsecasePreferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsecasePreferencesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsecasePreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
