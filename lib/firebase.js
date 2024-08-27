import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-irArniYqJOQ4xeZtJmtSeUeY30khU08",
  authDomain: "chat-58729.firebaseapp.com",
  projectId: "chat-58729",
  storageBucket: "chat-58729.appspot.com",
  messagingSenderId: "374997624099",
  appId: "1:374997624099:web:b65e06d512992cc8a59896",
  measurementId: "G-VF6SXR1PR5",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { app, firestore, auth };
