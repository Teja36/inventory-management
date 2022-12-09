import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDsyYX7YAAQGWp2848IAebHYg8iM1-FL3s",
  authDomain: "inventory-99777.firebaseapp.com",
  projectId: "inventory-99777",
  storageBucket: "inventory-99777.appspot.com",
  messagingSenderId: "1007948112238",
  appId: "1:1007948112238:web:1fdbac7486db883dfc217f",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
