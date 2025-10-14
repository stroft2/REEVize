export interface Example {
  sentence: string;
  explanation: string;
}

export interface GrammarTopic {
  title: string;
  description: string[]; // كل عنصر يمثل فقرة لتنظيم الشرح
  examples: Example[];
}

export type GrammaticalConcept = 'المفعول المطلق' | 'المفعول لأجله' | 'الحال' | 'الفعل اللازم والمتعدي' | 'الفعل اللازم' | 'الفعل المتعدي';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string; // شرح للإجابة الصحيحة
  topic: GrammaticalConcept;
}

export interface SimpleExample {
    sentence: string;
    explanation: string;
    topicTitle: string;
}

export interface QuizSet {
  id: string;
  title:string;
  description: string;
  questions: QuizQuestion[];
}

export interface FillInTheBlankExercise {
    part1: string; // الجزء قبل الفراغ
    part2: string; // الجزء بعد الفراغ
    requiredType: GrammaticalConcept;
    // للإختبار
    options?: string[];
    correctAnswer?: string;
}