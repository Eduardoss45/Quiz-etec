export type RootStackParamList = {
  Login: undefined;
  Quiz: { rm: string };
  Result: { score: number; total: number; rm: string };
  QrCodeScanner: { onSuccess: () => void }; // para o fluxo da charada
};

// Opções de resposta
export interface QuizOption {
  key: string; // 'A', 'B', 'C', etc.
  text: string; // texto da resposta
}

// Pergunta
export interface QuizQuestion {
  id: number;
  enunciado: string; // pergunta
  opcoes: string[]; // array de respostas
  resposta_correta: number; // índice da resposta correta (0,1,2...)
  bloco?: number; // opcional, se quiser dividir blocos
  tema?: string; // opcional
}

// Charada
export interface Charada {
  id: number;
  tema_value: string;
  qr_code_id: number;
  charada_texto: string;
  resposta_texto: string;
}

// Dados do quiz
export interface QuizData {
  perguntas: QuizQuestion[];
}

// Dados das charadas
export type CharadasData = Charada[];

// types/global.ts

// --- Modelo vindo do backend (API) ---
export interface ApiQuizQuestion {
  question: string;
  answers: { key: string; text: string }[];
  correct_answer: string;
}

// --- Dados de estatísticas enviados no POST ---
export interface StatsData {
  aluno_rm: string;
  tema_jogado: string;
  pontuacao_final: number;
  total_perguntas: number;
}

// --- Estrutura de erro da API ---
export interface ApiError {
  message: string;
}
