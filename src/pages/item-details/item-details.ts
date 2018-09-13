import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Http, Headers } from '@angular/http';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import * as Config from '../../config/config.dev';

@Component({
  selector: 'page-item-details',
  templateUrl: 'item-details.html'
})
export class ItemDetailsPage {
  item: any;
  enrlogs: any;
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public http: Http,
    private storage: Storage
  ) {
    let paramsItem = navParams.get('item');    
    this.item = {
      id: paramsItem.id,
      courseName: paramsItem.courseName,
      startDate: this.formatDate(paramsItem.startDate),
      endDate: this.formatDate(paramsItem.endDate),
      lecturesMinNum: paramsItem.lecturesMinNum,
      lecturesTargetNum: paramsItem.lecturesTargetNum,      
      logs: paramsItem.logs.map((l, index) => ({ 
        index: index + 1,
        date: this.formatDate(l.date) 
      }))      
    };    
  }

  formatDate(dateStr) {
    if (dateStr) {
      let d = new Date(dateStr);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
    return null;
  }

}
