import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  setPersistence,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  browserSessionPersistence
} from '@firebase/auth'
import { set } from '@firebase/database'
import { refDB, getDB } from '../utils/firebase'

export const useUserStore = defineStore('userStore', () => {
  const user = ref(null)

  const isLoggedIn = computed(() => user.value !== null)

  //Inicio de sesion con Google
  const loginWithGoogle = async () => {
    const auth = getAuth()
    const provider = new GoogleAuthProvider()
    const { user } = await signInWithPopup(auth, provider)
    if (user) {
      user.value = auth.currentUser
      const userRef = refDB(`users/${user.value.uid}`)
      const snapshot = await getDB(userRef)

      if (snapshot !== null) {
        // El usuario ya existe en la base de datos
        const userData = snapshot
        user.value.name = userData.name || user.value.displayName || ''
        user.value.photoURL = user.value.photoURL || ''
        user.value.chips = userData.chips || 0
      } else {
        // Es la primera vez que el usuario inicia sesión
        const userData = {
          name: user.value.displayName || '',
          photoURL: user.value.photoURL || '',
          chips: 1000
        }
        set(userRef, userData)
        user.value.name = userData.name
        user.value.photoURL = userData.photoURL
        user.value.chips = userData.chips
      }

      // Otros pasos después del login
      // ...
    } else {
      alert('No se pudo iniciar sesión')
    }
  }

  /*Login con correo y contraseña, y mantiene ll apersistencia de sesion a nivel sesión, 
  esto permite loggear a varias personas en un mismo ordenador*/
  const doLogin = async (email, password) => {
    const auth = getAuth()
    await setPersistence(auth, browserSessionPersistence)
    await signInWithEmailAndPassword(getAuth(), email, password)
    user.value = auth.currentUser
  }

  //Realiza el registro con correo electronico
  const doRegister = async (name, email, password) => {
    const auth = getAuth()
    await createUserWithEmailAndPassword(auth, email, password)
    user.value = auth.currentUser
    await updateProfile(user.value, {
      displayName: name
    })
  }

  //Realiza la desconexion del objeto auth del usuario
  const doLogout = async () => {
    await signOut(getAuth())
    user.value = null
  }

  //Cambiar los datos del usuario (para una futura implementacion)
  const updateProfileUser = async (name, email, password) => {
    const auth = getAuth()
    const user = auth.currentUser

    if (name) {
      await updateProfile(user, {
        displayName: name
      })
    }
    if (email) {
      await updateEmail(user, email)
    }
    if (password) {
      await updatePassword(user, password)
    }
  }

  //Obtiene a tiempo real el usuario que esta autentificado
  const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
      const unsubcribe = onAuthStateChanged(
        getAuth(),
        (users) => {
          unsubcribe()
          user.value = users
          resolve(users)
        },
        reject
      )
    })
  }

  //Recuperación de contraseña en caso de olvido recibiendo le email registrado
  const doReset = async (email) => {
    await sendPasswordResetEmail(getAuth(), email)
  }

  return {
    isLoggedIn,
    user,
    doLogin,
    doLogout,
    doRegister,
    doReset,
    getCurrentUser,
    loginWithGoogle,
    updateProfileUser
  }
})
