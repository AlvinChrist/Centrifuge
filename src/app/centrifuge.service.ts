import { Injectable } from '@angular/core';
import Centrifuge from 'centrifuge';
@Injectable({
  providedIn: 'root'
})
export class CentrifugeService {
  private centrifuge!: Centrifuge;
  private subs: Centrifuge.Subscription[] = [];
  public status: any;
  constructor() { }

  init(addr: string, token: string) {
    this.centrifuge = new Centrifuge(addr)
    this.centrifuge.setToken(token)
    this.centrifuge.on('connect', (ctx) => {
      this.status = ctx
    })
    this.centrifuge.on('disconnect', (ctx) => {
      this.status = ctx
    })
    this.centrifuge.on('message', (ctx) => {
      console.log(ctx)
    })
  }

  subscribe(channel: string) {
    const _c = this.subs.find(sub => sub.channel === channel) //cek apakah channel sudah di subscribe sebelumnya
    if(!_c){ //jika belum maka tambahkan ke dalam list
      const c = this.centrifuge.subscribe(channel);
      this.subs.push(c);
      return c;
    }
    return _c; //jika sudah ada maka pakai yang sudah ada
  }

  connect(): any {
    this.centrifuge.connect();
  }

  disconnect(): void {
    this.centrifuge.disconnect();
  }

  unsubscribe(channel: string): boolean{
    const idx = this.subs.findIndex(sub => sub.channel === channel)
    if(idx !== -1){
      this.subs[idx].unsubscribe();
      this.subs[idx].removeAllListeners();
      this.subs.splice(idx,1)
      return true;
    }
    return false;
  }

  publish(channel: string, data: any): void { //kalau "publish": true di config.js
    this.centrifuge.publish(channel,data).catch((err) => {
      console.log(err)
    })
  }

  send(data: any): void { //hanya di server centrifuge, tidak berlaku di centrifugo
    this.centrifuge.send(data).catch((err) => {
      console.log(err)
    })
  }

  presenceStats(channel: string): void {
    const c = this.subs.find(sub => sub.channel === channel)
    if(c) this.centrifuge.presenceStats(channel).then((res) => {
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }
}
