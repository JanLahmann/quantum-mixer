import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CircuitService } from 'src/app/circuit-composer/circuit.service';
import { UsecaseService } from 'src/app/usecase.service';


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
      if(params['catalogueid']) {
        await this.usecaseService.initialLoadingPromise;
        const data = this.usecaseService.getCircuitById(params['catalogueid']);
        if(data) {
          this.circuitService.circuit.load(data);
        }
      }
    })
  }
}
