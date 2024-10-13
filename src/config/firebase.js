// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDfI3V-ouGtX024gtYhGjuMqkAVREjAwhg",
  authDomain: "c4openingdatabase.firebaseapp.com",
  projectId: "c4openingdatabase",
  storageBucket: "c4openingdatabase.appspot.com",
  messagingSenderId: "697825584660",
  appId: "1:697825584660:web:60482180dc6324585c2901",
  measurementId: "G-07NC7FX0H5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);