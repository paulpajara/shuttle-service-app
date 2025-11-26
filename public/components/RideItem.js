import React from 'react';
import { View, Text } from 'react-native';
import moment from 'moment';

/**
 * Simple ride item for history list
 */
export default function RideItem({ ride }) {
  return (
    <View style={{ padding:12, borderWidth:1, marginVertical:6 }}>
      <Text>Trip: {ride.tripSchedule?.route?.name || ride.tripSchedule}</Text>
      <Text>Pickup: {ride.pickupStop} - Dropoff: {ride.dropoffStop}</Text>
      <Text>Booked: {moment(ride.timeBooked).format('MMM D, HH:mm')}</Text>
      <Text>Status: {ride.status}</Text>
      {ride.boardedAt && <Text>Boarded: {moment(ride.boardedAt).format('HH:mm')}</Text>}
      {ride.completedAt && <Text>Completed: {moment(ride.completedAt).format('HH:mm')}</Text>}
    </View>
  );
}
