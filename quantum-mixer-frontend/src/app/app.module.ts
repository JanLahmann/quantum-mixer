import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SanitizeHtmlPipe } from './common/sanitize-html.pipe';
import { AsRangePipe } from './common/as-range.pipe';
import { ComposerMainComponent } from './editor/composer/composer-main/composer-main.component';
import { NgChartsModule } from 'ng2-charts';
import { ProbabilitiesChartComponent } from './editor/probabilities-chart/probabilities-chart.component';
import { PageEditorComponent } from './editor/page-editor/page-editor.component';
import { ComposerOperationInfoComponent } from './editor/composer/composer-operation-info/composer-operation-info.component';
import { ComposerOperationCatalogueComponent } from './editor/composer/composer-operation-catalogue/composer-operation-catalogue.component';
import { MeasurementComponent } from './editor/measurement/measurement.component';
import { ButtonModule, GridModule, TilesModule, UIShellModule } from 'carbon-components-angular';
import { HeaderComponent } from './header/header.component';
import { UsecaseHomeComponent } from './usecase-home/usecase-home.component';

@NgModule({
  declarations: [
    AppComponent,
    SanitizeHtmlPipe,
    AsRangePipe,
    ComposerMainComponent,
    ProbabilitiesChartComponent,
    PageEditorComponent,
    ComposerOperationInfoComponent,
    ComposerOperationCatalogueComponent,
    MeasurementComponent,
    HeaderComponent,
    UsecaseHomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgChartsModule,
    UIShellModule,
    GridModule,
    ButtonModule,
    TilesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
