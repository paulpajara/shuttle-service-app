import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

/**
 * Simple login screen.
 * On success, AuthContext stores token and switches navigation to proper role.
 */
export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function onLogin() {
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Login failed');
    } finally { setBusy(false); }
  }

  return (
    <View style={{ padding:16 }}>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize='none' style={{ borderWidth:1, padding:8, marginBottom:12 }} />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth:1, padding:8, marginBottom:12 }} />
      <Button title={busy ? 'Signing in...' : 'Sign in'} onPress={onLogin} />
      <View style={{ height:12 }} />
      <Button title='Register' onPress={() => navigation.navigate('Register')} />
    </View>
  );
}
