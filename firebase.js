// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Paste your own config here ↓
const firebaseConfig = {
    apiKey: "AIzaSyBvQ0ahAnTn_eED75dzeTzsFJYOlCTONeM",
    authDomain: "mathquest-1e98a.firebaseapp.com",
    projectId: "mathquest-1e98a",
    storageBucket: "mathquest-1e98a.firebasestorage.app",
    messagingSenderId: "606680784824",
    appId: "1:606680784824:web:9cbc5aa8a9392e9cc1b94d",
    measurementId: "G-C3KXHBT8R7"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);