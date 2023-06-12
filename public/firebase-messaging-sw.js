importScripts('https://www.gstatic.com/firebasejs/3.6.8/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.6.8/firebase-messaging.js');

firebase.initializeApp({
    //messagingSenderId: '970751093432'
    apiKey: "AIzaSyBZm4LHkOHWkolMuh2gtp24K072vQ5P7mI",
    authDomain: "ifcongress-56476.firebaseapp.com",
    projectId: "ifcongress-56476",
    storageBucket: "ifcongress-56476.appspot.com",
    messagingSenderId: "970751093432",
    appId: "1:970751093432:web:2b6ac862eb43878007e24d",
    measurementId: "G-DEWMH500G8"
});



const messaging = firebase.messaging();

