import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComposerOperationCatalogueComponent } from './composer-operation-catalogue.component';

describe('ComposerOperationCatalogueComponent', () => {
  let component: ComposerOperationCatalogueComponent;
  let fixture: ComponentFixture<ComposerOperationCatalogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComposerOperationCatalogueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComposerOperationCatalogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
