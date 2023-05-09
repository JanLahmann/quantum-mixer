import { Component } from '@angular/core';
import { UsecaseService } from '../usecase.service';

@Component({
  selector: 'app-usecase-home',
  templateUrl: './usecase-home.component.html',
  styleUrls: ['./usecase-home.component.scss']
})
export class UsecaseHomeComponent {

  constructor(public usecaseService: UsecaseService) {

  }

}
