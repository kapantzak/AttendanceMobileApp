import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav } from 'ionic-angular';
import { LoginPage } from '../pages/login/login';
import { ScanPage } from '../pages/scan/scan';
import { EnrollmentsPage } from '../pages/enrollments/enrollments';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import * as Config from '../config/config.dev';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make LoginPage the root (or first) page
  rootPage = LoginPage;
  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private storage: Storage
  ) {

    this.initializeApp();

    // set our app's pages
    this.pages = [
      //{ title: 'Login', component: LoginPage },
      { title: 'Scan', component: ScanPage },
      { title: 'My Enrollments', component: EnrollmentsPage }
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {    
    this.menu.close();    
    this.nav.setRoot(page.component);
  }

  logout() {
    this.menu.close();
    this.storage.remove(`${Config.storageKeys.userDetails}`);
    this.nav.setRoot(LoginPage);
  }
}
