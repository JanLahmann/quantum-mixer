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
import { ButtonModule, ComboBoxModule, GridModule, InputModule, TilesModule, UIShellModule } from 'carbon-components-angular';
import { HeaderComponent } from './header/header.component';
import { UsecaseHomeComponent } from './usecase-home/usecase-home.component';
import { DraggableDirective } from './common/draggable.directive';
import { CircuitComposerMainComponent } from './circuit-composer/circuit-composer-main/circuit-composer-main.component';
import { CircuitComposerOperationDetailsComponent } from './circuit-composer/circuit-composer-operation-details/circuit-composer-operation-details.component';
import { CircuitComposerCatalogueComponent } from './circuit-composer/circuit-composer-catalogue/circuit-composer-catalogue.component';

@NgModule({
  declarations: [
    AppComponent,
    SanitizeHtmlPipe,
    AsRangePipe,
    ProbabilitiesChartComponent,
    PageEditorComponent,
    MeasurementComponent,
    HeaderComponent,
    UsecaseHomeComponent,
    DraggableDirective,
    CircuitComposerMainComponent,
    CircuitComposerOperationDetailsComponent,
    CircuitComposerCatalogueComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgChartsModule,
    UIShellModule,
    GridModule,
    ButtonModule,
    TilesModule,
    InputModule,
    ComboBoxModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
