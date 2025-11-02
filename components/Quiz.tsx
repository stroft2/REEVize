import React, { useState, useEffect } from 'react';
import type { QuizQuestion } from '../types';
import type { Translations } from '../App';

interface QuizProps {
  questions: QuizQuestion[];
  onBack: () => void;
  onQuizComplete: (result: { score: number, total: number }) => void;
  playSound: (sound: 'correct' | 'incorrect') => void;
  triggerVisualEffect: (effect: 'correct-answer' | 'incorrect-answer', duration: number) => void;
  T: Translations;
}

const Quiz: React.FC<QuizProps> = ({ questions, onBack, onQuizComplete, playSound, triggerVisualEffect, T }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [displayPercentage, setDisplayPercentage] = useState(0);
  
  const finalPercentage = isFinished && questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const circumference = 2 * Math.PI * 90;
  const earnedXp = isFinished && questions.length > 0 ? Math.round((score / questions.length) * 50) : 0; // Max 50 XP for a perfect score

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    let currentScore = score;
    if (correct) {
      playSound('correct');
      triggerVisualEffect('correct-answer', 250);
      currentScore = score + 1;
      setScore(currentScore);
    } else {
      playSound('incorrect');
      triggerVisualEffect('incorrect-answer', 5000);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setIsFinished(true);
        onQuizComplete({ score: currentScore, total: questions.length });
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setIsFinished(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setDisplayPercentage(0);
  };
  
  useEffect(() => {
    if (isFinished) {
      if (finalPercentage === 0) {
        setDisplayPercentage(0);
        return;
      }
      
      const duration = 1200;
      let startTimestamp: number | null = null;
      
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 4); 

        setDisplayPercentage(Math.floor(easedProgress * finalPercentage));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setDisplayPercentage(finalPercentage);
        }
      };
      
      window.requestAnimationFrame(step);
    }
  }, [isFinished, finalPercentage]);

  const getButtonClass = (option: string) => {
    if (selectedAnswer) {
      if (option === currentQuestion.correctAnswer) return 'bg-green-500/80 border-green-500/80 text-white';
      if (option === selectedAnswer) return 'bg-red-500/80 border-red-500/80 text-white line-through';
      return 'bg-slate-800/60 border-slate-700/80 opacity-50';
    }
    return 'bg-slate-800/80 text-white border-brand/30 hover:bg-slate-700/80';
  };
  
  const strokeDashoffset = circumference - (displayPercentage / 100) * circumference;

  const getResultMessage = () => {
    if (finalPercentage === 100) return { message: T.quizResult100, icon: '🏆' };
    if (finalPercentage >= 80) return { message: T.quizResult80, icon: '🎉' };
    if (finalPercentage >= 60) return { message: T.quizResult60, icon: '👍' };
    if (finalPercentage >= 40) return { message: T.quizResult40, icon: '💪' };
    return { message: T.quizResult0, icon: '📚' };
  }

  if (isFinished) {
    const { message, icon } = getResultMessage();
    return (
       <div className="text-center bg-slate-900/70 border border-slate-700/50 rounded-2xl shadow-2xl shadow-brand/10 animation-pop-in-bouncy p-8 backdrop-blur-sm">
            <h2 className="text-4xl font-bold mb-2 text-white">
                {message} <span className="text-3xl">{icon}</span>
            </h2>
            <p className="text-lg text-slate-300 mb-6">{T.yourFinalScore}</p>
            
            <div className="relative w-56 h-56 mx-auto my-4 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--c-accent)" />
                            <stop offset="100%" stopColor="var(--c-brand)" />
                        </linearGradient>
                    </defs>
                    <circle cx="112" cy="112" r="90" stroke="var(--c-brand-light)" opacity="0.15" strokeWidth="16" fill="transparent" />
                    <circle
                        cx="112" cy="112" r="90"
                        stroke="url(#progressGradient)"
                        strokeWidth="16"
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.25, 1, 0.5, 1)' }}
                    />
                </svg>
                <div className="flex flex-col items-center">
                    <span 
                        className="text-6xl font-bold text-gradient-brand"
                        style={{ textShadow: '0 0 15px var(--c-brand-light)' }}
                    >
                        {displayPercentage}%
                    </span>
                    <span className="text-lg text-slate-400 font-medium">({score} / {questions.length})</span>
                </div>
            </div>
             <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-4 py-2 text-yellow-300 font-bold text-lg inline-block mb-8">
                {T.youEarnedXP.replace('{xp}', earnedXp.toString())} ✨
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
                <button onClick={onBack} className="w-full btn btn-secondary text-xl interactive-press">
                    {T.backToMenu}
                </button>
                <button onClick={resetQuiz} className="w-full btn btn-primary text-xl interactive-press">
                    {T.retakeQuiz}
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl shadow-2xl shadow-brand/10 animation-pop-in p-6 md:p-8 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gradient-brand">{T.quizYourself}</h2>
        <p className="font-semibold text-gray-300 text-lg">{T.question} {currentQuestionIndex + 1} / {questions.length}</p>
      </div>
      <div className="w-full bg-slate-800/50 rounded-full h-2.5 mb-8">
        <div className="progress-bar-fg h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}></div>
      </div>

      <div key={currentQuestionIndex} className="animation-fade-in">
        <h3 className="text-xl md:text-2xl font-semibold mb-8 min-h-[60px] text-white leading-relaxed">{currentQuestion.question}</h3>
        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={!!selectedAnswer}
              className={`w-full p-4 rounded-lg border font-semibold text-lg transition-all duration-300 ${T.lang === 'ar' ? 'text-right' : 'text-left'} ${getButtonClass(option)} ${!selectedAnswer ? 'interactive-press' : 'cursor-default'}`}
            >
              {option}
            </button>
          ))}
        </div>
        {selectedAnswer && (
          <div className={`mt-6 p-4 rounded-lg animation-fade-in-up border ${isCorrect ? 'bg-green-900/30 border-green-500/30' : 'bg-red-900/30 border-red-500/30'}`}>
            {isCorrect ? (
              <>
                <p className="font-bold text-lg text-green-400">{T.correctAnswer}</p>
                <p className="text-gray-300 mt-1">{currentQuestion.explanation}</p>
              </>
            ) : (
              <>
                <p className="font-bold text-lg text-red-400">{T.incorrectAnswerTitle}</p>
                <p className="text-gray-300 mt-1" dangerouslySetInnerHTML={{ __html: `${T.incorrectAnswer} <strong>${currentQuestion.correctAnswer}</strong>`}}></p>
                <p className="text-gray-300 mt-1">{currentQuestion.explanation}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;