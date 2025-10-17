import React, { useState, useMemo } from 'react';
import { FILL_IN_THE_BLANK_EXERCISES } from '../constants';
import type { FillInTheBlankExercise, GrammaticalConcept } from '../types';

interface CompleteSentenceProps {
    addXP: (amount: number) => void;
}

const CompleteSentence: React.FC<CompleteSentenceProps> = ({ addXP }) => {
    const [filter, setFilter] = useState<GrammaticalConcept | 'الكل'>('الكل');
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const filteredExercises = useMemo(() => {
        if (filter === 'الكل') return FILL_IN_THE_BLANK_EXERCISES;
        return FILL_IN_THE_BLANK_EXERCISES.filter(ex => ex.requiredType === filter);
    }, [filter]);

    const [currentExercise, setCurrentExercise] = useState<FillInTheBlankExercise>(() => filteredExercises[Math.floor(Math.random() * filteredExercises.length)]);

    const generateNewExercise = () => {
        let newExercise;
        do {
            newExercise = filteredExercises[Math.floor(Math.random() * filteredExercises.length)];
        } while (newExercise === currentExercise && filteredExercises.length > 1);
        setCurrentExercise(newExercise);
        setSelectedAnswer(null);
        setIsCorrect(null);
    };
    
    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(answer);
        const correct = answer === currentExercise.correctAnswer;
        setIsCorrect(correct);
        if (correct) {
            addXP(5);
        }
    }
    
    const getButtonClass = (option: string) => {
        if (selectedAnswer) {
          if (option === currentExercise.correctAnswer) return 'bg-green-500/80 border-green-500/80 text-white';
          if (option === selectedAnswer) return 'bg-red-500/80 border-red-500/80 text-white line-through';
          return 'bg-slate-800/60 border-slate-700/80 opacity-50';
        }
        return 'bg-slate-800/80 text-white border-purple-400/30 hover:bg-slate-700/80';
    };

    const topicOptions: (GrammaticalConcept | 'الكل')[] = ['الكل', 'المفعول المطلق', 'المفعول لأجله', 'الحال', 'الفعل اللازم', 'الفعل المتعدي'];

    return (
    <div className="bg-slate-900/80 glowing-border border rounded-2xl shadow-2xl shadow-purple-500/10 animation-pop-in p-6 md:p-8 backdrop-blur-sm">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 mb-2">
        أكمل الجملة
      </h2>
      <p className="text-lg text-gray-300 mb-6">
        اختر الكلمة المناسبة لإكمال الفراغ. كل إجابة صحيحة تمنحك 5 نقاط خبرة!
      </p>

      <div className="mb-6">
        <label htmlFor="topic-filter-completer" className="block mb-2 text-sm font-medium text-gray-400">اختر نوع الكلمة المطلوبة:</label>
        <select 
          id="topic-filter-completer"
          value={filter}
          onChange={(e) => {
              const newFilter = e.target.value as GrammaticalConcept | 'الكل';
              setFilter(newFilter);
              const newFiltered = newFilter === 'الكل' ? FILL_IN_THE_BLANK_EXERCISES : FILL_IN_THE_BLANK_EXERCISES.filter(ex => ex.requiredType === newFilter);
              setCurrentExercise(newFiltered[Math.floor(Math.random() * newFiltered.length)]);
              setSelectedAnswer(null);
              setIsCorrect(null);
          }}
          className="bg-slate-800 border border-purple-400/30 text-white text-md rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5"
        >
            {topicOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      
      <div className="bg-slate-800/50 rounded-lg p-6 flex flex-col justify-center items-center transition-opacity duration-300 mb-6 border border-purple-400/20">
        <p className="text-gray-400 text-sm mb-4">المطلوب: <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-fuchsia-300">{currentExercise.requiredType}</span></p>
        <p className="text-2xl font-semibold text-center">
            {currentExercise.part1}
            <span className="inline-block w-32 border-b-2 border-dashed border-purple-400/50 mx-2 align-middle"></span>
            {currentExercise.part2}
        </p>
      </div>
       
        <div className="space-y-4 mb-6">
            {(currentExercise.options || []).map((option, index) => (
                <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedAnswer}
                className={`w-full text-center p-4 rounded-lg border font-semibold text-lg transition-all duration-300 ${getButtonClass(option)} ${!selectedAnswer ? 'transform hover:scale-105' : 'cursor-default'}`}
                >
                {option}
                </button>
            ))}
        </div>

        {selectedAnswer && (
            <div className={`p-4 rounded-lg animation-fade-in-up border ${isCorrect ? 'bg-green-900/30 border-green-500/30' : 'bg-red-900/30 border-red-500/30'}`}>
                <p className={`font-bold text-xl mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400' }`}>
                {isCorrect ? 'إجابة صحيحة! +5 XP ✨' : 'إجابة خاطئة.'}
                </p>
                <p className="text-gray-300">
                    الإجابة الصحيحة هي: <code>{currentExercise.correctAnswer}</code>
                </p>
            </div>
        )}
        
        <button
            onClick={generateNewExercise}
            className="w-full px-6 py-4 mt-6 font-bold text-white text-lg rounded-lg bg-slate-800 border border-purple-400/30 hover:bg-slate-700/80 transition-all duration-300"
        >
            تمرين جديد
        </button>
    </div>
  );
};

export default CompleteSentence;
