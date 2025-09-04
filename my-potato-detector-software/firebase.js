// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXDmhmdFJ24IYQM15dBWuFTBu1HUdELZ4",
  authDomain: "my-potato-project-84589.firebaseapp.com",
  projectId: "my-potato-project-84589",
  storageBucket: "my-potato-project-84589.appspot.com",
  messagingSenderId: "326081481631",
  appId: "1:326081481631:web:ca9c961e529650c492cbaa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export it
export const db = getFirestore(app);