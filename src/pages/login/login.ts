import { Component, state } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { ScanPage } from '../../pages/scan/scan';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';
import * as Config from '../../config/config.dev';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

    private username: string;
    private password: string;
    private networkAvailable: boolean;

    constructor(
        public loadingCtrl: LoadingController, 
        public http: Http, 
        public navCtrl: NavController, 
        public navParams: NavParams, 
        private network: Network,
        private storage: Storage
    ) {

        this.networkAvailable = false;
        let connectSubscription = this.network.onConnect().subscribe(() => {
            this.networkAvailable = true;
            this.navCtrl.setRoot(this.navCtrl.getActive().component);
        });
    }

    ionViewDidLoad(): void {        
        let conntype = this.network.type;
        this.networkAvailable = conntype && conntype !== 'unknown' && conntype !== 'none';
    }

    login(): void {
        let headers = new Headers();
        headers.append('Content-type','application/json; charset=utf-8');

        let body = {
            Username: this.username,
            Password: this.password
        }

        let loading = this.loadingCtrl.create({
            content: 'Please wait...'
        });
        loading.present();

        this.http.post(`${Config.serverUrl}api/Token`, JSON.stringify(body), {headers: headers})            
            .subscribe(data => {
                if (data.ok === true) {
                    let jsonString = data.text();                    
                    let invalid = jsonString.replace(/\"/g, '') === 'InvalidCredentials';
                    if (!invalid) {
                        let obj = JSON.parse(jsonString);
                        this.storage.set(`${Config.storageKeys.userDetails}`, obj);                        
                        this.navCtrl.setRoot(ScanPage);
                    } else {
                        alert('Not authorized');
                    }
                } else {
                    alert('Error');
                }
                loading.dismiss();
            });
        
    }
  
}