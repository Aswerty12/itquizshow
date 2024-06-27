import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

//import { routes } from './app.routes';
import routeConfig from './routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

provideFirebaseApp(( )=> initializeApp(environment.firebaseConfig))
provideAuth (() =>{
  const auth = getAuth();
  return auth;
})
provideFirestore (()=>{
  const firestore = getFirestore();
  return firestore
}
)
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routeConfig), provideClientHydration(), provideFirebaseApp(() => initializeApp({"projectId":"itquizshow","appId":"1:212745597603:web:b6412ededcad180ba50516","databaseURL":"https://itquizshow-default-rtdb.asia-southeast1.firebasedatabase.app","storageBucket":"itquizshow.appspot.com","apiKey":"AIzaSyCvoCs_-AijJ-avEST5bVakAYmoghduYdM","authDomain":"itquizshow.firebaseapp.com","messagingSenderId":"212745597603","measurementId":"G-HG7VM00FE4"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
