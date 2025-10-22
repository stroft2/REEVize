import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { GrammaticalConcept, GrammarTopic } from '../types';
import type { Translations } from '../App';

interface ExampleGeneratorProps {
    addXP: (amount: number) => void;
    grammarTopics: GrammarTopic[];
    language: 'ar' | 'fr';
    triggerVisualEffect: (effect: 'correct-answer' | 'incorrect-answer', duration: number) => void;
    T: Translations;
}

interface GeneratedData {
    sentence: string;
    explanation: string;
    quiz: {
        question: string;
        options: string[];
        correctAnswer: string;
    }
}

const ExampleGenerator: React.FC<ExampleGeneratorProps> = ({ addXP, grammarTopics, language, triggerVisualEffect, T }) => {
  const topicOptions = useMemo(() => [T.allTopicsFilter, ...grammarTopics.map(t => t.title)], [grammarTopics, T.allTopicsFilter]);
  
  const [filter, setFilter] = useState<string>(topicOptions[0]);
  const [currentData, setCurrentData] = useState<GeneratedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);

  const generateNewExample = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setQuizResult(null);
    setSelectedQuizAnswer(null);

    const topic = filter === T.allTopicsFilter 
        ? grammarTopics[Math.floor(Math.random() * grammarTopics.length)].title 
        : filter;
    
    const langName = language === 'ar' ? 'Arabic' : 'French';

    const prompt = `Generate a simple, clear example sentence for the grammar topic "${topic}" in ${langName}. Also provide a brief, one-sentence explanation for a language learner. Then, create a multiple-choice question with 3 options to test understanding of the example. The options must be shuffled.`;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sentence: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        quiz: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                options: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING }
                                },
                                correctAnswer: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        });

        const data = JSON.parse(response.text);
        // Basic validation
        if(data.sentence && data.quiz?.options?.length > 0) {
            setCurrentData(data);
        } else {
            throw new Error("Invalid format received from API");
        }

    } catch (e) {
        console.error("Failed to generate example:", e);
        setError(T.aiError);
        setCurrentData(null);
    } finally {
        setIsLoading(false);
    }
  }, [filter, language, T.allTopicsFilter, T.aiError, grammarTopics]);
  
  useEffect(() => {
    generateNewExample();
  }, [filter, language, generateNewExample]);
  
  const handleQuizAnswer = (answer: string) => {
      if(quizResult || !currentData?.quiz) return;
      
      setSelectedQuizAnswer(answer);
      const isCorrect = answer === currentData.quiz.correctAnswer;
      
      if(isCorrect) {
          setQuizResult('correct');
          triggerVisualEffect('correct-answer', 250);
          addXP(10);
      } else {
          setQuizResult('incorrect');
          triggerVisualEffect('incorrect-answer', 5000);
      }
  }

  const getButtonClass = (option: string) => {
    if (selectedQuizAnswer && currentData?.quiz) {
      if (option === currentData.quiz.correctAnswer) return 'bg-green-500/80';
      if (option === selectedQuizAnswer) return 'bg-red-500/80';
      return 'bg-slate-800/60 opacity-60';
    }
    return 'bg-slate-700/80 hover:bg-slate-600/80';
  };

  return (
    <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl shadow-xl shadow-brand/10 animation-pop-in p-6 md:p-8 backdrop-blur-sm">
      <h2 className="text-3xl font-bold text-gradient-brand mb-2">
        {T.generatorTitle}
      </h2>
      <p className="text-lg text-gray-300 mb-6">
        {T.generatorDescription}
      </p>

      <div className="mb-6">
        <label htmlFor="topic-filter" className="block mb-2 text-sm font-medium text-gray-400">{T.filterByLesson}</label>
        <select 
          id="topic-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-slate-800 border border-brand/30 text-white text-md rounded-lg focus-ring-brand block w-full p-2.5"
        >
            {topicOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 min-h-[150px] flex flex-col justify-center items-center transition-opacity duration-300 mb-6 border border-brand/20">
        {isLoading ? (
            <div className="flex items-center gap-2 text-slate-400">
                <svg className="animate-spin h-5 w-5 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{T.aiGenerating}</span>
            </div>
        ) : error ? (
            <p className="text-red-400">{error}</p>
        ) : currentData ? (
            <div className={`w-full text-center animation-fade-in`}>
                <p className="font-semibold text-2xl text-gray-100 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {`" ${currentData.sentence} "`}
                </p>
                <p className="text-md text-gray-400">
                <strong className="text-brand-light">{T.explanation}:</strong> {currentData.explanation}
                </p>
            </div>
        ) : (
            <p className="text-gray-500">{T.noExamples}</p>
        )}
      </div>
      
       {currentData?.quiz && !isLoading && (
        <div className="animation-fade-in-up my-6 bg-slate-800/60 p-5 rounded-lg border border-brand/30">
            <p className="font-bold text-lg text-center mb-4" dangerouslySetInnerHTML={{ __html: currentData.quiz.question }}></p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
                {currentData.quiz.options.map(opt => (
                     <button 
                        key={opt}
                        onClick={() => handleQuizAnswer(opt)}
                        disabled={!!quizResult}
                        className={`w-full text-center p-3 rounded-lg font-semibold transition-all duration-200 interactive-press ${getButtonClass(opt)}`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
            {quizResult === 'correct' && <p className="text-center mt-3 text-green-400 font-bold">{T.correctAnswer} +10 XP ✨</p>}
            {quizResult === 'incorrect' && <p className="text-center mt-3 text-red-400 font-bold">{T.incorrectAnswer} {currentData.quiz.correctAnswer}</p>}
        </div>
       )}

      <button
        onClick={generateNewExample}
        disabled={isLoading}
        className="w-full btn btn-primary text-xl interactive-press disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100"
      >
        {isLoading ? T.aiThinking : T.generateNewExample}
      </button>
    </div>
  );
};

export default ExampleGenerator;