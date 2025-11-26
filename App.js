import './public/TelemetryTask'; // ensures TaskManager task is defined
import React from 'react';
import { AuthProvider } from './public/context/AuthContext';
import RootNavigator from './public/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style='auto' />
    </AuthProvider>
  );
}
