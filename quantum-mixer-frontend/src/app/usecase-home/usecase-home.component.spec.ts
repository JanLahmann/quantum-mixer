import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsecaseHomeComponent } from './usecase-home.component';

describe('UsecaseHomeComponent', () => {
  let component: UsecaseHomeComponent;
  let fixture: ComponentFixture<UsecaseHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsecaseHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsecaseHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
