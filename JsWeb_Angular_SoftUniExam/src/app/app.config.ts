import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { firebaseConfig } from '../environments/environment'; // Import your environment for Firebase config
import { provideAuth, getAuth } from '@angular/fire/auth'; // Import getAuth for providing Auth
import { provideFirestore, getFirestore } from '@angular/fire/firestore'; // Import getFirestore for Firestore
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Provide routes directly
    provideFirebaseApp(() => initializeApp(firebaseConfig)), // Initialize Firebase with the configuration
    provideAuth(() => getAuth()), // Provide Firebase Authentication with the required function
    provideFirestore(() => getFirestore()), // Provide Firestore with the required function
    provideHttpClient(),
  ]
};
