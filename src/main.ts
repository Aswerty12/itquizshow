import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { ApplicationConfig } from '@angular/core';
import routeConfig from './app/routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getDatabase, provideDatabase, connectDatabaseEmulator } from '@angular/fire/database';
import { getAuth, provideAuth, connectAuthEmulator } from '@angular/fire/auth';
import { getFirestore, provideFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { environment } from './environments/environment';

const firebaseProviders = [
  provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
  provideDatabase(() => {
    const database = getDatabase();
    if (environment.useEmulators) {
      connectDatabaseEmulator(database, 'localhost', 9000);
    }
    return database;
  }),
  provideAuth(() => {
    const auth = getAuth();
    if (environment.useEmulators) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }
    return auth;
  }),
  provideFirestore(() => {
    const firestore = getFirestore();
    if (environment.useEmulators) {
      connectFirestoreEmulator(firestore, 'localhost', 8080);
    }
    return firestore;
  })
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routeConfig),
    ...firebaseProviders
  ]
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));