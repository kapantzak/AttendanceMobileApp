import { Component, state } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { Http, Headers } from '@angular/http';
import { AlertController, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Storage } from '@ionic/storage';
import * as Config from '../../config/config.dev';

@Component({
  selector: 'page-scan',
  templateUrl: 'scan.html'
})
export class ScanPage {

  private locationObj = null;

  constructor(
    public http: Http,
    private qrScanner: QRScanner, 
    private alertCtrl: AlertController,
    private geolocation: Geolocation,
    public loadingCtrl: LoadingController,
    private storage: Storage
  ) {
    this.getLocation();
  }

  toggleScanMode(showCam: boolean) {
    let ionApp = <HTMLElement>document.getElementsByTagName("ion-app")[0];    
    ionApp.style.display = (showCam === true) ? 'none' : 'block';
  }

  confirmRegistration(text: string) {    
    let alert = this.alertCtrl.create({
      title: 'Confirm scan',
      message: `Do you want to register your attendance?`,
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

            this.storage.get(`${Config.storageKeys.userDetails}`).then((t) => {              
              if (t) {   
                
                if (this.locationObj !== null) {

                  let resp = this.locationObj;

                  // let alert = this.alertCtrl.create({
                  //   title: 'Your location',
                  //   message: JSON.stringify(resp),
                  //   buttons: [
                  //     {
                  //       text: 'Close',
                  //       role: 'cancel',
                  //       handler: () => {              
                  //         this.toggleScanMode(false);
                  //       }
                  //     }          
                  //   ]
                  // });
                  // alert.present();

                  let headers = new Headers();
                  headers.append('Content-type','application/json; charset=utf-8');

                  let qrObject = JSON.parse(text);
                  
                  let body = {
                    Attendance: {
                      "StudentId": t.userId.toString(),
                      "CourseID": qrObject.CourseId.toString(),
                      "AcademicTermID": qrObject.AcademicTermId.toString(),
                      "Date": qrObject.Date,
                      "AttendanceTypeID": 0
                    },
                    CoursesAssignmentID: qrObject.CourseAssignmentId.toString(),
                    GeoLon: resp.longitude.toString(),
                    GeoLat: resp.latitude.toString(),
                    SessionStartTimestamp: qrObject.SessionStartTimestamp.toString()
                  }

                  // let alert = this.alertCtrl.create({
                  //   title: 'Body',
                  //   message: JSON.stringify(body),
                  //   buttons: [
                  //     {
                  //       text: 'Close',
                  //       role: 'cancel',
                  //       handler: () => {              
                  //         this.toggleScanMode(false);
                  //       }
                  //     }          
                  //   ]
                  // });
                  // alert.present();

                  this.http.post(`${Config.serverUrl}api/AttendanceLog`, JSON.stringify(body), {headers: headers})            
                      .subscribe(data => {
                          if (data.ok === true) {                              
                              let jsonString = data.text();
                              let responseStr = jsonString.replace(/\"/g, '');
                              let invalid = responseStr.indexOf('Error') === 0;
                              if (!invalid) {
                                loading.dismiss();

                                //Alert success message
                                let alert = this.alertCtrl.create({
                                  title: 'Success',
                                  message: 'Your have successfully registered your attendance',
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
                                
                              } else {
                                let alert = this.alertCtrl.create({
                                  title: 'Error',
                                  message: responseStr,
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
                              }                                      
                          } else {
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
                          }
                          loading.dismiss();
                      });
                }
                
                // Get location
                // this.geolocation.getCurrentPosition().then((resp) => {

                  
                  
                // }).catch((error) => {
                //   let alertError = this.alertCtrl.create({
                //     title: 'Error',
                //     message: `An error occured`,
                //     buttons: [
                //       {
                //         text: 'Close',
                //         role: 'cancel',
                //         handler: () => {              
                //           this.toggleScanMode(false);
                //         }
                //       }          
                //     ]
                //   });
                //   alertError.present();
                // });
                // loading.dismiss();
                // this.toggleScanMode(false);
                        
              } else {
                // Unauthorized
                let alertUnauthorized = this.alertCtrl.create({
                  title: 'Error',
                  message: `Unauthorized user`,
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
                alertUnauthorized.present();
              }
        
            });

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
    this.geolocation.getCurrentPosition().then((resp) => {

      this.locationObj = {
        longitude: resp.coords.longitude,
        latitude: resp.coords.latitude
      };

      // let alert = this.alertCtrl.create({
      //   title: 'Your location',
      //   message: JSON.stringify(this.locationObj), //`Your location is: Lon: ${resp.coords.longitude} / Lat: ${resp.coords.latitude}`,
      //   buttons: [
      //     {
      //       text: 'Close',
      //       role: 'cancel',
      //       handler: () => {              
      //         this.toggleScanMode(false);
      //       }
      //     }          
      //   ]
      // });
      // alert.present();
      
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
  }
  
}