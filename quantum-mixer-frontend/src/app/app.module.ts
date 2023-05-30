import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SanitizeHtmlPipe } from './common/sanitize-html.pipe';
import { AsRangePipe } from './common/as-range.pipe';
import { NgChartsModule } from 'ng2-charts';
import { ProbabilitiesChartComponent } from './editor/probabilities-chart/probabilities-chart.component';
import { PageEditorComponent } from './editor/page-editor/page-editor.component';
import { MeasurementComponent } from './editor/measurement/measurement.component';
import { ButtonModule, ComboBoxModule, GridModule, IconModule, InputModule, RadioModule, TilesModule, UIShellModule } from 'carbon-components-angular';
import { HeaderComponent } from './header/header.component';
import { DraggableDirective } from './common/draggable.directive';
import { CircuitComposerMainComponent } from './circuit-composer/circuit-composer-main/circuit-composer-main.component';
import { CircuitComposerOperationDetailsComponent } from './circuit-composer/circuit-composer-operation-details/circuit-composer-operation-details.component';
import { CircuitComposerCatalogueComponent } from './circuit-composer/circuit-composer-catalogue/circuit-composer-catalogue.component';
import { UsecaseSelectionComponent } from './usecase/usecase-selection/usecase-selection.component';
import { UsecasePreferencesComponent } from './usecase/usecase-preferences/usecase-preferences.component';
import { JsonSchemaFormModule } from '@ajsf/core';
import { UsecaseMainComponent } from './usecase/usecase-main/usecase-main.component';
import { Bootstrap4FrameworkModule } from '@ajsf/bootstrap4';

@NgModule({
  declarations: [
    AppComponent,
    SanitizeHtmlPipe,
    AsRangePipe,
    ProbabilitiesChartComponent,
    PageEditorComponent,
    MeasurementComponent,
    HeaderComponent,
    DraggableDirective,
    CircuitComposerMainComponent,
    CircuitComposerOperationDetailsComponent,
    CircuitComposerCatalogueComponent,
    UsecaseSelectionComponent,
    UsecasePreferencesComponent,
    UsecaseMainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgChartsModule,
    UIShellModule,
    GridModule,
    ButtonModule,
    IconModule,
    TilesModule,
    InputModule,
    ComboBoxModule,
    JsonSchemaFormModule,
    Bootstrap4FrameworkModule,
    RadioModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
