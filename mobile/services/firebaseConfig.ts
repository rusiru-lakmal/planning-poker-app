import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCp34hGVql0sIbDRUk6OLNTcPdJ_dRMgVk",
  authDomain: "planning-poker-pro-2992b.firebaseapp.com",
  projectId: "planning-poker-pro-2992b",
  storageBucket: "planning-poker-pro-2992b.firebasestorage.app",
  messagingSenderId: "1092289656944",
  appId: "1:1092289656944:web:4b3ce388bf66a710741cb5",
  measurementId: "G-RQ91CS6E6P",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
