import { getDatabase } from "firebase/database";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut,GoogleAuthProvider,createUserWithEmailAndPassword,signInWithPopup} from "firebase/auth";
import { getFirestore, collection, getDocs, onSnapshot, addDoc, deleteDoc, updateDoc, doc, getDoc, setDoc, query, where } from "firebase/firestore";
import { ref, onValue,push,off,runTransaction,update,get,set ,onChildAdded} from 'firebase/database';
import "firebase/database";


const firebaseConfig = {
    //Aqui se añade la conexión a base de datos
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);


const userRef = (entrada,user)=>{set(ref(database,entrada), {
  username: user.username,
  chips: user.chips,
  status: "online"
})};

const refDB = entrada => ref(database,entrada) 

export { auth,db,refDB,onValue,push,off,get,set,onChildAdded ,runTransaction,update,signInWithPopup,createUserWithEmailAndPassword,getDatabase,GoogleAuthProvider,database,ref,getFirestore,doc,onSnapshot,getDoc,collection,onAuthStateChanged,signOut,userRef};

