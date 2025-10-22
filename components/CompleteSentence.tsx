import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { GrammaticalConcept, GrammarTopic } from '../types';
import type { Translations } from '../App';

interface CompleteSentenceProps {
    addXP: (amount: number) => void;
    grammarTopics: GrammarTopic[];
    language: 'ar' | 'fr';
    triggerVisualEffect: (effect: 'correct-answer' | 'incorrect-answer', duration: number) => void;
    T: Translations;
}

interface GeneratedExercise {
    part1: string;
    part2: string;
    options: string[];
    correctAnswer: string;
}

const CompleteSentence: React.FC<CompleteSentenceProps> = ({ addXP, grammarTopics, language, triggerVisualEffect, T }) => {
    const topicOptions = useMemo(() => [T.allTopicsFilter, ...grammarTopics.map(t => t.title)], [grammarTopics, T.allTopicsFilter]);
    
    const [filter, setFilter] = useState<string>(topicOptions[0]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [currentExercise, setCurrentExercise] = useState<GeneratedExercise | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const generateNewExercise = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSelectedAnswer(null);
        setIsCorrect(null);

        const topic = filter === T.allTopicsFilter 
            ? grammarTopics[Math.floor(Math.random() * grammarTopics.length)].title
            : filter;
        
        const langName = language === 'ar' ? 'Arabic' : 'French';
        
        const prompt = `Create a fill-in-the-blank exercise for the grammar topic "${topic}" in ${langName}. The exercise should be clear and suitable for a language learner. Provide the sentence in two parts ("part1", "part2"), the correct answer that fills the blank ("correctAnswer"), and two plausible incorrect options. Ensure the "options" array contains exactly 3 items: the correct answer and two distractors, and that the items are shuffled.`;

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
                            part1: { type: Type.STRING },
                            part2: { type: Type.STRING },
                            options: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                            },
                            correctAnswer: { type: Type.STRING },
                        },
                    },
                },
            });

            const exercise = JSON.parse(response.text);
            // Basic validation
            if (exercise.part1 && exercise.correctAnswer && exercise.options?.length > 0) {
                 // Ensure options are shuffled client-side for extra randomness
                exercise.options.sort(() => Math.random() - 0.5);
                setCurrentExercise(exercise);
            } else {
                throw new Error("Invalid format from API");
            }
        } catch (e) {
            console.error("Failed to generate exercise:", e);
            setError(T.aiError);
            setCurrentExercise(null);
        } finally {
            setIsLoading(false);
        }
    }, [filter, language, T.allTopicsFilter, T.aiError, grammarTopics]);

    useEffect(() => {
        generateNewExercise();
    }, [filter, language, generateNewExercise]);
    
    const handleAnswer = (answer: string) => {
        if (selectedAnswer || !currentExercise) return;
        setSelectedAnswer(answer);
        const correct = answer === currentExercise.correctAnswer;
        setIsCorrect(correct);
        if (correct) {
            triggerVisualEffect('correct-answer', 250);
            addXP(5);
        } else {
            triggerVisualEffect('incorrect-answer', 5000);
        }
    }
    
    const getButtonClass = (option: string) => {
        if (selectedAnswer && currentExercise) {
          if (option === currentExercise.correctAnswer) return 'bg-green-500/80 border-green-500/80 text-white';
          if (option === selectedAnswer) return 'bg-red-500/80 border-red-500/80 text-white line-through';
          return 'bg-slate-800/60 border-slate-700/80 opacity-50';
        }
        return 'bg-slate-800/80 text-white border-brand/30 hover:bg-slate-700/80';
    };

    return (
    <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl shadow-xl shadow-brand/10 animation-pop-in p-6 md:p-8 backdrop-blur-sm">
      <h2 className="text-3xl font-bold text-gradient-brand mb-2">
        {T.completerTitle}
      </h2>
      <p className="text-lg text-gray-300 mb-6">
        {T.completerDescription}
      </p>

      <div className="mb-6">
        <label htmlFor="topic-filter-completer" className="block mb-2 text-sm font-medium text-gray-400">{T.selectRequiredType}</label>
        <select 
          id="topic-filter-completer"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-slate-800 border border-brand/30 text-white text-md rounded-lg focus-ring-brand block w-full p-2.5"
        >
            {topicOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      
      {isLoading ? (
         <div className="min-h-[250px] flex justify-center items-center">
            <div className="flex items-center gap-2 text-slate-400">
                <svg className="animate-spin h-5 w-5 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{T.aiGenerating}</span>
            </div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">
            <p>{error}</p>
        </div>
      ) : currentExercise ? (
        <>
            <div className="bg-slate-800/50 rounded-lg p-6 flex flex-col justify-center items-center transition-opacity duration-300 mb-6 border border-brand/20">
                <p className="text-gray-400 text-sm mb-4">{T.requiredLabel} <span className="font-bold text-gradient-brand">{filter}</span></p>
                <p className="text-2xl font-semibold text-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {currentExercise.part1}
                    <span className="inline-block w-32 border-b-2 border-dashed border-brand/50 mx-2 align-middle"></span>
                    {currentExercise.part2}
                </p>
            </div>
            
            <div className="space-y-4 mb-6">
                {(currentExercise.options || []).map((option, index) => (
                    <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={!!selectedAnswer}
                    className={`w-full text-center p-4 rounded-lg border font-semibold text-lg transition-all duration-300 ${getButtonClass(option)} ${!selectedAnswer ? 'interactive-press' : 'cursor-default'}`}
                    >
                    {option}
                    </button>
                ))}
            </div>

            {selectedAnswer && (
                <div className={`p-4 rounded-lg animation-fade-in-up border ${isCorrect ? 'bg-green-900/30 border-green-500/30' : 'bg-red-900/30 border-red-500/30'}`}>
                    <p className={`font-bold text-xl mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400' }`}>
                    {isCorrect ? T.correctAnswerXP : T.incorrectAnswerTitle}
                    </p>
                    <p className="text-gray-300">
                        {T.correctAnswerIs} <code>{currentExercise.correctAnswer}</code>
                    </p>
                </div>
            )}
            
            <button
                onClick={generateNewExercise}
                disabled={isLoading}
                className="w-full px-6 py-4 mt-6 font-bold text-white text-lg rounded-lg bg-slate-800 border border-brand/30 hover:bg-slate-700/80 transition-all duration-300 interactive-press"
            >
                {T.newExercise}
            </button>
        </>
      ) : (
        <div className="text-center py-12 text-slate-500">
            <p>{T.noExercises}</p>
        </div>
      )}
    </div>
  );
};

export default CompleteSentence;