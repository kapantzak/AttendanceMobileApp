import { Component, state } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { AlertController, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'page-scan',
  templateUrl: 'scan.html'
})
export class ScanPage {

  constructor(
    private qrScanner: QRScanner, 
    private alertCtrl: AlertController,
    private geolocation: Geolocation,
    public loadingCtrl: LoadingController
  ) {
    
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
            this.toggleScanMode(false);
          }
        },
        {
          text: 'Yes',
          handler: () => {

            // Loader
            let loading = this.loadingCtrl.create({
                content: 'Please wait...'
            });
            loading.present();

            // Get location
            this.geolocation.getCurrentPosition().then((resp) => {

              // Send 'text' and 'resp.coords' to server

              // Alert success message
              let alert = this.alertCtrl.create({
                title: 'Your location',
                message: `Your location is: Lon: ${resp.coords.longitude} / Lat: ${resp.coords.latitude}`,
                buttons: [
                  {
                    text: 'Close',
                    role: 'cancel',
                    handler: () => {              
                      this.toggleScanMode(false);
                    }
                  }          
                ]
              });
              alert.present();
              loading.dismiss();

            }).catch((error) => {

              let alertError = this.alertCtrl.create({
                title: 'Error',
                message: `An error occured`,
                buttons: [
                  {
                    text: 'Close',
                    role: 'cancel',
                    handler: () => {              
                      this.toggleScanMode(false);
                    }
                  }          
                ]
              });
              alertError.present();
            });
            loading.dismiss();
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

  getLocation() {
    //
  }
  
}