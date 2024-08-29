import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA-irArniYqJOQ4xeZtJmtSeUeY30khU08",
  authDomain: "chat-58729.firebaseapp.com",
  projectId: "chat-58729",
  databaseURL: "https://chat-58729-default-rtdb.firebaseio.com/",
  storageBucket: "chat-58729.appspot.com",
  messagingSenderId: "374997624099",
  appId: "1:374997624099:web:b65e06d512992cc8a59896",
  measurementId: "G-VF6SXR1PR5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app); 

export { app, auth, database };
