import { Component, OnDestroy, OnInit } from '@angular/core';
import { EditorService } from '../editor.service';
import { Unsubscribable } from 'rxjs';

@Component({
  selector: 'app-measurement',
  templateUrl: './measurement.component.html',
  styleUrls: ['./measurement.component.scss']
})
export class MeasurementComponent {
  constructor(private editorService: EditorService) {

  }

  measure() {
    this.editorService.measure(3).then(data => {
      console.log(data);
    })
  }
}
