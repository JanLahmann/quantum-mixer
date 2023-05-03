import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SanitizeHtmlPipe } from './common/sanitize-html.pipe';
import { AsRangePipe } from './common/as-range.pipe';
import { ComposerMainComponent } from './composer/composer-main/composer-main.component';

@NgModule({
  declarations: [
    AppComponent,
    SanitizeHtmlPipe,
    AsRangePipe,
    ComposerMainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
