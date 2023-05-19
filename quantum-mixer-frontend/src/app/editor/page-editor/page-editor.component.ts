import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CircuitService } from 'src/app/circuit-composer/circuit.service';
import { UsecaseService } from '../../usecase/usecase.service';


@Component({
  selector: 'app-page-editor',
  templateUrl: './page-editor.component.html',
  styleUrls: ['./page-editor.component.scss']
})
export class PageEditorComponent implements OnInit {

  constructor(private route: ActivatedRoute, private usecaseService: UsecaseService, private circuitService: CircuitService) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      if(params['catalogue']) {
        const data = this.usecaseService.getCircuitById(params['catalogue']);
        if(data) {
          this.circuitService.circuit.load(data);
        }
      }
    })
  }
}
