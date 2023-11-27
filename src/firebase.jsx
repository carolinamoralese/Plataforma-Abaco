// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCF6QAadY_Mzej8QjEp0WXXPW1Rr8jVe9s",
  authDomain: "abacocolombia-a70ab.firebaseapp.com",
  projectId: "abacocolombia-a70ab",
  storageBucket: "abacocolombia-a70ab.appspot.com",
  messagingSenderId: "368670011231",
  appId: "1:368670011231:web:0860f887fce12b43f290ea",
  measurementId: "G-0FKYPBHRH3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider()
