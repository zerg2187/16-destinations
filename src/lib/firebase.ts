// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA0CTjKXA8vGsEZEsthHha8J6XVkAyxXN0",
    authDomain: "travel-survey-3ddda.firebaseapp.com",
    projectId: "travel-survey-3ddda",
    storageBucket: "travel-survey-3ddda.firebasestorage.app",
    messagingSenderId: "1069743119310",
    appId: "1:1069743119310:web:16f9723c2066d7ef97299f",
    measurementId: "G-N8BQRFB5E3"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Analyticsはブラウザ環境（windowがある時）のみ初期化する（サーバーサイドでエラーになるため）
// let analytics;
// if (typeof window !== "undefined") {
//   analytics = getAnalytics(app);
// }

export { db };