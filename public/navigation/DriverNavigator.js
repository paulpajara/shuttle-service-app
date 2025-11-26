import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverDashboard from '../screens/driver/DriverDashboard';
import TelemetrySender from '../screens/driver/TelemetrySender';

const Stack = createNativeStackNavigator();
export default function DriverNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name='DriverDashboard' component={DriverDashboard} />
      <Stack.Screen name='Telemetry' component={TelemetrySender} />
    </Stack.Navigator>
  );
}
