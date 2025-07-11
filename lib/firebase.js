// lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD6y0FkcfHhKFhWXRiCufnj1xwbiES_454",
  authDomain: "the-moving-mavericks.firebaseapp.com",
  projectId: "the-moving-mavericks",
  storageBucket: "the-moving-mavericks.firebasestorage.app",
  messagingSenderId: "241691222802",
  appId: "1:241691222802:web:7ed380f6ea4af6a20f89cb",
  measurementId: "G-CM84Q1SMF1"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth };
