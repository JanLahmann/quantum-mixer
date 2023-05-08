import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComposerOperationInfoComponent } from './composer-operation-info.component';

describe('ComposerOperationInfoComponent', () => {
  let component: ComposerOperationInfoComponent;
  let fixture: ComponentFixture<ComposerOperationInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComposerOperationInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComposerOperationInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
