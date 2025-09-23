import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/global';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ navigation, route }: Props) {
  const { score, total, rm } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✅</Text>
      <Text style={styles.title}>Quantidade de acertos</Text>
      <Text style={styles.score}>
        {score}/{total}
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Quiz', { rm })}>
        <Text style={styles.buttonText}>Reiniciar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
  icon: { fontSize: 80, marginBottom: 20 },
  title: { color: 'white', fontSize: 24, marginBottom: 10 },
  score: { color: 'white', fontSize: 32, fontWeight: 'bold', marginBottom: 30 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 10 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
