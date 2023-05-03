import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComposerMainComponent } from './composer-main.component';

describe('ComposerMainComponent', () => {
  let component: ComposerMainComponent;
  let fixture: ComponentFixture<ComposerMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComposerMainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComposerMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
