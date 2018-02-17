import { Component, state } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-scan',
  templateUrl: 'scan.html'
})
export class ScanPage {

  constructor(private qrScanner: QRScanner, private alertCtrl: AlertController) {

  }

  toggleScanMode(showCam: boolean) {
    let ionApp = <HTMLElement>document.getElementsByTagName("ion-app")[0];    
    ionApp.style.display = (showCam === true) ? 'none' : 'block';
  }

  confirmRegistration(text: string) {    
    let alert = this.alertCtrl.create({
      title: 'Confirm scan',
      message: `Do you want to register your attendance? (${text})`,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
            this.toggleScanMode(false);
          }
        },
        {
          text: 'Yes',
          handler: () => {            
            console.log(text);
            this.toggleScanMode(false);
          }
        }
      ]
    });
    alert.present();
  }

  scan() {    
    this.qrScanner.prepare().then((status: QRScannerStatus) => {
      if (status.authorized) {         
        let ionApp = <HTMLElement>document.getElementsByTagName("ion-app")[0];
        let scanSub = this.qrScanner.scan().subscribe((text: string) => {
          //alert(text);
          this.confirmRegistration(text);
          this.qrScanner.hide();
          scanSub.unsubscribe();
          setTimeout(() => {
            this.toggleScanMode(false);
          }, 250);
        });
        this.toggleScanMode(true);
        this.qrScanner.show();        
      } else if (status.denied) {
        console.log('DENIED');
      } else {
        console.log('OTHER');
      }    
    }).catch((e:any) => console.log('Error: ', e))
  }

  test() {
    this.confirmRegistration('Test!!!');
  }
  
}