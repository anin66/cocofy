
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// These values are public and safe to include in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyA_8kpremmv-G5LvdoWbfI07OCN2n_hzeo",
  authDomain: "studio-7067177088-c81e4.firebaseapp.com",
  projectId: "studio-7067177088-c81e4",
  storageBucket: "studio-7067177088-c81e4.firebasestorage.app",
  messagingSenderId: "174302856420",
  appId: "1:174302856420:web:ebaa0c64973053d84818f1"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://picsum.photos/seed/cocofy/192/192',
    data: payload.data,
    tag: payload.data?.jobId || 'cocofy-notification'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
