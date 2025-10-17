import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { GrammarTopic, LessonLevel, QuizQuestion } from '../types';

interface GrammarSectionProps {
  topic: GrammarTopic;
  onBack: () => void;
  completedLevels: number;
  onCompleteLevel: (topicId: string, levelId: number) => void;
}

const SectionIcon: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center ml-3 text-purple-400 shrink-0">
    {icon}
  </div>
);

type QuizState = 'idle' | 'in_progress' | 'passed' | 'failed';

const LevelQuiz: React.FC<{ 
    questions: QuizQuestion[], 
    onQuizPass: () => void,
    onRetry: () => void,
}> = ({ questions, onQuizPass, onRetry }) => {
    const [answers, setAnswers] = useState<{[key: number]: string}>({});
    const [showResults, setShowResults] = useState(false);

    // Reset state when questions change
    useEffect(() => {
        setAnswers({});
        setShowResults(false);
    }, [questions]);

    const handleAnswer = (questionIndex: number, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };

    const checkAnswers = () => {
        setShowResults(true);
        const allCorrect = questions.every((q, i) => answers[i] === q.correctAnswer);
        if (allCorrect) {
            setTimeout(onQuizPass, 2000);
        }
    };

    const isAllCorrect = questions.every((q, i) => answers[i] === q.correctAnswer);

    return (
        <div className="mt-8 p-6 bg-slate-800/50 border border-purple-400/30 rounded-lg animation-fade-in-up">
            <h3 className="text-2xl font-bold text-center mb-6">📝 اختبار قصير للتأكيد</h3>
            <div className="space-y-6">
                {questions.map((q, index) => (
                    <div key={q.question}>
                        <p className="font-bold text-lg mb-3 text-white">{index + 1}. {q.question}</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            {q.options.map(opt => {
                                const isSelected = answers[index] === opt;
                                let buttonClass = 'bg-slate-700/80 hover:bg-slate-600/80';
                                if (showResults) {
                                    if (opt === q.correctAnswer) {
                                        buttonClass = 'bg-green-500/80';
                                    } else if (isSelected && opt !== q.correctAnswer) {
                                        buttonClass = 'bg-red-500/80';
                                    } else {
                                        buttonClass = 'bg-slate-800/60 opacity-60';
                                    }
                                } else if (isSelected) {
                                    buttonClass = 'bg-purple-600';
                                }
                                return (
                                    <button 
                                        key={opt}
                                        onClick={() => !showResults && handleAnswer(index, opt)}
                                        disabled={showResults}
                                        className={`w-full text-center p-3 rounded-lg font-semibold transition-all duration-200 ${buttonClass}`}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            
            {!showResults && (
                 <button 
                    onClick={checkAnswers}
                    disabled={Object.keys(answers).length !== questions.length}
                    className="w-full mt-6 px-8 py-3 font-bold text-white text-lg rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
                  >
                    تحقق من الإجابات
                </button>
            )}

            {showResults && !isAllCorrect && (
                <button 
                    onClick={onRetry}
                    className="w-full mt-6 px-8 py-3 font-bold text-white text-lg rounded-lg bg-purple-600 hover:bg-purple-500 transition-all duration-300"
                  >
                    حاول بأسئلة جديدة 🔄
                </button>
            )}

            {showResults && (
                <div className="mt-6 text-center font-bold text-xl p-4 rounded-lg" style={{backgroundColor: isAllCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: isAllCorrect ? '#34d399' : '#f87171'}}>
                    {isAllCorrect ? 'رائع! إجابات صحيحة. ✅' : 'إحدى الإجابات خاطئة، حاول مجددًا!'}
                </div>
            )}
        </div>
    );
};


const GrammarSection: React.FC<GrammarSectionProps> = ({ topic, onBack, completedLevels, onCompleteLevel }) => {
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(completedLevels < topic.levels.length ? completedLevels : 0);
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  const currentLevel = topic.levels[selectedLevelIndex];
  const progressPercentage = (completedLevels / topic.levels.length) * 100;
  
  const generateLevelQuiz = useCallback(() => {
    if (!currentLevel.quiz || currentLevel.quiz.length < 2) {
        setQuizQuestions([]);
        return;
    };
    
    // Shuffle and pick 2 unique questions
    const shuffled = [...currentLevel.quiz].sort(() => 0.5 - Math.random());
    setQuizQuestions(shuffled.slice(0, 2));
  }, [currentLevel.quiz]);
  
  // Reset quiz state and generate questions if level changes
  useEffect(() => {
      setQuizState('idle');
      generateLevelQuiz();
  }, [selectedLevelIndex, generateLevelQuiz]);

  const handleCompletePress = () => {
      if (currentLevel.quiz && currentLevel.quiz.length > 0) {
          generateLevelQuiz(); // Generate initial set of questions
          setQuizState('in_progress');
      } else {
          // If no quiz, complete directly
          onCompleteLevel(topic.id, currentLevel.id);
          if(selectedLevelIndex + 1 < topic.levels.length) {
             setSelectedLevelIndex(prev => prev + 1);
          }
      }
  };
  
  const handleQuizPass = () => {
      setQuizState('passed');
      setTimeout(() => {
        onCompleteLevel(topic.id, currentLevel.id);
        if(selectedLevelIndex + 1 < topic.levels.length) {
            setSelectedLevelIndex(prev => prev + 1);
        } else {
            // If it's the last level, stay but show as completed
            // The state change from onCompleteLevel will handle the UI update
        }
        setQuizState('idle');
      }, 1500);
  };
  
  const handleQuizRetry = () => {
      // Logic to generate NEW questions
      generateLevelQuiz();
  };

  const isLevelCompletable = selectedLevelIndex === completedLevels && completedLevels < topic.levels.length;

  return (
    <div className="animation-pop-in">
        <button onClick={onBack} className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold mb-6 transition-colors">
             <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            العودة إلى قائمة الدروس
        </button>

        <header className="mb-8">
            <div className="flex items-center mb-4">
                <span className="text-5xl mr-4">{topic.icon}</span>
                <div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                        {topic.title}
                    </h1>
                    <p className="text-slate-400 text-lg">{topic.description}</p>
                </div>
            </div>
            <div className="progress-bar-bg">
                <div className="progress-bar-fg" style={{ width: `${progressPercentage}%` }}></div>
            </div>
        </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Levels Sidebar */}
        <aside className="md:w-1/3">
            <h3 className="text-xl font-bold mb-4 text-white">مستويات الدرس:</h3>
            <div className="space-y-2">
                {topic.levels.map((level, index) => {
                    const isCompleted = index < completedLevels;
                    const isCurrent = index === completedLevels;
                    const isLocked = index > completedLevels;
                    const isSelected = index === selectedLevelIndex;

                    return (
                        <button 
                            key={level.id}
                            onClick={() => !isLocked && setSelectedLevelIndex(index)}
                            disabled={isLocked}
                            className={`w-full text-right p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between
                                ${isLocked ? 'bg-slate-800/50 border-transparent text-slate-500 cursor-not-allowed' : ''}
                                ${!isLocked && isSelected ? 'bg-purple-500/20 border-purple-500' : ''}
                                ${!isLocked && !isSelected ? 'bg-slate-800/80 border-transparent hover:border-purple-500/50' : ''}
                            `}
                        >
                            <div className="flex items-center">
                                {isCompleted ? <span className="text-green-400 ml-3 text-xl">✓</span> : isCurrent ? <span className="text-yellow-400 ml-3 text-xl">▶</span> : <span className="text-slate-600 ml-3 text-xl">🔒</span>}
                                <div>
                                    <p className="font-bold">{level.title}</p>
                                    <p className="text-xs text-slate-400">+{level.xpReward} نقطة خبرة</p>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>
        </aside>

        {/* Level Content */}
        <main className="flex-1 bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-slate-700/50">
                <SectionIcon icon={<>📖</>} />
                <h2 className="text-3xl font-bold text-white">{currentLevel.title}</h2>
            </div>
            
            <div className="text-lg text-gray-300 leading-loose mb-8 space-y-5 prose prose-invert max-w-none">
                {currentLevel.content.map((paragraph, index) => (
                    <div key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
                ))}
            </div>

            {currentLevel.examples.length > 0 && (
            <div className="mb-8">
                <div className="flex items-center mb-4">
                    <SectionIcon icon={<>💡</>} />
                    <h3 className="text-2xl font-semibold text-white">أمثلة توضيحية:</h3>
                </div>
                <ul className="space-y-4">
                {currentLevel.examples.map((example, index) => (
                    <li key={index} className="bg-slate-800/60 p-4 rounded-lg border-l-4 border-fuchsia-500/50">
                        <p className="font-semibold text-xl text-gray-100 mb-2" dir="rtl">{`" ${example.sentence} "`}</p>
                        <p className="text-md text-gray-400"><span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-fuchsia-400 ml-1">الشرح:</span> {example.explanation}</p>
                    </li>
                ))}
                </ul>
            </div>
            )}

            {isLevelCompletable && quizState === 'idle' && (
                 <button 
                    onClick={handleCompletePress}
                    className="w-full mt-4 px-8 py-4 font-bold text-white text-xl rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 shadow-lg"
                  >
                    أكملت المستوى، اختبر فهمك!
                </button>
            )}
            
            {isLevelCompletable && quizState === 'in_progress' && quizQuestions.length > 0 && (
                <LevelQuiz questions={quizQuestions} onQuizPass={handleQuizPass} onRetry={handleQuizRetry} />
            )}

            {isLevelCompletable && quizState === 'passed' && (
                <div className="w-full mt-4 px-8 py-4 font-bold text-white text-xl rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-center animation-pop-in">
                    أحسنت! +{currentLevel.xpReward} XP ✨ جاري الانتقال...
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default GrammarSection;