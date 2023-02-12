// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD1RFU2rmtTamDVD9xg6kxixEZqV8xymvs",
  authDomain: "barsanti-app.firebaseapp.com",
  projectId: "barsanti-app",
  storageBucket: "barsanti-app.appspot.com",
  messagingSenderId: "1036780035936",
  appId: "1:1036780035936:web:c8ead05e95bd413ccf8805",
  measurementId: "G-3MSX8Y09GE",
};

// Initialize Firebase
export const firebase = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebase);
firebaseAuth.useDeviceLanguage();
