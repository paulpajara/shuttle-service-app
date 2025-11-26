import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { getSocket } from '../../api/socket';
import { api } from '../../api/axios';
import moment from 'moment';

/**
 * TripDetailScreen
 * - shows route polyline and stops
 * - subscribes to socket room 'trip:<tripId>' to receive 'shuttle:update'
 * - allows passenger to book a sample ride (calls /api/rides)
 */
export default function TripDetailScreen({ route }) {
  const { trip } = route.params;
  const [telemetry, setTelemetry] = useState(null);
  const [region, setRegion] = useState(null);

  useEffect(() => {
    const s = getSocket();
    if (s) {
      s.emit('join', { room: `trip:${trip._id}` });
      s.on('shuttle:update', (data) => {
        setTelemetry(data);
        if (data && data.location) {
          setRegion({
            latitude: data.location.lat,
            longitude: data.location.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          });
        }
      });
    }
    return () => {
      const s2 = getSocket();
      if (s2) s2.off('shuttle:update');
    };
  }, []);

  const stops = trip.route?.stops || [];
  const coords = stops.map(s => ({ latitude: s.lat, longitude: s.lng }));

  async function bookRide() {
    try {
      const payload = { tripScheduleId: trip._id, pickupStop: stops[0]?.name, dropoffStop: stops.slice(-1)[0]?.name };
      await api.post('/rides', payload);
      alert('Ride booked');
    } catch (err) {
      alert('Booking failed: ' + (err.response?.data?.error || err.message));
    }
  }

  return (
    <View style={{ flex:1 }}>
      {region ? (
        <MapView style={{ flex:1 }} initialRegion={region} region={region}>
          {coords.length > 0 && <Polyline coordinates={coords} strokeWidth={3} />}
          {telemetry && telemetry.location && (
            <Marker coordinate={{ latitude: telemetry.location.lat, longitude: telemetry.location.lng }} title='Shuttle'>
              <View style={{ backgroundColor:'blue', padding:6, borderRadius:6 }}>
                <Text style={{ color:'white' }}>Shuttle</Text>
              </View>
            </Marker>
          )}
          {stops.map((s, idx) => <Marker key={idx} coordinate={{ latitude: s.lat, longitude: s.lng }} title={s.name} />)}
        </MapView>
      ) : (
        <View style={{ padding:12 }}>
          <Text style={{ fontWeight:'bold' }}>{trip.route?.name}</Text>
          <Text>Departure: {moment(trip.departureTime).format('MMM D, HH:mm')}</Text>
          <Text>Arrival: {moment(trip.arrivalTime).format('MMM D, HH:mm')}</Text>
          <View style={{height:12}} />
          <Button title='Center map when shuttle updates' onPress={() => {
            if (telemetry && telemetry.location) {
              setRegion({
                latitude: telemetry.location.lat,
                longitude: telemetry.location.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
              });
            } else {
              alert('No telemetry yet');
            }
          }} />
        </View>
      )}
      <View style={{ position:'absolute', bottom:12, left:12, right:12 }}>
        <Button title='Book sample ride' onPress={bookRide} />
      </View>
    </View>
  );
}
