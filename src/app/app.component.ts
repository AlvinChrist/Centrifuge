import { Component, OnInit } from '@angular/core';
import { CentrifugeService } from './centrifuge.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'test-centrifuge';
  counter = 0;
  counter2 = 0;
  constructor (
    public _cs: CentrifugeService
  ) {
    this._cs.init('ws://localhost:8000/connection/websocket','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM3MjIiLCJleHAiOjE2NDQ2NDQ3NTZ9.5G2UTUDQW6YJCGMnRuXEv9dhceWKypMGLoioTzAIx8I')
  }

  ngOnInit() {
    this._cs.subscribe('ch1').on('publish', (ctx) => {
      this.counter = ctx.data.value
    })
    this._cs.subscribe('ch2').on('publish', (ctx) => {
      this.counter2 = ctx.data.value
    })
    this._cs.connect();
    setTimeout(() => {
      this._cs.presenceStats('ch1')
    },100)
  }
}
