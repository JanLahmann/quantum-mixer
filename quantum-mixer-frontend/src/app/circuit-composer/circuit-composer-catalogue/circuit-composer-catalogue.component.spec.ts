import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircuitComposerCatalogueComponent } from './circuit-composer-catalogue.component';

describe('CircuitComposerCatalogueComponent', () => {
  let component: CircuitComposerCatalogueComponent;
  let fixture: ComponentFixture<CircuitComposerCatalogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CircuitComposerCatalogueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircuitComposerCatalogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
