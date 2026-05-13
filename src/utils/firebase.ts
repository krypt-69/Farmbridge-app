import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

const firebaseConfig = {
  apiKey: extra.firebaseApiKey,
  projectId: extra.firebaseProjectId,
  // authDomain and storageBucket are usually derived from projectId if not explicitly set.
  // For Firebase JS SDK, you can set them as:
  authDomain: `${extra.firebaseProjectId}.firebaseapp.com`,
  storageBucket: `${extra.firebaseProjectId}.appspot.com`,
};

const app = initializeApp(firebaseConfig);

// Use React Native persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const storage = getStorage(app);

export { auth, storage };