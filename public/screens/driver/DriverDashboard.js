import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { api } from '../../api/axios';

const TASK_NAME = 'BACKGROUND_TELEMETRY_TASK';

/**
 * DriverDashboard improvements:
 * - when driver starts a trip via startTrip(tripId) we set global.__CURRENT_TRIP_ID and __CURRENT_ROUTE_ID
 *   so the background TelemetryTask can attach telemetry to the correct trip automatically.
 * - when driver ends the trip we clear those globals.
 * - improved permission prompts and error handling for location permissions.
 */

export default function DriverDashboard({ navigation }) {
  const [assignments, setAssignments] = useState([]);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    (async () => {
      await fetchAssignments();
    })();
  }, []);

  async function fetchAssignments() {
    try {
      const res = await api.get('/driver/assignments');
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.warn('fetchAssignments failed', err.message);
    }
  }

  async function startTrip(tripId, routeId) {
    try {
      const res = await api.patch(`/driver/assignments/${tripId}/start`);
      if (res.data) {
        // set globals so TelemetryTask attaches telemetry to this trip
        global.__CURRENT_TRIP_ID = tripId;
        global.__CURRENT_ROUTE_ID = routeId || null;
        // optionally set shuttle id
        global.__SHUTTLE_ID = global.__SHUTTLE_ID || 'shuttle-01';
        alert('Trip started — telemetry will be attached to this trip');
        await fetchAssignments();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start trip');
    }
  }

  async function endTrip(tripId) {
    try {
      const res = await api.patch(`/driver/assignments/${tripId}/end`);
      if (res.data) {
        // clear globals so telemetry no longer attaches to this trip
        global.__CURRENT_TRIP_ID = null;
        global.__CURRENT_ROUTE_ID = null;
        alert('Trip ended');
        await fetchAssignments();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to end trip');
    }
  }

  async function startTracking() {
    // request foreground permission first
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return alert('Location permission required (foreground). Please enable it in settings.');
    }
    // request background permission
    const bg = await Location.requestBackgroundPermissionsAsync();
    if (bg.status !== 'granted') {
      return alert('Background location permission required. On Android you may need to create a dev client or request permissions in app settings.');
    }

    try {
      await Location.startLocationUpdatesAsync(TASK_NAME, {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 5000,
        distanceInterval: 5,
        foregroundService: {
          notificationTitle: 'Shuttle tracking',
          notificationBody: 'Sending shuttle location in background'
        }
      });
      setTracking(true);
      alert('Background tracking started');
    } catch (err) {
      console.warn('startLocationUpdatesAsync failed', err.message);
      alert('Could not start background tracking: ' + err.message);
    }
  }

  async function stopTracking() {
    try {
      const started = await Location.hasStartedLocationUpdatesAsync(TASK_NAME);
      if (started) await Location.stopLocationUpdatesAsync(TASK_NAME);
      setTracking(false);
      alert('Background tracking stopped');
    } catch (err) {
      console.warn('stopTracking failed', err.message);
      alert('Could not stop tracking: ' + err.message);
    }
  }

  return (
    <View style={{ flex:1, padding:12 }}>
      <Button title='Manual Telemetry (send one)' onPress={() => navigation.navigate('Telemetry')} />
      <View style={{height:12}} />
      <Button title={tracking ? 'Stop Background Tracking' : 'Start Background Tracking'} onPress={() => tracking ? stopTracking() : startTracking()} />
      <Text style={{ fontWeight:'bold', marginTop:12 }}>Assigned Trips</Text>
      <FlatList
        data={assignments}
        keyExtractor={(i)=>i._id}
        renderItem={({item}) => (
          <View style={{ padding:10, borderWidth:1, marginVertical:6 }}>
            <Text>{item.route?.name}</Text>
            <Text>Departure: {new Date(item.departureTime).toLocaleString()}</Text>
            <View style={{ flexDirection:'row', marginTop:8 }}>
              <Button title='Start' onPress={() => startTrip(item._id, item.route?._id)} />
              <View style={{ width:12 }} />
              <Button title='End' onPress={() => endTrip(item._id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}
