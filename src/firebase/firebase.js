import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAeY2QrvGcfopdfd-Au80so4EzYVGrrJDE",
  authDomain: "bovitrack-web.firebaseapp.com",
  projectId: "bovitrack-web",
  storageBucket: "bovitrack-web.firebasestorage.app",
  messagingSenderId: "688499103699",
  appId: "1:688499103699:web:93df21eef3ea29e61c0126",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);