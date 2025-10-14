import React, { useState, useEffect } from 'react';
import { QUIZ_QUESTIONS } from '../constants';

// Randomize quiz questions order
const getShuffledQuestions = () => [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);

const Quiz: React.FC = () => {
  const [questions, setQuestions] = useState(getShuffledQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [displayPercentage, setDisplayPercentage] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Prevent changing answer

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
    setQuestions(getShuffledQuestions());
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
      
      const duration = 1000;
      let startTimestamp: number | null = null;
      
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        setDisplayPercentage(Math.floor(progress * finalPercentage));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      
      window.requestAnimationFrame(step);
    }
  }, [isFinished, score, questions.length]);

  const getButtonClass = (option: string) => {
    if (selectedAnswer) {
      if (option === currentQuestion.correctAnswer) {
        return 'bg-green-500 border-green-600 text-white'; // Correct answer
      }
      if (option === selectedAnswer) {
        return 'bg-red-500 border-red-600 text-white line-through'; // Wrongly selected answer
      }
      return 'bg-gray-700 border-gray-600 opacity-60'; // Not selected
    }
    return 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'; // Default
  };

  if (isFinished) {
    return (
      <div className="text-center bg-gray-900/80 shadow-2xl rounded-2xl p-8 animation-pop-in border-2 border-gray-700">
        <h2 className="text-3xl font-bold mb-4 text-white">انتهى الاختبار!</h2>
        <p className="text-6xl font-bold my-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
          {displayPercentage}%
        </p>
        <p className="text-xl mb-8 text-white">نتيجتك: {score} من {questions.length} إجابات صحيحة.</p>
        <button onClick={resetQuiz} className="w-full px-8 py-4 font-bold text-white text-xl rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-violet-500 shadow-lg">
          إعادة الاختبار
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/80 shadow-2xl rounded-2xl p-6 md:p-8 animation-pop-in border-2 border-gray-700/50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">اختبر نفسك</h2>
        <p className="font-semibold text-gray-300">السؤال {currentQuestionIndex + 1} / {questions.length}</p>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-violet-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
      </div>

      <div key={currentQuestionIndex} className="animation-fade-in">
        <h3 className="text-xl md:text-2xl font-semibold mb-6 min-h-[60px] text-white">{currentQuestion.question}</h3>
        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={!!selectedAnswer}
              className={`w-full text-right p-4 rounded-lg border-2 font-semibold text-lg transition-all duration-300 ${getButtonClass(option)} ${!selectedAnswer ? 'transform hover:scale-105' : 'cursor-default'}`}
            >
              {option}
            </button>
          ))}
        </div>
         {selectedAnswer && (
          <div className={`mt-6 p-4 rounded-lg animation-fade-in-up border ${isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <p className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600' }`}>
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