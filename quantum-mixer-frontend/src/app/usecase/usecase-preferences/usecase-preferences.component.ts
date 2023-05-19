import { Component } from '@angular/core';
import { UsecaseService } from '../usecase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usecase-preferences',
  templateUrl: './usecase-preferences.component.html',
  styleUrls: ['./usecase-preferences.component.scss']
})
export class UsecasePreferencesComponent {

  constructor(public usecaseService: UsecaseService, private router: Router) {
  }

  submit(ev: any) {
    this.usecaseService.setPreferences(ev).then(_ => {
      this.router.navigate(['/']);
    })
  }
}
