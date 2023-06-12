import { Component } from '@angular/core';
import { UsecaseService } from '../usecase/usecase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(public usecaseService: UsecaseService, private router: Router) {

  }

  openHome(ev: any) {
    if(ev.target.classList.contains('bx--header__name')) {
      this.router.navigate(['/']);
    }
  }

  openLink(ev: any, url: string) {
    ev.preventDefault();
    window.open(url, '_blank');
    return false;
  }
}
