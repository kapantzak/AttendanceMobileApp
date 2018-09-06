import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-item-details',
  templateUrl: 'item-details.html'
})
export class ItemDetailsPage {
  item: any;
  
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    let paramsItem = navParams.get('item');    
    this.item = {
      courseName: paramsItem.courseName,
      startDate: this.formatDate(paramsItem.startDate),
      endDate: this.formatDate(paramsItem.endDate),
      logs: paramsItem.logs.map((l, index) => ({ 
        index: index + 1,
        date: this.formatDate(l.date) 
      }))
    }
  }

  formatDate(dateStr) {
    if (dateStr) {
      let d = new Date(dateStr);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
    return null;
  }

}
