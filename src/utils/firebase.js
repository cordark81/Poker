/* eslint-disable max-len */
import { getDatabase } from 'firebase/database'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { doc, getDoc, onSnapshot, getFirestore } from 'firebase/firestore'
import { get, set, ref } from 'firebase/database'
import 'firebase/database'

const firebaseConfig = {
  // Aqui se añade la conexión a base de datos
  apiKey: 'AIzaSyBp0vfvEX9QvT5-lSlebe7tMz0Pp7fjvPs',
  authDomain: 'pokerzone-eb346.firebaseapp.com',
  projectId: 'pokerzone-eb346',
  storageBucket: 'pokerzone-eb346.appspot.com',
  messagingSenderId: '411361893439',
  appId: '1:411361893439:web:eb87953ba9fc39f69a2c8a'
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)
const database = getDatabase(app)

const userRef = (entrada, user) => {
  set(ref(database, entrada), {
    username: user.username,
    chips: user.chips,
    status: 'online'
  })
}

// Funciones para trabajar con Realtime Database
const refDB = (entrada) => ref(database, entrada)

const getDB = async (reference) => {
  const result = await get(reference)
  return result.val()
}

// Otras funciones de base de datos
const getEntryChips = (ref, id) => getDoc(doc(db, ref, id))

const onPlayersSit = (ref, id, callback) => onSnapshot(doc(db, ref, id), callback)

export { auth, database, db, getDB, getEntryChips, onPlayersSit, refDB, userRef }
