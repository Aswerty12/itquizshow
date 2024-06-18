import { bootstrapApplication, provideProtractorTestingSupport } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {provideRouter} from '@angular/router';
import routeConfig from './app/routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getDatabase, provideDatabase } from '@angular/fire/database';


bootstrapApplication(AppComponent, {
  providers: [provideProtractorTestingSupport(), provideRouter(routeConfig), provideFirebaseApp(() => initializeApp({"projectId":"itquizshow","appId":"1:212745597603:web:b6412ededcad180ba50516","databaseURL":"https://itquizshow-default-rtdb.asia-southeast1.firebasedatabase.app","storageBucket":"itquizshow.appspot.com","apiKey":"AIzaSyCvoCs_-AijJ-avEST5bVakAYmoghduYdM","authDomain":"itquizshow.firebaseapp.com","messagingSenderId":"212745597603","measurementId":"G-HG7VM00FE4"})), provideDatabase(() => getDatabase())],
}).catch((err) => console.error(err));
