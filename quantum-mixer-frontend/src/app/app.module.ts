import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SanitizeHtmlPipe } from './common/sanitize-html.pipe';
import { AsRangePipe } from './common/as-range.pipe';
import { ComposerMainComponent } from './composer/composer-main/composer-main.component';
import { NgChartsModule } from 'ng2-charts';
import { ProbabilitiesChartComponent } from './probabilities-chart/probabilities-chart.component';
import { PageEditorComponent } from './page-editor/page-editor.component';

@NgModule({
  declarations: [
    AppComponent,
    SanitizeHtmlPipe,
    AsRangePipe,
    ComposerMainComponent,
    ProbabilitiesChartComponent,
    PageEditorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
