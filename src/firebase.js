// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACts4iPAWPnlh6IdZN99LBw5D_8DE6rQ0",
  authDomain: "classroomapp-ac189.firebaseapp.com",
  projectId: "classroomapp-ac189",
  storageBucket: "classroomapp-ac189.firebasestorage.app",
  messagingSenderId: "32900542085",
  appId: "1:32900542085:web:ccfdb8d426831d1835c3ec",
  measurementId: "G-KK9PKFJFBS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);