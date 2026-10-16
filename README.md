# Mini Stock Inventory Management (HTML/CSS/JS + Firebase)

Overview
- Simple single-page app to add/edit/delete inventory items stored in Firestore.
- Real-time updates via Firestore onSnapshot.
- Client-side search and low-stock highlighting.

Files
- index.html — UI
- styles.css — styles
- app.js — Firebase + JS logic
- firebase.json & .firebaserc — optional hosting config

Setup

1) Create Firebase project
- Go to https://console.firebase.google.com/
- Create a new project (name it e.g., "mini-inventory")
- In Project Settings -> General -> Your apps -> Add web app. Copy the config snippet.

2) Enable Firestore
- In Firebase Console -> Build -> Firestore Database -> Create database
- Choose "Start in test mode" for quick dev (but secure rules before production)

3) Put Firebase config in app.js
- Replace the firebaseConfig object values with your web app config.

4) Run locally
- You can open index.html directly in the browser OR serve with a local server:
  - Python: `python -m http.server 8080`
  - Node: `npx serve .`

5) Deploy to Firebase Hosting (optional)
- Install firebase-tools: `npm install -g firebase-tools`
- Login: `firebase login`
- Initialize (only first time): `firebase init hosting` (choose project, public directory: ., single-page app: yes)
- Deploy: `firebase deploy --only hosting`

Firestore rules (development example)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

IMPORTANT: This is wide-open. Before production, restrict read/write access.

Notes & extensions
- Add Firebase Authentication if you want per-user access.
- Add CSV import/export, categories, audit logs, and reports for extra credit.
- Improve UI with frameworks like React or Vue if desired.

That's it — copy the files, add your Firebase config, and test.
