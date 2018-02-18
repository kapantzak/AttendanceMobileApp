import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { ItemDetailsPage } from '../item-details/item-details';
import { Http, Headers } from '@angular/http';
import { Storage } from '@ionic/storage';
import * as Config from '../../config/config.dev';

@Component({
  selector: 'page-enrollments',
  templateUrl: 'enrollments.html'
})
export class EnrollmentsPage {
  icons: string[];
  items: Array<{title: string, note: string, icon: string}>;

  constructor(
    public loadingCtrl: LoadingController,
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public http: Http,
    private storage: Storage
  ) {

    // this.icons = ['flask', 'wifi', 'beer', 'football', 'basketball', 'paper-plane',
    // 'american-football', 'boat', 'bluetooth', 'build'];

    this.items = [];
    // for(let i = 1; i < 11; i++) {
    //   this.items.push({
    //     title: 'Item ' + i,
    //     note: 'This is item #' + i,
    //     icon: this.icons[Math.floor(Math.random() * this.icons.length)]
    //   });
    // }
  }

  ionViewDidLoad(): void {
    this.getEnrollments();
  }

  getEnrollments() {

    this.storage.get(`${Config.storageKeys.userDetails}`).then((t) => {

      //let token = (t) ? t.replace(/\"/g, '') : null;
      
      if (t) {
        let loading = this.loadingCtrl.create({
            content: 'Getting enrollments...'
        });
        loading.present();

        let headers = new Headers();
        headers.append('Content-type','application/json; charset=utf-8');
        headers.append('Authorization', `Bearer ${t.token}`);

        this.http.get(`${Config.serverUrl}api/Enrollments/GetByUserId/${t.userId}`,{headers:headers}).subscribe(data => {
          if (data.ok === true) {
            this.items = JSON.parse(data.text());
          } else {
            alert('Error');
          }
          loading.dismiss();
        },
        err => {
          if (err.status === 401) {
            alert(err.statusText);
          }
          loading.dismiss();
        });
      } else {
        alert('Unauthorized');
      }

    });

  }

  itemTapped(event, item) {
    this.navCtrl.push(ItemDetailsPage, {
      item: item
    });
  }
}
