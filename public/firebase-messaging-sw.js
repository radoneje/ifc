importScripts('https://www.gstatic.com/firebasejs/8.1.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.1.1/firebase-messaging.js');
var firebaseConfig = {
    apiKey: "AIzaSyBZm4LHkOHWkolMuh2gtp24K072vQ5P7mI",
    authDomain: "ifcongress-56476.firebaseapp.com",
    projectId: "ifcongress-56476",
    storageBucket: "ifcongress-56476.appspot.com",
    messagingSenderId: "970751093432",
    appId: "1:970751093432:web:2b6ac862eb43878007e24d",
    measurementId: "G-DEWMH500G8"
};// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
console.log('%c%s', 'color: green; font-weight:700;', 'firebase.messaging');
messaging.setBackgroundMessageHandler(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    /*const notificationTitle = payload['title'];
    const notificationOptions = {
        body: payload['body'],
        icon: payload['icon']
    };
    return self.registration.showNotification(notificationTitle,
        notificationOptions);*/
});

self.addEventListener('push', function(event) {
    const data = event.data.json();
   /* let url = 'url unknown';
    if (data.hasOwnProperty('notification') && data.notification.hasOwnProperty('click_action')) {
        url = data.notification.click_action;
    }
    event.waitUntil(
        self.analytics.trackEvent('Pushes showed', url)
    );*/
});
