import { Component } from '@angular/core';
import { UsecaseService } from '../usecase/usecase.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(public usecaseService: UsecaseService) {

  }

  openLink(url: string) {
    window.open(url, '_blank');
  }
}
