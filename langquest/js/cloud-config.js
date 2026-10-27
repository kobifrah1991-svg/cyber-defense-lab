// Public Firebase Web config (project cyberlab-3d — shared with the other Scitedra Labs products). Not a secret.
// Never put a service-account or private key here. When a dedicated "TedraLingo" web app is registered in the
// Firebase console, replace appId with its id.
window.LQ_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBD6ObU-luW7vu6Fjoo9bjIIQ2lR_0tgFc',
  authDomain: 'cyberlab-3d.firebaseapp.com',
  projectId: 'cyberlab-3d',
  storageBucket: 'cyberlab-3d.firebasestorage.app',
  messagingSenderId: '114394839123',
  appId: '1:114394839123:web:07310a8f3fae371c3aeea6'
};
// Where the web version lives (the Android app opens Google sign-in there) and the app's deep-link scheme.
window.LQ_CLOUD = { web: 'https://tedralingo.web.app', scheme: 'app.scitedra.tedralingo', collection: 'tedralingo' };
