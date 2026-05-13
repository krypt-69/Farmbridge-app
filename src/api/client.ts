import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../utils/firebase';

const extra = Constants.expoConfig?.extra ?? {};
const BASE_URL = extra.backendUrl;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Request interceptor: attach fresh token
apiClient.interceptors.request.use(async (config) => {
  try {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken(true);
      await SecureStore.setItemAsync('firebaseToken', token);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      const stored = await SecureStore.getItemAsync('firebaseToken');
      if (stored) {
        config.headers.Authorization = `Bearer ${stored}`;
      }
    }
  } catch (error) {
    const stored = await SecureStore.getItemAsync('firebaseToken');
    if (stored) {
      config.headers.Authorization = `Bearer ${stored}`;
    }
  }
  return config;
});

// Response interceptor: handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token invalid/expired, force logout
      await SecureStore.deleteItemAsync('firebaseToken');
      emitForceLogout();
      // We need a way to trigger logout from outside React components.
      // We'll emit a custom event that AuthContext listens to.
      if (typeof window !== 'undefined') {
        // React Native doesn't have window, but we can use EventEmitter
      }
      // Alternatively, just sign out from Firebase, which will trigger onAuthStateChanged
      if (auth.currentUser) {
        await auth.signOut();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;