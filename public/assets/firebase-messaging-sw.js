// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
    "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

// Initialize the Firebase app in the service worker
// "Default" Firebase configuration (prevents errors)
const defaultConfig = {
    apiKey: true,
    projectId: true,
    messagingSenderId: true,
    appId: true,
};

const firebaseConfig = {
    apiKey: "AIzaSyB2l8M1GZiDSEDr7okoDk3SSfzOUNxqmxs",
    authDomain: "sfs-crm.firebaseapp.com",
    projectId: "sfs-crm",
    storageBucket: "sfs-crm.appspot.com",
    messagingSenderId: 729323945317,
    appId: "1:729323945317:web:69ad2e990f3057ac8ab58c",
    measurementId: "G-BN6TRD12P9",
};



firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("hereeeee")

    console.log("background message")
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image,
    };

    // self.registration.showNotification(notificationTitle, notificationOptions);
});