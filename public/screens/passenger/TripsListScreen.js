import React, { useEffect, useState } from 'react';
import { View, FlatList, Button, Text, TouchableOpacity } from 'react-native';
import { api } from '../../api/axios';
import TripItem from '../../components/TripItem';

/**
 * Shows list of upcoming trips. Calls GET /api/trips.
 */
export default function TripsListScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trips');
      setTrips(res.data.trips || []);
    } catch (err) {
      alert('Failed to load trips');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTrips(); }, []);

  return (
    <View style={{ flex:1, padding:12 }}>
      <Button title='Refresh' onPress={fetchTrips} />
      <FlatList
        data={trips}
        keyExtractor={(i) => i._id}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() => navigation.navigate('TripDetail', { trip: item })}>
            <TripItem trip={item} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => <Text>{loading ? 'Loading...' : 'No upcoming trips'}</Text>}
      />
      <View style={{height:12}} />
      <Button title='Ride History' onPress={() => navigation.navigate('RideHistory')} />
    </View>
  );
}
