import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageEditorComponent } from './editor/page-editor/page-editor.component';
import { UsecaseHomeComponent } from './usecase-home/usecase-home.component';

const routes: Routes = [
  {
    component: PageEditorComponent,
    path: 'editor/:catalogueid'
  },
  {
    component: PageEditorComponent,
    path: 'editor'
  },
  {
    component: UsecaseHomeComponent,
    path: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
