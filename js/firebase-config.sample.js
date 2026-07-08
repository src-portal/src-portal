// firebase-config.sample.js
// このファイルをコピーして firebase-config.js を作成してください。
// Firebase Web API Keyは通常「秘密鍵」ではありませんが、GitHubは警告することがあります。
// 実運用前に APIキー制限、Firestore Rules、Authentication を設定してください。

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
