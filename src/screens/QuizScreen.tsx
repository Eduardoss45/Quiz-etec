import { Camera, CameraView } from 'expo-camera';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, QuizQuestion, Charada } from '../../types/global';
import quizDataLocal from '../data/perguntas.json';
import charadasData from '../data/charadas.json';
import { useQuizApi } from '../hook/useQuizApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

export default function QuizScreen({ navigation, route }: Props) {
  const { rm } = route.params;

  // Hook de perguntas
  const { data: quizDataRemote, getQuiz } = useQuizApi();
  useEffect(() => {
    getQuiz();
  }, []);

  const allQuestions: QuizQuestion[] =
    (quizDataRemote as QuizQuestion[]) || quizDataLocal.perguntas;
  const [questions] = useState<QuizQuestion[]>(() =>
    allQuestions.sort(() => Math.random() - 0.5).slice(0, 16)
  );

  const QRSteps = [0, 5, 10, 15]; // posições onde entra charada/QR
  const isQRStep = (step: number) => QRSteps.includes(step);
  const charadas: Charada[] = charadasData;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);

  const cameraRef = useRef<CameraView | null>(null);

  const getQuestionIndex = (step: number) => {
    const numQRPassed = QRSteps.filter(qr => qr < step).length;
    return step - numQRPassed - 1;
  };

  const handleNext = () => {
    if (isAdvancing) return;
    setIsAdvancing(true);

    if (!isQRStep(currentIndex)) {
      const qIndex = getQuestionIndex(currentIndex);
      const question = questions[qIndex];
      if (question && selected === question.resposta_correta.toString()) {
        setScore(prev => prev + 1);
      }
    }

    if (currentIndex + 1 < 20) {
      setCurrentIndex(prev => prev + 1);
      setSelected(null);
      setTimeLeft(30);
    } else {
      setTimeout(() => {
        navigation.replace('Result', { score, total: 16, rm });
      }, 50);
    }

    setTimeout(() => setIsAdvancing(false), 50);
  };

  // Timer normal (somente para perguntas)
  useEffect(() => {
    if (isQRStep(currentIndex) || scanning) return;
    if (timeLeft === 0) {
      handleNext();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, currentIndex, scanning]);

  // Permissão da câmera
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Validação da charada via QR Code
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanning(false);

    const qrNumber = QRSteps.indexOf(currentIndex);
    const charada = charadas[qrNumber];

    if (!charada) {
      Alert.alert('Erro', 'Charada não encontrada');
      handleNext();
      return;
    }

    if (data.trim().toLowerCase() === charada.resposta_texto.trim().toLowerCase()) {
      setScore(prev => prev + 1);
      Alert.alert('✅ Correto!', 'Você acertou a charada.');
    } else {
      Alert.alert('❌ Errado', `Resposta esperada: ${charada.resposta_texto}`);
    }
    handleNext();
  };

  // ---------- Render QR Steps ----------
  if (isQRStep(currentIndex)) {
    const qrNumber = QRSteps.indexOf(currentIndex);
    const charada = charadas[qrNumber];

    if (!charada) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Charada não encontrada</Text>
        </View>
      );
    }

    if (scanning) {
      if (!hasPermission) {
        return (
          <View style={styles.container}>
            <Text style={styles.title}>Permissão de câmera necessária</Text>
          </View>
        );
      }
      return (
        <View style={{ flex: 1 }}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
          />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>{`Charada ${qrNumber + 1}`}</Text>
        <Text style={styles.question}>{charada.charada_texto}</Text>

        <TouchableOpacity style={styles.submit} onPress={() => setScanning(true)}>
          <Text style={styles.submitText}>Escanear QR Code</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------- Render Perguntas ----------
  const questionIndex = getQuestionIndex(currentIndex);
  const question = questions[questionIndex];
  if (!question) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.title}>Pergunta {questionIndex + 1}</Text>
      <Text style={styles.timer}>⏳ {timeLeft}s</Text>
      <Text style={styles.question}>{question.enunciado}</Text>

      {question.opcoes.map((opt, idx) => {
        const styleBtn = [styles.option] as any;
        if (selected !== null) {
          if (idx === question.resposta_correta) styleBtn.push(styles.correct);
          if (idx.toString() === selected && idx !== question.resposta_correta)
            styleBtn.push(styles.wrong);
        }
        return (
          <TouchableOpacity
            key={idx}
            style={styleBtn}
            onPress={() => setSelected(idx.toString())}
            disabled={!!selected}
          >
            <Text style={styles.optionText}>
              {String.fromCharCode(65 + idx)}) {opt}
            </Text>
          </TouchableOpacity>
        );
      })}

      {selected !== null && (
        <TouchableOpacity style={styles.submit} onPress={handleNext}>
          <Text style={styles.submitText}>{currentIndex + 1 === 20 ? 'Finalizar' : 'Enviar'}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: 'black', flex: 1 },
  title: { color: 'white', fontSize: 24, textAlign: 'center', marginBottom: 10 },
  timer: { color: '#ffcc00', fontSize: 18, textAlign: 'center', marginBottom: 20 },
  question: { color: 'white', fontSize: 18, marginBottom: 20, textAlign: 'center' },
  option: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginVertical: 8 },
  optionText: { fontSize: 16 },
  correct: { backgroundColor: '#d4edda', borderColor: 'green', borderWidth: 2 },
  wrong: { backgroundColor: '#f8d7da', borderColor: 'red', borderWidth: 2 },
  submit: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
