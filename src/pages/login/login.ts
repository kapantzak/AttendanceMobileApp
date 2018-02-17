import { Component, state } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { NavController, NavParams } from 'ionic-angular';
import { ScanPage } from '../../pages/scan/scan';
import * as Config from '../../config/config.dev';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

    private username: string;
    private password: string;

    constructor(public http: Http, public navCtrl: NavController, public navParams: NavParams) {

    }

    login(): void {
        let headers = new Headers();
        headers.append('Content-type','application/json; charset=utf-8');

        let body = {
            Username: this.username,
            Password: this.password
        }

        this.http.post(`${Config.serverUrl}api/Token`, JSON.stringify(body), {headers: headers})            
            .subscribe(data => {
                if (data.ok === true) {
                    let text = data.text();
                    let invalid = text.replace(/\"/g, '') === 'InvalidCredentials';
                    if (!invalid) {
                        // this.navCtrl.push(HelloIonicPage, {
                        //     token: text
                        // });
                        this.navCtrl.setRoot(ScanPage, {
                            token: text
                        });
                    } else {
                        alert('Not authorized');
                    }
                } else {
                    alert('Error');
                }
            });
        
    }
  
}