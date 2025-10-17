import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SIMPLE_EXAMPLES, GRAMMAR_TOPICS } from '../constants';
import { SimpleExample, GrammaticalConcept } from '../types';

interface ExampleGeneratorProps {
    addXP: (amount: number) => void;
}

interface QuickQuizData {
    question: string;
    options: string[];
    correctAnswer: string;
}

const ExampleGenerator: React.FC<ExampleGeneratorProps> = ({ addXP }) => {
  const [filter, setFilter] = useState<GrammaticalConcept | 'الكل'>('الكل');

  const filteredExamples = useMemo(() => {
    if (filter === 'الكل') {
      return SIMPLE_EXAMPLES;
    }
    return SIMPLE_EXAMPLES.filter(ex => ex.topicTitle === filter);
  }, [filter]);

  const [currentExample, setCurrentExample] = useState<SimpleExample>(() => filteredExamples[Math.floor(Math.random() * filteredExamples.length)]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [quickQuiz, setQuickQuiz] = useState<QuickQuizData | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);

  const generateQuizForExample = useCallback((example: SimpleExample): QuickQuizData | null => {
    switch (example.topicTitle) {
      case 'المفعول المطلق':
        return {
          question: 'ما هو الغرض من المفعول المطلق في هذه الجملة؟',
          options: ['تأكيد الفعل', 'بيان النوع', 'بيان العدد'],
          correctAnswer: 'تأكيد الفعل', // Simple examples are all for confirmation
        };
      case 'المفعول لأجله':
        return {
          question: 'ما السؤال الذي تجيب عليه كلمة `' + example.sentence.split(' ')[1] + '`?',
          options: ['كيف؟', 'متى؟', 'لماذا؟'],
          correctAnswer: 'لماذا?',
        };
      case 'الحال':
        return {
          question: 'ما نوع الحال في المثال السابق؟',
          options: ['مفردة', 'جملة', 'شبه جملة'],
          correctAnswer: example.explanation.includes('شبه جملة') ? 'شبه جملة' : 'مفردة',
        };
      case 'الفعل اللازم والمتعدي':
        return {
          question: 'هل الفعل في هذه الجملة لازم أم متعدٍ؟',
          options: ['لازم', 'متعدٍ'],
          correctAnswer: example.explanation.includes('لازم') ? 'لازم' : 'متعدٍ',
        };
       case 'الفعل المجرد والمزيد':
         return {
          question: 'هل الفعل في هذه الجملة مجرد أم مزيد؟',
          options: ['مجرد', 'مزيد'],
          correctAnswer: example.explanation.includes('مجرد') ? 'مجرد' : 'مزيد',
         }
      default:
        return null;
    }
  }, []);

  const generateNewExample = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setQuizResult(null);
    setSelectedQuizAnswer(null);
    setTimeout(() => {
      let newExample;
      do {
        newExample = filteredExamples[Math.floor(Math.random() * filteredExamples.length)];
      } while (newExample?.sentence === currentExample.sentence && filteredExamples.length > 1);
      setCurrentExample(newExample);
      setQuickQuiz(generateQuizForExample(newExample));
      setTimeout(() => {
          setIsAnimating(false);
      }, 50);
    }, 300);
  }, [isAnimating, filteredExamples, currentExample, generateQuizForExample]);
  
  useEffect(() => {
    setQuickQuiz(generateQuizForExample(currentExample));
  }, [currentExample, generateQuizForExample]);
  
  const handleQuizAnswer = (answer: string) => {
      if(quizResult || !quickQuiz) return;
      
      setSelectedQuizAnswer(answer);
      const isCorrect = answer === quickQuiz.correctAnswer;
      
      if(isCorrect) {
          setQuizResult('correct');
          addXP(10);
      } else {
          setQuizResult('incorrect');
      }
  }

  const getButtonClass = (option: string) => {
    if (selectedQuizAnswer && quickQuiz) {
      if (option === quickQuiz.correctAnswer) return 'bg-green-500/80';
      if (option === selectedQuizAnswer) return 'bg-red-500/80';
      return 'bg-slate-800/60 opacity-60';
    }
    return 'bg-slate-700/80 hover:bg-slate-600/80';
  };

  const topicOptions: (GrammaticalConcept | 'الكل')[] = ['الكل', ...GRAMMAR_TOPICS.map(topic => topic.title as GrammaticalConcept)];

  return (
    <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl shadow-xl shadow-purple-500/10 animation-pop-in p-6 md:p-8 backdrop-blur-sm">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 mb-2">
        مولّد الأمثلة السريعة
      </h2>
      <p className="text-lg text-gray-300 mb-6">
        احصل على مثال نحوي، ثم أجب عن سؤال سريع لكسب 10 نقاط خبرة!
      </p>

      <div className="mb-6">
        <label htmlFor="topic-filter" className="block mb-2 text-sm font-medium text-gray-400">فلترة حسب الدرس:</label>
        <select 
          id="topic-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as GrammaticalConcept | 'الكل')}
          className="bg-slate-800 border border-purple-400/30 text-white text-md rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5"
        >
            {topicOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 min-h-[150px] flex flex-col justify-center items-center transition-opacity duration-300 mb-6 border border-purple-400/20">
        <div className={`w-full text-center ${isAnimating ? 'opacity-0' : 'opacity-100 animation-fade-in'}`}>
            <p className="font-semibold text-2xl text-gray-100 mb-2">
            {`" ${currentExample.sentence} "`}
            </p>
            <p className="text-md text-gray-400">
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-fuchsia-300">توضيح:</span> {currentExample.explanation}
            </p>
        </div>
      </div>
      
       {quickQuiz && (
        <div className="animation-fade-in-up my-6 bg-slate-800/60 p-5 rounded-lg border border-purple-400/30">
            <p className="font-bold text-lg text-center mb-4" dangerouslySetInnerHTML={{ __html: quickQuiz.question }}></p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
                {quickQuiz.options.map(opt => (
                     <button 
                        key={opt}
                        onClick={() => handleQuizAnswer(opt)}
                        disabled={!!quizResult}
                        className={`w-full text-center p-3 rounded-lg font-semibold transition-all duration-200 ${getButtonClass(opt)}`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
            {quizResult === 'correct' && <p className="text-center mt-3 text-green-400 font-bold">إجابة صحيحة! +10 XP ✨</p>}
            {quizResult === 'incorrect' && <p className="text-center mt-3 text-red-400 font-bold">إجابة خاطئة! الصحيح هو: {quickQuiz.correctAnswer}</p>}
        </div>
       )}

      <button
        onClick={generateNewExample}
        disabled={isAnimating}
        className="w-full px-8 py-4 font-bold text-white text-xl rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnimating ? '...' : 'ولّد مثالاً جديداً'}
      </button>
    </div>
  );
};

export default ExampleGenerator;