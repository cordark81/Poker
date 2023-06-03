import { getDatabase } from "firebase/database";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import {
  ref,
  onValue,
  push,
  off,
  runTransaction,
  update,
  get,
  set,
  onChildAdded,
} from "firebase/database";
import "firebase/database";

const firebaseConfig = {
  //Aqui se añade la conexión a base de datos
  apiKey: "AIzaSyBp0vfvEX9QvT5-lSlebe7tMz0Pp7fjvPs",
  authDomain: "pokerzone-eb346.firebaseapp.com",
  projectId: "pokerzone-eb346",
  storageBucket: "pokerzone-eb346.appspot.com",
  messagingSenderId: "411361893439",
  appId: "1:411361893439:web:eb87953ba9fc39f69a2c8a",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

const userRef = (entrada, user) => {
  set(ref(database, entrada), {
    username: user.username,
    chips: user.chips,
    status: "online",
  });
};

//Funciones para trabajar con Realtime Database
const refDB = (entrada) => ref(database, entrada);

const getDB = async (reference) => {
  const result = await get(reference);
  return result.val();
};

//Otras funciones de base de datos
const numberSeats = (ref, id) => getDoc(doc(db, ref, id));

const updateNumberSeats = (ref, id, objeto) =>
  updateDoc(doc(db, ref, id), objeto);

const onPlayersSit = (ref, id, callback) =>
  onSnapshot(doc(db, ref, id), callback);

export {
  onPlayersSit,
  updateNumberSeats,
  numberSeats,
  auth,
  db,
  refDB,
  getDB,
  onValue,
  push,
  off,
  get,
  set,
  onChildAdded,
  runTransaction,
  update,
  signInWithPopup,
  createUserWithEmailAndPassword,
  getDatabase,
  GoogleAuthProvider,
  database,
  ref,
  getFirestore,
  doc,
  onSnapshot,
  getDoc,
  collection,
  onAuthStateChanged,
  signOut,
  userRef,
};
