
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCe37-O4qD5i5H5HsydS-pJjE2dTPKVgdo",
  authDomain: "finsahad.firebaseapp.com",
  projectId: "finsahad",
  storageBucket: "finsahad.firebasestorage.app",
  messagingSenderId: "550797719280",
  appId: "1:550797719280:ios:1684665bc66202bc7db435"
};

// Check if we are using placeholder values
export const isConfigPlaceholder = firebaseConfig.apiKey === "" || firebaseConfig.apiKey.includes("YOUR_API_KEY");

let app: FirebaseApp | undefined;
let auth: Auth | any;
let db: Firestore | any;

try {
  if (isConfigPlaceholder) {
    throw new Error("Firebase is in Demo Mode (using Local Storage)");
  }
  
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Fin.SD: Firebase not initialized properly. Falling back to local mode if necessary.", error);
  
  if (!auth || !db) {
    auth = {
      currentUser: { uid: 'demo-user', email: 'demo@fin-sd.com' },
      onAuthStateChanged: (cb: any) => {
        setTimeout(() => cb({ uid: 'demo-user', email: 'demo@fin-sd.com' }), 500);
        return () => {};
      },
      signOut: () => { window.location.reload(); },
      signInWithEmailAndPassword: () => Promise.resolve(),
      createUserWithEmailAndPassword: () => Promise.resolve(),
    };
    
    db = { 
      isMock: true,
      localStorageKey: 'finsd_local_transactions'
    };
  }
}

export { auth, db };
