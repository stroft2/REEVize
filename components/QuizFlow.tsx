import React from 'react';
import Quiz from './Quiz';
import type { QuizSet, QuizQuestion } from '../types';
import type { Translations } from '../App';

type Sound = 'correct' | 'incorrect' | 'level-up' | 'purchase' | 'achievement';

interface QuizFlowProps {
    selectedQuizSet: QuizSet | null;
    quizQuestions: QuizQuestion[] | null;
    onSelectQuizSet: (qs: QuizSet | null) => void;
    onStartQuiz: (count: number) => void;
    onBack: () => void;
    onQuizComplete: (result: { score: number, total: number }) => void;
    playSound: (sound: Sound) => void;
    triggerVisualEffect: (effect: 'correct-answer' | 'incorrect-answer', duration: number) => void;
    quizSets: QuizSet[];
    T: Translations;
}

const QuizFlow: React.FC<QuizFlowProps> = ({ selectedQuizSet, quizQuestions, onSelectQuizSet, onStartQuiz, onBack, onQuizComplete, playSound, triggerVisualEffect, quizSets, T }) => {
    if (quizQuestions) {
      return <Quiz questions={quizQuestions} onBack={onBack} onQuizComplete={onQuizComplete} playSound={playSound} triggerVisualEffect={triggerVisualEffect} T={T} />;
    }

    if (selectedQuizSet) {
         const counts = new Set<number>();
         const totalQuestions = selectedQuizSet.questions.length;
         if (totalQuestions > 0) {
             [5, 10, 15].forEach(c => {
                 if (totalQuestions >= c) {
                     counts.add(c);
                 }
             });
             if (totalQuestions > 0 && !counts.has(totalQuestions)) {
                 counts.add(totalQuestions);
             }
         }
         const availableCounts = Array.from(counts).sort((a, b) => a - b);

         return (
             <div className="animation-view-in bg-slate-900/70 border border-slate-700/50 rounded-2xl shadow-2xl shadow-brand/10 p-8 text-center backdrop-blur-sm">
                <button onClick={() => onSelectQuizSet(null)} className="flex items-center gap-2 text-brand hover:text-brand-light font-bold mb-6 transition-colors mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${T.lang === 'fr' ? 'transform scale-x-[-1]' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    {T.quizSelectionBack}
                </button>
                <h2 className="text-3xl font-bold text-center mb-2 text-gradient-brand">
                    {selectedQuizSet.title}
                </h2>
                 <p className="text-gray-400 mb-8 text-lg">{T.quizQuestionCount}</p>
                 <div className="flex justify-center gap-4 flex-wrap">
                     {availableCounts.length > 0 ? availableCounts.map(count => (
                         <button 
                            key={count}
                            onClick={() => onStartQuiz(count)}
                            className="px-8 py-4 font-bold text-white text-xl rounded-lg bg-slate-800 border border-brand/30 hover:bg-gradient-brand hover:shadow-[0_0_20px_var(--c-brand-light)] transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus-ring-brand shadow-lg interactive-press"
                         >
                             {count} {T.questionsLabel}
                         </button>
                     )) : <p className="text-gray-500">{T.quizNotEnoughQuestions}</p>}
                 </div>
             </div>
         )
    }
    
    return (
      <div className="animation-view-in">
        <h2 className="text-4xl font-bold text-center mb-10 text-gradient-brand">
          {T.quizSelectionTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizSets.map((quizSet, index) => (
            <div 
              key={quizSet.id} 
              className="bg-slate-900/70 border border-slate-700/50 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-[1.03] cursor-pointer hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/20 backdrop-blur-sm animation-slide-in-staggered"
              onClick={() => onSelectQuizSet(quizSet)}
              style={{'animationDelay': `${index * 70}ms`} as React.CSSProperties}
            >
              <div className="p-6 h-full flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-2">{quizSet.title}</h3>
                <p className="text-gray-400 flex-grow">{quizSet.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
}

export default QuizFlow;