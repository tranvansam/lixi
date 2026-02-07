import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWguaD9FjrAVxK24A4G7mNWkWpC7Ooli4",
  authDomain: "yennguyen-82ab7.firebaseapp.com",
  projectId: "yennguyen-82ab7",
  storageBucket: "yennguyen-82ab7.firebasestorage.app",
  messagingSenderId: "572398556029",
  appId: "1:572398556029:web:f03106dcbf2100d8903214",
  measurementId: "G-KKXPDWEZET",
  databaseURL: "https://yennguyen-82ab7-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
// Note: This will fail if Realtime Database is not created in Firebase Console
let database: Database | undefined;
try {
  if (firebaseConfig.databaseURL) {
    database = getDatabase(app);
    console.log('✅ Firebase Database initialized successfully');
  } else {
    console.warn('⚠️ databaseURL is missing. Realtime Database features will not work.');
    console.warn('💡 Create Realtime Database in Firebase Console and add databaseURL to config');
  }
} catch (error: any) {
  console.error('❌ Firebase Database initialization error:', error);
  console.error('💡 Make sure Realtime Database is created in Firebase Console');
  console.error('💡 Check if databaseURL is correct:', firebaseConfig.databaseURL);
  // Don't throw - allow app to work without database for now
  console.warn('⚠️ Continuing without database...');
}

export { database };

export default app;
