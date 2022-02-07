import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CentrifugeService } from './centrifuge.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy{
  title = 'test-centrifuge';
  counter = 0;
  counter2 = 0;
  user = 0;
  client = 0;
  private _unsubAll: Subject<any>;
  constructor (
    public _cs: CentrifugeService
  ) {
    this._cs.init('ws://localhost:8000/connection/websocket','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM3MjIiLCJleHAiOjE2NDQ2NDQ3NTZ9.5G2UTUDQW6YJCGMnRuXEv9dhceWKypMGLoioTzAIx8I')
    this._unsubAll = new Subject();
  }

  ngOnInit() {
    this._cs.subscribe('ch1');
    this._cs.subscribe('ch2');

    this._cs.data['ch1'].pipe(takeUntil(this._unsubAll)).subscribe((data: any) => {
      this.counter = data
    })
    this._cs.data['ch2'].pipe(takeUntil(this._unsubAll)).subscribe((data: any) => {
      this.counter2 = data
    })

    this._cs.connect();

    this._cs.presenceStats_list['ch2'].pipe(takeUntil(this._unsubAll)).subscribe((data: any) => {
      this.user = data.num_users
      this.client = data.num_clients
    })
  }

  ngOnDestroy(): void {
    this._unsubAll.next();
    this._unsubAll.complete();
  }
}
