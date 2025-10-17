import React, { useState, useEffect } from 'react';
import type { QuizQuestion } from '../types';

interface QuizProps {
  questions: QuizQuestion[];
  onBack: () => void;
  onQuizComplete: (result: { score: number, total: number }) => void;
  playSound: (sound: 'correct' | 'incorrect') => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onBack, onQuizComplete, playSound }) => {
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
      currentScore = score + 1;
      setScore(currentScore);
    } else {
      playSound('incorrect');
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
    return 'bg-slate-800/80 text-white border-purple-500/30 hover:bg-slate-700/80';
  };
  
  const strokeDashoffset = circumference - (displayPercentage / 100) * circumference;

  const getResultMessage = () => {
    if (finalPercentage === 100) return { message: "ممتاز! علامة كاملة!", icon: '🏆' };
    if (finalPercentage >= 80) return { message: "رائع! أداء متميز!", icon: '🎉' };
    if (finalPercentage >= 60) return { message: "جيد جدًا! استمر في التقدم.", icon: '👍' };
    if (finalPercentage >= 40) return { message: "لا بأس، يمكنك فعل ما هو أفضل.", icon: '💪' };
    return { message: "تحتاج للمزيد من المراجعة، حاول مجددًا.", icon: '📚' };
  }

  if (isFinished) {
    const { message, icon } = getResultMessage();
    return (
       <div className="text-center bg-slate-900/70 border border-slate-700/50 rounded-2xl shadow-2xl shadow-purple-500/10 animation-pop-in p-8 backdrop-blur-sm">
            <h2 className="text-4xl font-bold mb-2 text-white">
                {message} <span className="text-3xl">{icon}</span>
            </h2>
            <p className="text-lg text-slate-300 mb-6">نتيجتك النهائية هي:</p>
            
            <div className="relative w-56 h-56 mx-auto my-4 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="112" cy="112" r="90" stroke="rgba(168, 85, 247, 0.15)" strokeWidth="16" fill="transparent" />
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
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#d946ef" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="flex flex-col items-center">
                    <span 
                        className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400"
                        style={{ textShadow: '0 0 15px rgba(217, 70, 239, 0.3)' }}
                    >
                        {displayPercentage}%
                    </span>
                    <span className="text-lg text-slate-400 font-medium">({score} / {questions.length})</span>
                </div>
            </div>
             <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-4 py-2 text-yellow-300 font-bold text-lg inline-block mb-8">
                لقد ربحت {earnedXp} نقطة خبرة ✨
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
                <button onClick={onBack} className="w-full px-8 py-4 font-bold text-purple-300 text-xl rounded-lg bg-transparent border-2 border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-200 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-500/50 shadow-lg">
                    العودة للقائمة
                </button>
                <button onClick={resetQuiz} className="w-full px-8 py-4 font-bold text-white text-xl rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 shadow-lg">
                    إعادة الاختبار
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl shadow-2xl shadow-purple-500/10 animation-pop-in p-6 md:p-8 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">اختبر نفسك</h2>
        <p className="font-semibold text-gray-300 text-lg">السؤال {currentQuestionIndex + 1} / {questions.length}</p>
      </div>
      <div className="w-full bg-slate-800/50 rounded-full h-2.5 mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}></div>
      </div>

      <div key={currentQuestionIndex} className="animation-fade-in">
        <h3 className="text-xl md:text-2xl font-semibold mb-8 min-h-[60px] text-white leading-relaxed">{currentQuestion.question}</h3>
        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={!!selectedAnswer}
              className={`w-full text-right p-4 rounded-lg border font-semibold text-lg transition-all duration-300 ${getButtonClass(option)} ${!selectedAnswer ? 'transform hover:scale-105' : 'cursor-default'}`}
            >
              {option}
            </button>
          ))}
        </div>
        {selectedAnswer && (
          <div className={`mt-6 p-4 rounded-lg animation-fade-in-up border ${isCorrect ? 'bg-green-900/30 border-green-500/30' : 'bg-red-900/30 border-red-500/30'}`}>
            <p className={`font-bold text-lg ${isCorrect ? 'text-green-400' : 'text-red-400' }`}>
              {isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة.'}
            </p>
            <p className="text-gray-300 mt-1">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;