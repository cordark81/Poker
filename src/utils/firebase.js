/* eslint-disable max-len */
import {getDatabase} from 'firebase/database';
import {initializeApp} from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  getFirestore,
} from 'firebase/firestore';
import {
  get,
  off,
  onChildAdded,
  onValue,
  push,
  runTransaction,
  set,
  update,
  ref,
} from 'firebase/database';
import 'firebase/database';

const firebaseConfig = {
  // Aqui se añade la conexión a base de datos
  apiKey: 'AIzaSyBp0vfvEX9QvT5-lSlebe7tMz0Pp7fjvPs',
  authDomain: 'pokerzone-eb346.firebaseapp.com',
  projectId: 'pokerzone-eb346',
  storageBucket: 'pokerzone-eb346.appspot.com',
  messagingSenderId: '411361893439',
  appId: '1:411361893439:web:eb87953ba9fc39f69a2c8a',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

const userRef = (entrada, user) => {
  set(ref(database, entrada), {
    username: user.username,
    chips: user.chips,
    status: 'online',
  });
};

// Funciones para trabajar con Realtime Database
const refDB = (entrada) => ref(database, entrada);

const getDB = async (reference) => {
  const result = await get(reference);
  return result.val();
};

// Otras funciones de base de datos
const getEntryChips = (ref, id) => getDoc(doc(db, ref, id));


const onPlayersSit = (ref, id, callback) => onSnapshot(doc(db, ref, id), callback);

export {
  collection,
  createUserWithEmailAndPassword,
  doc,
  get,
  getDatabase,
  getDoc,
  getFirestore,
  GoogleAuthProvider,
  off,
  onAuthStateChanged,
  onChildAdded,
  onSnapshot,
  onValue,
  push,
  ref,
  runTransaction,
  set,
  signInWithPopup,
  signOut,
  update,
  auth,
  database,
  db,
  getDB,
  getEntryChips,
  onPlayersSit,
  refDB,
  userRef,
};
