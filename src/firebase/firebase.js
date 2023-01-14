import app from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY_FIREBASE,
  authDomain: process.env.REACT_APP_API_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_API_DATABASE_URL,
  projectId: process.env.REACT_APP_API_PROJECT_ID,
  storageBucket: process.env.REACT_APP_API_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_API_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_API_APP_ID,
  measurementId: process.env.REACT_APP_API_MEASUREMENT_ID,
};

class Firebase {
  constructor() {
    app.initializeApp(firebaseConfig);
    this.db = app.firestore();
    this.firestore = app.firestore;
    this.auth = app.auth();
    this.storage = app.storage();
  }

  estaIniciado() {
    return new Promise((resolve) => {
      this.auth.onAuthStateChanged(resolve);
    });
  }
}

export const newFirebase = new Firebase();

export default Firebase;
