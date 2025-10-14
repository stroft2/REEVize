export interface Example {
  sentence: string;
  explanation: string;
}

export interface GrammarTopic {
  title: string;
  description: string[]; // كل عنصر يمثل فقرة لتنظيم الشرح
  examples: Example[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string; // شرح للإجابة الصحيحة
}

export interface SimpleExample {
    sentence: string;
    explanation: string;
}
