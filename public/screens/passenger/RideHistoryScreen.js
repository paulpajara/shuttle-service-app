import React, { useEffect, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { api } from '../../api/axios';
import RideItem from '../../components/RideItem';

/**
 * Ride history - calls GET /api/rides
 */
export default function RideHistoryScreen() {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/rides');
        setRides(res.data.rides || []);
      } catch (err) { console.warn(err.message); }
    })();
  }, []);

  return (
    <View style={{ flex:1, padding:12 }}>
      <FlatList data={rides} keyExtractor={(r)=>r._id} renderItem={({item}) => <RideItem ride={item} />} ListEmptyComponent={() => <Text>No rides yet</Text>} />
    </View>
  );
}
