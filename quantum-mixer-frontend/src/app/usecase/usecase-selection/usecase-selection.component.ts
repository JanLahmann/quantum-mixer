import { Component } from '@angular/core';
import { UsecaseService } from '../usecase.service';

@Component({
  selector: 'app-usecase-selection',
  templateUrl: './usecase-selection.component.html',
  styleUrls: ['./usecase-selection.component.scss']
})
export class UsecaseSelectionComponent {

  constructor(public usecaseService: UsecaseService) {

  }

}
