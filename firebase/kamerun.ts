// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration


// import { getAuth } from 'firebase/auth';

// const firebaseConfig = {
//   apiKey: "AIzaSyARtj_ot56RIrGgawAdQhTjWgE_7yskABM",
//   authDomain: "kamerun-96927.firebaseapp.com",
//   projectId: "kamerun-96927",
//   storageBucket: "kamerun-96927.firebasestorage.app",
//   messagingSenderId: "20668770627",
//   appId: "1:20668770627:web:3ad430ec3334ebe0a927f6"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { initializeApp } from 'firebase/app';
// import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

// const firebaseConfig = {
//   apiKey: "AIzaSyARtj_ot56RIrGgawAdQhTjWgE_7yskABM",
//   authDomain: "kamerun-96927.firebaseapp.com",
//   databaseURL: "https://kamerun-96927-default-rtdb.firebaseio.com",
//   projectId: "kamerun-96927",
//   storageBucket: "kamerun-96927.firebasestorage.app",
//   messagingSenderId: "20668770627",
//   appId: "1:20668770627:web:3ad430ec3334ebe0a927f6"
// };

// const app = initializeApp(firebaseConfig);

// // ✅ Auth avec persistance sur AsyncStorage
// export const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { DocumentData, collection, doc, getDoc, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyA4W2Pw9YI14XuFRtjiwZjO-8L8xFxJ6Og",
  authDomain: "kameroun-438de.firebaseapp.com",
  projectId: "kameroun-438de",
  storageBucket: "kameroun-438de.firebasestorage.app",
  messagingSenderId: "674467457235",
  appId: "1:674467457235:web:2ca5c815644a00b336cc26",
  measurementId: "G-9T8XZL6V23"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


export { collection, doc, getDoc, getDocs, orderBy, query, where };
export type { DocumentData };

/**
 * SWITCH GLOBAL : Active/désactive Firebase
 * true = données Firebase tandis que false = données statiques
 */
export const USE_FIREBASE = true;


/**
 * Récupère une sous-collection d'un village
 */
export async function getVillageSubcollection(
  villageId: string,
  subcollectionName: 'lexique' | 'alphabet' | 'proverbes' | 'mets' | 'histoires'
) {
  try {
    const subcollectionRef = collection(db, `villages/${villageId}/${subcollectionName}`);
    const snapshot = await getDocs(subcollectionRef);
    
    return snapshot.docs.map((docSnapshot: { id: any; data: () => any; }) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    }));
  } catch (error) {
    console.error(`Erreur lors de la récupération de ${subcollectionName}:`, error);
    return [];
  }
}

/**
 * Convertit une URL Storage (gs://) en URL HTTP téléchargeable
 * IMPORTANT: Firebase Storage nécessite une configuration spéciale dans React Native
 * Pour l'instant, cette fonction retourne l'URL telle quelle
 * Vous devrez implémenter la conversion côté serveur ou utiliser les règles Storage
 */
export async function getStorageUrl(gsUrl: string): Promise<string> {
  try {
    if (!gsUrl || !gsUrl.startsWith('gs://')) return gsUrl;
    
    // TODO: Implémenter la conversion gs:// vers https://
    // Option 1: Utiliser une Cloud Function
    // Option 2: Stocker directement les URLs HTTPS dans Firestore
    // Option 3: Utiliser @react-native-firebase/storage
    
    console.warn('⚠️ Conversion gs:// non implémentée. Stockez les URLs HTTPS directement dans Firestore.');
    return gsUrl;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'URL:', error);
    return '';
  }
}


// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDEWav0oEUm7J7K2KZWPyMk8eeIUoIZMko",
//   authDomain: "frontend-dba9c.firebaseapp.com",
//   databaseURL: "https://frontend-dba9c-default-rtdb.firebaseio.com",
//   projectId: "frontend-dba9c",
//   storageBucket: "frontend-dba9c.appspot.com",
//   messagingSenderId: "770871910922",
//   appId: "1:770871910922:web:1186601c861a543df0b5f3"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

