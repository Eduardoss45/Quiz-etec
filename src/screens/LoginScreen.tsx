import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/global';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [rm, setRm] = useState('');

  const handleLogin = () => {
    if (rm.trim() !== '') {
      navigation.replace('Quiz', { rm }); // Deve ir direto para "Quiz" e memorizar o RM para enviar os dados no final do quiz
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Digite o seu RM</Text>
      <TextInput
        style={styles.input}
        placeholder="RM"
        value={rm}
        onChangeText={setRm}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
  title: { color: 'white', fontSize: 20, marginBottom: 20 },
  input: {
    backgroundColor: 'white',
    width: '80%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: { fontWeight: 'bold' },
});
