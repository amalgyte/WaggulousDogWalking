import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getDatabase, ref } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyCE6kD7WKiQYn-MxR1ryakm0oEh_6IshyQ',
  authDomain: 'waggulous-2f3e8.firebaseapp.com',
  databaseURL:
    'https://waggulous-2f3e8-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'waggulous-2f3e8',
  storageBucket: 'waggulous-2f3e8.firebasestorage.app',
  messagingSenderId: '859624750521',
  appId: '1:859624750521:web:faf59510a5198edb570a68',
  measurementId: 'G-36G3VFV5RK',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const firebaseDatabase = getDatabase(firebaseApp)
export const appDataRef = ref(firebaseDatabase, 'appData')

if (typeof window !== 'undefined') {
  void isSupported()
    .then((supported) => {
      if (supported) getAnalytics(firebaseApp)
    })
    .catch((error) => {
      console.warn('Waggulous Firebase analytics could not start', error)
    })
}
