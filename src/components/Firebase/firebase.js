// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBmI9LUa_iBMPtF_oTfv02HUGD506mHtS8",
  authDomain: "gen-z-certificate-generator.firebaseapp.com",
  projectId: "gen-z-certificate-generator",
  storageBucket: "gen-z-certificate-generator.firebasestorage.app",
  messagingSenderId: "847457863862",
  appId: "1:847457863862:web:a5e5561558568e5e733e17",
  measurementId: "G-E7MEM63460"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app);

export { db };