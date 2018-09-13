import { Component, state } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { Http, Headers } from '@angular/http';
import { AlertController, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Storage } from '@ionic/storage';
import { Diagnostic } from '@ionic-native/diagnostic';
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
    private storage: Storage,
    private diagnostic: Diagnostic
  ) {    
    this.checkGps();
  }

  closeScanMode() {
    this.toggleScanMode(false);
  }

  toggleScanMode(showCam: boolean) {
    let ionApp = <HTMLElement>document.getElementsByTagName("ion-app")[0];
    let overlay = <HTMLElement>document.getElementById("appOverlay");    
    ionApp.style.display = (showCam === true) ? 'none' : 'block';
    overlay.style.display = (showCam !== true) ? 'none' : 'block';    
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
                  let headers = new Headers();                  
                  headers.append('Content-type','application/json; charset=utf-8');
                  let qrObject = JSON.parse(text);                  
                  let body = {
                    Attendance: {
                      "StudentId": t.userId.toString(),
                      "CourseID": qrObject.CourseId.toString(),
                      "AcademicTermID": qrObject.AcademicTermId.toString(),
                      "Date": qrObject.Date,
                      "AttendanceTypeID": 0,
                      "LecturesLogId": qrObject.LectureLogId.toString()
                    },
                    CoursesAssignmentID: qrObject.CourseAssignmentId.toString(),
                    GeoLon: resp.longitude.toString(),
                    GeoLat: resp.latitude.toString(),
                    SessionStartTimestamp: qrObject.SessionStartTimestamp.toString()
                  }
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
                } else {
                  loading.dismiss();
                  // Unauthorized
                  let alertNoLocation = this.alertCtrl.create({
                    title: 'Error',
                    message: `No location available`,
                    buttons: [
                      {
                        text: 'Close',
                        role: 'cancel'
                      }          
                    ]
                  });
                  alertNoLocation.present();
                }    
                
                
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
    if (this.locationObj === null) {
        this.getLocation();
    }   
    this.qrScanner.prepare().then((status: QRScannerStatus) => {
      if (status.authorized) {         
        let ionApp = <HTMLElement>document.getElementsByTagName("ion-app")[0];
        let scanSub = this.qrScanner.scan().subscribe((text: string) => {          
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

  checkGps() {    
    this.diagnostic.isLocationAvailable().then((isAvailable) => {
      if (!isAvailable) {
        let alertGpsEnabled = this.alertCtrl.create({
          title: 'Location',
          message: 'Please enable GPS in order to be able to register your attendance',
          buttons: [
            {
              text: 'Close',
              role: 'cancel'            
            }          
          ]
        });
        alertGpsEnabled.present();
      } else {
        this.getLocation();
      }      
    }).catch((error) => {
      let alertError = this.alertCtrl.create({
        title: 'Error',
        message: `An error occured`,
        buttons: [
          {
            text: 'Close',
            role: 'cancel'            
          }          
        ]
      });
      alertError.present();
    });
  }

  getLocation() {
    this.geolocation.getCurrentPosition().then((resp) => {
        this.locationObj = {
          longitude: resp.coords.longitude,
          latitude: resp.coords.latitude
        }
    });
  }
    
}