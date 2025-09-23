import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import type {
  ApiQuizQuestion,
  QuizQuestion,
  Charada,
  StatsData,
  ApiError,
} from '../../types/global';

const BASE_URL = 'http://10.78.0.4:8181/api';

// 🔄 Função para mapear do modelo da API para o modelo global
function mapApiToQuiz(apiData: ApiQuizQuestion[], bloco?: number, tema?: string): QuizQuestion[] {
  return apiData.map((q, idx) => ({
    id: idx + 1,
    enunciado: q.question,
    opcoes: q.answers.map(a => a.text),
    resposta_correta: q.answers.findIndex(a => a.key === q.correct_answer),
    bloco,
    tema,
  }));
}

export function useQuizApi() {
  const [data, setData] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // GET Quiz de física
  const getQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiQuizQuestion[]>(`${BASE_URL}/quiz/fisica`);
      const mapped = mapApiToQuiz(response.data, 1, 'fisica'); // 🔄 agora física
      setData(mapped);
      return mapped;
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || axiosError.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // GET Charadas de física
  const getCharadas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Charada[]>(`${BASE_URL}/charadas/fisica`);
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || axiosError.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // POST Stats
  const postStats = async (payload: StatsData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${BASE_URL}/stats`, payload);
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || axiosError.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, getQuiz, getCharadas, postStats };
}
