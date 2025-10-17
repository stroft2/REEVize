export interface Example {
  sentence: string;
  explanation: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: GrammaticalConcept;
}

export interface LessonLevel {
  id: number;
  title: string;
  content: string[];
  examples: Example[];
  xpReward: number;
  quiz?: QuizQuestion[]; // Quiz at the end of the level
}

export interface GrammarTopic {
  id: string; // Added ID for progress tracking
  title: string;
  icon: string; // Emoji or SVG string
  description: string; // Short description for the main card
  levels: LessonLevel[];
}

export type GrammaticalConcept = 'المفعول المطلق' | 'المفعول لأجله' | 'الحال' | 'الفعل المجرد والمزيد' | 'الفعل اللازم والمتعدي' | 'الفعل اللازم' | 'الفعل المتعدي';


export interface SimpleExample {
    sentence: string;
    explanation: string;
    topicTitle: GrammaticalConcept;
}

export interface QuizSet {
  id: string;
  title:string;
  description: string;
  questions: QuizQuestion[];
}

export interface FillInTheBlankExercise {
    part1: string;
    part2: string;
    requiredType: GrammaticalConcept;
    options?: string[];
    correctAnswer?: string;
}

// New types for gamification
export interface StoreItem {
    id: string;
    name: string;
    description: string;
    icon: string;
    cost: number;
    type: 'badge' | 'theme';
    payload?: {
        colors?: Record<string, string>;
        multiplier?: number;
    };
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    // Condition function to check if the achievement is unlocked
    condition: (progress: UserProgress, payload?: any) => boolean;
}


export interface UserProgress {
    xp: number;
    purchasedItems: string[];
    completedLevels: {
        [topicId: string]: number; // topicId -> number of completed levels
    };
    activeThemeId: string;
    achievements: string[];
    lastLoginDate: string; // ISO date string: YYYY-MM-DD
}