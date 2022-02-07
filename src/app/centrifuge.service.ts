import { Injectable } from '@angular/core';
import Centrifuge from 'centrifuge';
import { BehaviorSubject } from 'rxjs';

interface PublishInterface {
  data: any;
  gen: any;
  offset: any;
  seq: any
}

interface JoinLeaveInterface {
  info: {
    client: string,
    user: string
  }
}

interface SubscribeInterface {
  channel: string,
  isResubscribe?: boolean,
  recovered?: boolean
}

@Injectable({
  providedIn: 'root'
})

export class CentrifugeService {
  private centrifuge!: Centrifuge;
  private subs: Centrifuge.Subscription[] = [];
  public presenceStats_list: {[key: string]: BehaviorSubject<any>} = {} // kumpulan presenceStats dari channel" yang di subscribe ( "nama_channel": Stream )
  public data: {[key: string]: BehaviorSubject<any>} = {}
  public status: any;
  constructor() {
  }

  init(addr: string, token: string) {
    this.centrifuge = new Centrifuge(addr)
    this.centrifuge.setToken(token)
    this.centrifuge.on('connect', (ctx) => {
      this.status = ctx
    })
    this.centrifuge.on('disconnect', (ctx) => {
      this.status = ctx
    })
  }

  handlePublish(channel: string, ctx: PublishInterface): void {
    console.log(ctx)
    this.data[channel].next(ctx.data)
  }

  handleJoin(channel: string, msg: JoinLeaveInterface): void {
    this.presenceStats(channel)
    console.log(msg)
  }

  handleLeave(channel: string, msg: JoinLeaveInterface): void {
    this.presenceStats(channel)
    console.log(msg)
  }

  handleSubscribe(ctx: SubscribeInterface): void {
    console.log(ctx)
  }

  handleUnsubscribe(ctx: SubscribeInterface): void {
    console.log(ctx)
  }

  handleError(err: any): void {
    console.log(err)
  }

  subscribe(channel: string) {
    const _c = this.subs.find(sub => sub.channel === channel) //cek apakah channel sudah di subscribe sebelumnya
    if(!_c){ //jika belum maka tambahkan ke dalam list
      this.presenceStats_list[channel] = new BehaviorSubject({}) // tambah channel ke dalam stream presenceStat list
      this.data[channel] = new BehaviorSubject({}) // tambah channel ke dalam stream data
      const callbacks = {
        "join": (ctx: any) => this.handleJoin(channel,ctx),
        "leave": (ctx: any) => this.handleLeave(channel,ctx),
        "publish": (ctx: any) => this.handlePublish(channel,ctx),
        "subscribe": (ctx: any) => this.handleSubscribe(ctx),
        "unsubscribe": (ctx: any) => this.handleUnsubscribe(ctx),
        "error": (err: any) => this.handleError(err)
      }
      const c = this.centrifuge.subscribe(channel,callbacks)
      this.subs.push(c); // tambah channel ke dalam subs list
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
      this.subs.splice(idx,1) // hapus channel dari sub list

      this.presenceStats_list[channel].complete() // selesaikan stream
      delete this.presenceStats_list[channel] // hapus channel dari stream presenceStats

      this.data[channel].complete() // selesaikan stream
      delete this.data[channel] // hapus channel dari stream data

      return true;
    }
    return false;
  }

  //publish ke channel lain
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
      this.presenceStats_list[channel].next(res)
    }).catch((err: {message: string, code: number}) => {
      console.log(err)
    })
  }
}
