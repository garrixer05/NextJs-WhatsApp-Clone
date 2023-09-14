import {initializeApp} from 'firebase/app'
import {getAnalytics} from 'firebase/analytics'
import {getAuth} from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyDvBDiCepmShJr-_0Ai-pxTeSkZA6xJ8CU",
    authDomain: "whatsapp-clone-53cea.firebaseapp.com",
    projectId: "whatsapp-clone-53cea",
    storageBucket: "whatsapp-clone-53cea.appspot.com",
    messagingSenderId: "256839272727",
    appId: "1:256839272727:web:e41170b18da478de0d0f52",
    measurementId: "G-QLSVVCMNH2"
};
  
const app = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(app); 