import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import { api } from '../../api/axios';

/**
 * Minimal admin dashboard showing driver applications.
 * Uses /api/admin/driver-applications and /api/admin/driver-applications/:id/approve
 */
export default function AdminDashboard() {
  const [apps, setApps] = useState([]);
  useEffect(() => { (async ()=>{ try { const res = await api.get('/admin/driver-applications'); setApps(res.data.apps || []); } catch (err) { console.warn(err.message); } })(); }, []);

  async function approve(id) {
    try { await api.post(`/admin/driver-applications/${id}/approve`); alert('Approved'); setApps(apps.filter(a=>a._id!==id)); } catch (err) { alert('Approval failed'); }
  }

  return (
    <View style={{ flex:1, padding:12 }}>
      <Text style={{ fontWeight:'bold' }}>Driver Applications</Text>
      <FlatList data={apps} keyExtractor={(a)=>a._id} renderItem={({item}) => (
        <View style={{ padding:10, borderWidth:1, marginVertical:6 }}>
          <Text>{item.user?.email}</Text>
          <Text>License: {item.licenseNumber}</Text>
          <Button title='Approve' onPress={() => approve(item._id)} />
        </View>
      )} />
    </View>
  );
}
