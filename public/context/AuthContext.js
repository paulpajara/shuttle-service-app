/**
 * AuthContext
 * - manages user state & token persistence
 * - registers Expo push token on login/restore
 * - initializes Socket.IO after login
 * - requests notification permissions and re-registers token when app becomes active
 */
import React, { createContext, useState, useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';
import { api } from '../api/axios';
import { initSocket, disconnectSocket, getSocket } from '../api/socket';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.user) {
            setUser(res.data.user);
            initSocket(token);
            // register push token
            await ensurePushTokenRegistered();
          } else {
            await SecureStore.deleteItemAsync('token');
          }
        } catch (err) {
          console.warn('auth restore failed', err.message);
          await SecureStore.deleteItemAsync('token');
        }
      }
      setReady(true);
    })();

    // AppState listener to re-register push token when app becomes active
    const sub = AppState.addEventListener ? AppState.addEventListener('change', _handleAppStateChange) : null;
    return () => {
      if (sub && sub.remove) sub.remove();
    };
  }, []);

  async function _handleAppStateChange(nextAppState) {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // app came to foreground — re-register token in case it changed
      try {
        await ensurePushTokenRegistered();
      } catch (err) {
        console.warn('re-register token failed', err.message);
      }
    }
    appState.current = nextAppState;
  }

  // requests notification permissions and registers token with backend
  async function ensurePushTokenRegistered() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
      }
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData?.data;
      if (!token) return null;

      // send to server if user is authenticated
      const localToken = await SecureStore.getItemAsync('pushToken');
      if (localToken === token) return token; // already registered

      // POST to backend (backend will dedupe)
      try {
        await api.post('/notifications/register', { token });
        await SecureStore.setItemAsync('pushToken', token);
      } catch (err) {
        console.warn('Failed to register token to backend', err.message);
      }
      return token;
    } catch (err) {
      console.warn('ensurePushTokenRegistered error', err.message);
      return null;
    }
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.token) {
      await SecureStore.setItemAsync('token', res.data.token);
      setUser(res.data.user);
      initSocket(res.data.token);
      // register token
      await ensurePushTokenRegistered();
    }
    return res.data;
  }

  async function register(payload) {
    const res = await api.post('/auth/register', payload);
    return res.data;
  }

  async function logout() {
    await SecureStore.deleteItemAsync('token');
    // keep push token on server — optional: call backend to remove token if desired
    disconnectSocket();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
