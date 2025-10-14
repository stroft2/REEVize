import React, { useState, useEffect } from 'react';
import type { QuizQuestion } from '../types';

interface QuizProps {
  questions: QuizQuestion[];
  onBack: () => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [displayPercentage, setDisplayPercentage] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setIsFinished(true);
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
      const finalPercentage = Math.round((score / questions.length) * 100);
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
  }, [isFinished, score, questions.length]);

  const getButtonClass = (option: string) => {
    if (selectedAnswer) {
      if (option === currentQuestion.correctAnswer) {
        return 'bg-green-500/80 border-green-500/80 text-white';
      }
      if (option === selectedAnswer) {
        return 'bg-red-500/80 border-red-500/80 text-white line-through';
      }
      return 'bg-slate-800/60 border-slate-700/80 opacity-50';
    }
    return 'bg-slate-800/80 text-white border-purple-400/30 hover:bg-slate-700/80';
  };

  if (isFinished) {
    return (
       <div className="text-center bg-slate-900/80 glowing-border border rounded-2xl shadow-2xl shadow-purple-500/10 animation-pop-in p-8 backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-4 text-white">انتهى الاختبار!</h2>
            <p 
                className="text-7xl font-bold my-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400"
                style={{ textShadow: '0 0 25px rgba(217, 70, 239, 0.5), 0 0 10px rgba(168, 85, 247, 0.5)' }}
            >
            {displayPercentage}%
            </p>
            <p className="text-xl mb-8 text-white">نتيجتك: {score} من {questions.length} إجابات صحيحة.</p>
            <div className="flex flex-col md:flex-row gap-4">
                <button onClick={onBack} className="w-full px-8 py-4 font-bold text-purple-300 text-xl rounded-lg bg-transparent border-2 border-purple-400/50 hover:bg-purple-400/10 hover:text-purple-200 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-500/50 shadow-lg">
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
    <div className="bg-slate-900/80 glowing-border border rounded-2xl shadow-2xl shadow-purple-500/10 animation-pop-in p-6 md:p-8 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">اختبر نفسك</h2>
        <p className="font-semibold text-gray-300">السؤال {currentQuestionIndex + 1} / {questions.length}</p>
      </div>
      <div className="w-full bg-slate-800/50 rounded-full h-2.5 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
      </div>

      <div key={currentQuestionIndex} className="animation-fade-in">
        <h3 className="text-xl md:text-2xl font-semibold mb-6 min-h-[60px] text-white">{currentQuestion.question}</h3>
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
            <p className={`font-bold ${isCorrect ? 'text-green-400' : 'text-red-400' }`}>
              {isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة.'}
            </p>
            <p className="text-gray-300">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;