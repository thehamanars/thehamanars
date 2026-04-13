// ============================================================
// Firebase Configuration — thehamanars
// ============================================================
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBrgQLKjh3lpGfKMnhsL1_hcbyWXdHkOww",
  authDomain: "thehamanars.firebaseapp.com",
  projectId: "thehamanars",
  storageBucket: "thehamanars.firebasestorage.app",
  messagingSenderId: "778961579335",
  appId: "1:778961579335:web:3a953cd05133031d9a3062",
  measurementId: "G-BKC5V50K3L",
}

// Prevent re-initializing on hot reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

export { db }
