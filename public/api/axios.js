/**
 * axios wrapper: attaches JWT token stored in SecureStore
 */
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000
});

api.interceptors.request.use(async (cfg) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  } catch (err) {
    console.warn('axios interceptor error', err.message);
  }
  return cfg;
}, (err) => Promise.reject(err));
