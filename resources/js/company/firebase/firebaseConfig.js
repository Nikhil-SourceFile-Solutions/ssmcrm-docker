import { initializeApp } from "firebase/app";

import { getMessaging, getToken } from "firebase/messaging";
import { getAuth } from 'firebase/auth';
//Firebase Config values imported from .env file
const firebaseConfig = {
    apiKey: 'AIzaSyB2l8M1GZiDSEDr7okoDk3SSfzOUNxqmxs',
    authDomain: 'sfs-crm.firebaseapp.com',
    projectId: 'sfs-crm',
    storageBucket: 'sfs-crm.appspot.com',
    messagingSenderId: '729323945317',
    appId: '1:729323945317:web:69ad2e990f3057ac8ab58c',
    measurementId: 'G-BN6TRD12P9',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const messaging = getMessaging(app);

export { auth, messaging };
// export const requestForToken = async () => {
//   try {
//     const messaging = getMessaging();

//     // Attempt to get the current token
//     const currentToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_APP_VAPID_KEY });

//     // Check if a valid token exists before attempting to delete it
//     if (currentToken) {
//       console.log('Current Token:', currentToken);
//       return currentToken;
//     }
// else {
//       console.log('No registration token available. Request permission to generate one.');
//     }
//   } catch (error) {
//     console.error('An error occurred while retrieving token.', error);
//   }
// };



// export const requestForToken = async () => {
//   try {
//     const currentToken = await getToken(messaging, {
//       vapidKey: 'BKftQIV8GrvaQ5jb2FH-ohnYfJjTMQkXy9MW5GMmrcT_RQpPn3U-ZryMWSCwvhZhjVno1TcG-0ZCu7RRGr-NpNQ',
//     });
//     if (currentToken) {
//       console.log('Token:', currentToken);
//       return currentToken;
//     } else {
//       console.log('No registration token available. Request permission to generate one.');
//     }
//   } catch (error) {
//     console.error('An error occurred while retrieving token. ', error);
//   }
// };
