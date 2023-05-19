import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsecaseMainComponent } from './usecase-main.component';

describe('UsecaseMainComponent', () => {
  let component: UsecaseMainComponent;
  let fixture: ComponentFixture<UsecaseMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsecaseMainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsecaseMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
