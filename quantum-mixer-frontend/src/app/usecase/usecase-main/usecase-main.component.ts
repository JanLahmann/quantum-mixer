import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsecaseService } from '../usecase.service';
import { ActivatedRoute } from '@angular/router';
import { Unsubscribable } from 'rxjs';

@Component({
  selector: 'app-usecase-main',
  templateUrl: './usecase-main.component.html',
  styleUrls: ['./usecase-main.component.scss']
})
export class UsecaseMainComponent implements OnInit, OnDestroy {
  constructor(private usecaseService: UsecaseService, private route: ActivatedRoute) {

  }

  private sub: Unsubscribable | null = null;

  ngOnInit(): void {
      this.sub = this.route.params.subscribe(params => {
        this.usecaseService.setUsecase(params['usecase']);
      })
  }

  ngOnDestroy(): void {
      if(this.sub) {
        this.sub.unsubscribe();
      }
  }
}
