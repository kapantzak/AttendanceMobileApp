import { Component, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Http, Headers } from '@angular/http';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { Chart } from 'chart.js';

@Component({
  selector: 'page-item-details',
  templateUrl: 'item-details.html'
})
export class ItemDetailsPage {
  item: any;
  enrlogs: any;  
  @ViewChild('doughnutCanvas') doughnutCanvas;
  doughnutChart: any;

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
      lecturesActualNum: paramsItem.lecturesActualNum,
      logs: paramsItem.logs.map((l, index) => ({ 
        index: index + 1,
        date: this.formatDate(l.date) 
      }))      
    };  
    
  }

  ionViewDidLoad() {

    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, { 
        type: 'doughnut',
        data: {
            labels: ["Actual", "Remaining"],
            datasets: [{
                label: 'Attendance Logs',
                data: [
                  this.item.logs.length, 
                  this.item.lecturesMinNum - this.item.logs.length, 
                  //this.item.lecturesTargetNum
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',                    
                    //'rgba(255, 206, 86, 0.5)'                    
                ],
                hoverBackgroundColor: [
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 99, 132, 1)',                    
                  //'rgba(255, 206, 86, 1)'                  
                ]
            }]
        }

    });

  }

  formatDate(dateStr) {
    if (dateStr) {
      let d = new Date(dateStr);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
    return null;
  }

}
