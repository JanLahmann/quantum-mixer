import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComposerMainComponent } from './composer/composer-main/composer-main.component';

const routes: Routes = [
  {
    component: ComposerMainComponent,
    path: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
