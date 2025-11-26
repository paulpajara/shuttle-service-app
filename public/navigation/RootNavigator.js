import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import PassengerNavigator from './PassengerNavigator';
import DriverNavigator from './DriverNavigator';
import AdminNavigator from './AdminNavigator';
import { ActivityIndicator, View } from 'react-native';

export default function RootNavigator() {
  const { user, ready } = useContext(AuthContext);

  if (!ready) return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );

  if (!user) return <NavigationContainer><AuthNavigator /></NavigationContainer>;

  switch (user.role) {
    case 'passenger': return <NavigationContainer><PassengerNavigator /></NavigationContainer>;
    case 'driver': return <NavigationContainer><DriverNavigator /></NavigationContainer>;
    case 'admin': return <NavigationContainer><AdminNavigator /></NavigationContainer>;
    default: return <NavigationContainer><AuthNavigator /></NavigationContainer>;
  }
}
