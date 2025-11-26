import React from 'react';
import { View, Button } from 'react-native';
import { getSocket } from '../../api/socket';

/**
 * Manual telemetry sender for testing.
 * Replace <PUT_TRIP_ID> with a real trip id when using.
 */
export default function TelemetrySender() {
  async function sendSample() {
    const s = getSocket();
    if (!s || !s.connected) return alert('Socket not connected');
    const payload = {
      tripScheduleId: '<PUT_TRIP_ID>',
      routeId: '<PUT_ROUTE_ID>',
      shuttleId: 'shuttle-01',
      lat: 14.6579 + (Math.random()-0.5)/100,
      lng: 121.0280 + (Math.random()-0.5)/100,
      speed: 20 + Math.round(Math.random()*10)
    };
    s.emit('shuttle:update', payload);
    alert('Sent telemetry');
  }

  return (
    <View style={{ padding:12 }}>
      <Button title='Send Sample Telemetry' onPress={sendSample} />
    </View>
  );
}
