import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageEditorComponent } from './editor/page-editor/page-editor.component';

const routes: Routes = [
  {
    component: PageEditorComponent,
    path: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
