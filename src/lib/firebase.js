import { initializeApp, getApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

// Public web config of the tms-web-129f5 Firebase project (used for Auth only).
// These values are identifiers, not secrets; env vars override them when set.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBkkSkc2Wx4kiXBDE7IJCk8asYis4fFML0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'tms-web-129f5.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'tms-web-129f5',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:361035330129:web:1b634cee9e27910126be70',
}

function firebaseAuth() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  return getAuth(app)
}

// Opens the Google sign-in popup and returns a Firebase ID token for the backend.
export async function signInWithGoogleIdToken() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  const result = await signInWithPopup(firebaseAuth(), provider)
  return result.user.getIdToken()
}
