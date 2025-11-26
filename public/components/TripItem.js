import React from 'react';
import { View, Text } from 'react-native';
import moment from 'moment';

/**
 * Small presentational component for a trip schedule.
 */
export default function TripItem({ trip }) {
  return (
    <View style={{ padding:12, borderWidth:1, marginVertical:6 }}>
      <Text style={{ fontWeight:'bold' }}>{trip.route?.name || 'Unnamed route'}</Text>
      <Text>Departure: {moment(trip.departureTime).format('MMM D, HH:mm')}</Text>
      <Text>Arrival (planned): {moment(trip.arrivalTime).format('MMM D, HH:mm')}</Text>
      <Text>Status: {trip.status}</Text>
    </View>
  );
}
