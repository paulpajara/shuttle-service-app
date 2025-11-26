import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TripsListScreen from '../screens/passenger/TripsListScreen';
import TripDetailScreen from '../screens/passenger/TripDetailScreen';
import RideHistoryScreen from '../screens/passenger/RideHistoryScreen';

const Stack = createNativeStackNavigator();
export default function PassengerNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name='Trips' component={TripsListScreen} />
      <Stack.Screen name='TripDetail' component={TripDetailScreen} />
      <Stack.Screen name='RideHistory' component={RideHistoryScreen} />
    </Stack.Navigator>
  );
}
