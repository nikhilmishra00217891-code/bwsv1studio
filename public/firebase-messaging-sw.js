
// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdXe1KoEr_JleNIUy80XJO_buL6JO_4lE",
  authDomain: "biharwalesirji-w4n4b.firebaseapp.com",
  projectId: "biharwalesirji-w4n4b",
  storageBucket: "biharwalesirji-w4n4b.appspot.com",
  messagingSenderId: "207265599257",
  appId: "1:207265599257:web:67f9753a0650f500c43f88"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || "https://i.postimg.cc/FR3TT8KL/IMG-20250915-WA0003-1.jpg",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
