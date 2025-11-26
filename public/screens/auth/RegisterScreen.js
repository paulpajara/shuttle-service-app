import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

/**
 * Simple register screen. Uses backend /auth/register.
 * By default registers as 'passenger' per requirements.
 */
export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  async function onRegister() {
    try {
      await register({ email, password, name, role: 'passenger' });
      alert('Registered — you can now log in');
      navigation.goBack();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Register failed');
    }
  }

  return (
    <View style={{ padding:16 }}>
      <Text>Name</Text>
      <TextInput value={name} onChangeText={setName} style={{ borderWidth:1, padding:8, marginBottom:12 }} />
      <Text>University Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize='none' style={{ borderWidth:1, padding:8, marginBottom:12 }} />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth:1, padding:8, marginBottom:12 }} />
      <Button title='Register' onPress={onRegister} />
    </View>
  );
}
