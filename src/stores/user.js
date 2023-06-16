import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import {refDB,getDB,set} from '../utils/firebase';
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
  browserSessionPersistence,
} from '@firebase/auth';

export const useUserStore = defineStore('userStore', () => {
  const user = ref(null);

  const isLoggedIn = computed(() => user.value !== null);

  const loginWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    if (user) {
      user.value = auth.currentUser;
      const userRef = refDB(`users/${user.value.uid}`);
      const snapshot = await getDB(userRef);
  
      if (snapshot !== null) {
        // El usuario ya existe en la base de datos
        const userData = snapshot;
        user.value.name = userData.name || user.value.displayName || '';
        user.value.photoURL = user.value.photoURL || '';
        user.value.chips = userData.chips || 0;
      } else {
        // Es la primera vez que el usuario inicia sesión
        const userData = {
          name: user.value.displayName || '',
          chips: 1000
        };
        set(userRef, userData);
        user.value.name = userData.name;
        user.value.photoURL = userData.photoURL;
        user.value.chips = userData.chips;
      }
  
      // Otros pasos después del login
      // ...
    } else {
      alert('No se pudo iniciar sesión');
    }
  };
  
  
  

  const doLogin = async (email, password) => {
    const auth = getAuth();
    await setPersistence(auth, browserSessionPersistence);
    await signInWithEmailAndPassword(getAuth(), email, password);
    user.value = auth.currentUser;
  };

  const doRegister = async (name, email, password) => {
    const auth = getAuth();
    await createUserWithEmailAndPassword(auth, email, password);
    user.value = auth.currentUser;
    await updateProfile(user.value, {
      displayName: name,
    });
  };

  const doLogout = async () => {
    await signOut(getAuth());
    user.value = null;
  };

  const updateProfileUser = async (name, email, password) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (name) {
      await updateProfile(user, {
        displayName: name,
      });
    }
    if (email) {
      await updateEmail(user, email);
    }
    if (password) {
      await updatePassword(user, password);
    }
  };

  const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
      const unsubcribe = onAuthStateChanged(
          getAuth(),
          (users) => {
            unsubcribe();
            user.value = users;
            resolve(users);
          },
          reject,
      );
    });
  };

  const doReset = async (email) => {
    await sendPasswordResetEmail(getAuth(), email);
  };

  return {
    isLoggedIn,
    user,
    doLogin,
    doLogout,
    doRegister,
    doReset,
    getCurrentUser,
    loginWithGoogle,
    updateProfileUser,
  };
});
