export interface CourseSection {
  id: string;
  title: string;
  content: string;
}

export interface CourseMaterial {
  id: string;
  title: string;
  language?: string; // ar-TN default
  sections: CourseSection[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  choices?: string[];
  answer?: string; // free text or expected choice
}

export interface ExplainRequest {
  text: string;
  focus?: string; // e.g., "FM modulation"
  style?: 'fala9i' | 'formal';
  depth?: 'quick' | 'normal' | 'deep';
}

export interface ExplainResponse {
  outline: string[];
  explanation: string; // Derja
}

export interface QuizRequest {
  text: string;
  count?: number; // 3-10
}

export interface QuizResponse {
  questions: QuizQuestion[];
}


