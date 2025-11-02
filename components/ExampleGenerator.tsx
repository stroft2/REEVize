import React, { useState, useMemo, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion, GrammarTopic } from '../types';
import type { Translations } from '../App';
import Quiz from './Quiz';

interface ExampleGeneratorProps {
    addXP: (amount: number) => void;
    grammarTopics: GrammarTopic[];
    language: 'ar' | 'fr';
    playSound: (sound: 'correct' | 'incorrect') => void;
    triggerVisualEffect: (effect: 'correct-answer' | 'incorrect-answer', duration: number) => void;
    T: Translations;
}


const ExampleGenerator: React.FC<ExampleGeneratorProps> = ({ addXP, grammarTopics, language, playSound, triggerVisualEffect, T }) => {
  const topicOptions = useMemo(() => [T.allTopicsFilter, ...grammarTopics.map(t => t.title)], [grammarTopics, T.allTopicsFilter]);
  
  const [filter, setFilter] = useState<string>(topicOptions[0]);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedQuestions(null);

    const topic = filter === T.allTopicsFilter 
        ? grammarTopics[Math.floor(Math.random() * grammarTopics.length)].title 
        : filter;
    
    const langName = language === 'ar' ? 'Arabic' : 'French';

    const prompt = `Generate a set of 5 multiple-choice quiz questions for the grammar topic "${topic}" in ${langName}. Each question must have exactly 3 options: one correct answer and two plausible incorrect distractors. The options must be shuffled. For each question, also provide a brief, one-sentence explanation for why the correct answer is right.`;

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
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    correctAnswer: { type: Type.STRING },
                                    explanation: { type: Type.STRING }
                                },
                                required: ['question', 'options', 'correctAnswer', 'explanation']
                            }
                        }
                    },
                    required: ['questions']
                }
            }
        });

        const data = JSON.parse(response.text);
        
        if(data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
            setGeneratedQuestions(data.questions.map((q: any) => ({...q, topic })));
        } else {
            throw new Error("Invalid format received from API");
        }
    } catch (e) {
        console.error("Failed to generate quiz:", e);
        setError(T.aiError);
    } finally {
        setIsLoading(false);
    }
  }, [filter, language, T.allTopicsFilter, T.aiError, grammarTopics]);
  
  const handleQuizComplete = (result: { score: number, total: number }) => {
      addXP(Math.round((result.score / result.total) * 50));
      setGeneratedQuestions(null);
  };
  
  const handleBack = () => {
      setGeneratedQuestions(null);
  };
  
  if (generatedQuestions) {
    return (
        <Quiz 
            questions={generatedQuestions}
            onBack={handleBack}
            onQuizComplete={handleQuizComplete}
            playSound={playSound}
            triggerVisualEffect={triggerVisualEffect}
            T={T}
        />
    );
  }

  return (
    <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl shadow-xl shadow-brand/10 animation-view-in p-6 md:p-8 backdrop-blur-sm">
      <h2 className="text-3xl font-bold text-gradient-brand mb-2">
        {T.generatorTitle}
      </h2>
      <p className="text-lg text-gray-300 mb-6 text-center">
        {T.generatorDescription}
      </p>

      <div className="mb-8 max-w-md mx-auto">
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

       <div className="flex justify-center min-h-[60px] items-center">
            {isLoading ? (
                <div className="flex items-center gap-2 text-slate-400 text-lg p-4 animation-fade-in">
                    <svg className="animate-spin h-6 w-6 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{T.aiGenerating}</span>
                </div>
            ) : error ? (
                <div className="text-center animation-fade-in">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button onClick={generateQuiz} className="btn btn-primary">{T.retryQuiz}</button>
                </div>
            ) : (
                <button
                    onClick={generateQuiz}
                    disabled={isLoading}
                    className="w-full max-w-md mx-auto btn btn-primary text-xl interactive-press disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100 animation-fade-in"
                >
                    {T.generateNewExample}
                </button>
            )}
        </div>
    </div>
  );
};

export default ExampleGenerator;