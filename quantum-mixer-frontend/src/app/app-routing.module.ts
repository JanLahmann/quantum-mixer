import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageEditorComponent } from './editor/page-editor/page-editor.component';
import { UsecaseSelectionComponent } from './usecase/usecase-selection/usecase-selection.component';
import { UsecasePreferencesComponent } from './usecase/usecase-preferences/usecase-preferences.component';
import { UsecaseMainComponent } from './usecase/usecase-main/usecase-main.component';

const routes: Routes = [
  {
    component: UsecaseMainComponent,
    path: ':usecase',
    children: [
      {
        component: UsecasePreferencesComponent,
        path: 'preferences',
      },
      {
        component: PageEditorComponent,
        path: '',
        pathMatch: 'full'
      }
    ]
  },
  {
    component: UsecaseSelectionComponent,
    path: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
