import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import { initSocket } from './api/socket';
import { API_URL } from './config';

const TASK_NAME = 'BACKGROUND_TELEMETRY_TASK';

TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  if (!data || !data.locations || data.locations.length === 0) return;
  try {
    const token = await SecureStore.getItemAsync('token');
    if (!token) {
      console.warn('TelemetryTask: no auth token available');
      return;
    }
    const socket = initSocket(token);
    const loc = data.locations[0];
    const tripId = (typeof global.__CURRENT_TRIP_ID !== 'undefined') ? global.__CURRENT_TRIP_ID : null;
    const routeId = (typeof global.__CURRENT_ROUTE_ID !== 'undefined') ? global.__CURRENT_ROUTE_ID : null;
    const shuttleId = (typeof global.__SHUTTLE_ID !== 'undefined') ? global.__SHUTTLE_ID : 'shuttle-01';

    const payload = {
      tripScheduleId: tripId || null,
      routeId: routeId || null,
      shuttleId,
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      speed: loc.coords.speed ? Math.round(loc.coords.speed * 3.6) : null
    };

    console.log('TelemetryTask: sending payload', payload);

    if (socket && socket.connected) {
      socket.emit('shuttle:update', payload);
    } else {
      // fallback to HTTP POST
      try {
        await fetch(`${API_URL}/api/telemetry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('Telemetry POST failed', err.message);
      }
    }
  } catch (err) {
    console.error('Telemetry task failure', err);
  }
});
