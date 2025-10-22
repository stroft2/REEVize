// FIX: Import `useRef` from 'react' to resolve the "Cannot find name 'useRef'" error.
import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { GrammarTopic, LessonLevel, QuizQuestion } from '../types';
import type { Translations } from '../App';

interface GrammarSectionProps {
  topic: GrammarTopic;
  onBack: () => void;
  completedLevels: number;
  onCompleteLevel: (topicId: string, levelId: number) => void;
  triggerVisualEffect: (effect: 'correct-answer' | 'incorrect-answer', duration: number) => void;
  T: Translations;
}

const MasteryModal: React.FC<{ topic: GrammarTopic; onBack: () => void; T: Translations }> = ({ topic, onBack, T }) => {
    useEffect(() => {
        const confettiCount = 100;
        const confettiContainer = document.body;
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            const size = Math.random() * 8 + 4;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.position = 'fixed';
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.top = `${-20}px`;
            const randomColor = `hsl(${Math.random() * 360}, 90%, 60%)`;
            confetti.style.backgroundColor = randomColor;
            confetti.style.opacity = '0.9';
            confetti.style.zIndex = '100';
            confetti.style.pointerEvents = 'none';
            confetti.style.animation = `fall ${Math.random() * 3 + 4}s linear ${Math.random() * 1}s infinite`;
            confetti.innerHTML = `<style>@keyframes fall { to { transform: translateY(${window.innerHeight + 20}px) rotate(${Math.random() * 720}deg); opacity: 0; } }</style>`;
            confettiContainer.appendChild(confetti);
            setTimeout(() => confetti.remove(), 7000);
        }
    }, []);

    return (
        <div className="mastery-modal-backdrop">
            <div className="mastery-modal-content">
                <div className="icon-container breathing-glow" style={{'animationDuration': '4s'} as React.CSSProperties} dangerouslySetInnerHTML={{ __html: topic.icon }} />
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400 mb-2">
                    {T.masteryTitle}
                </h2>
                <p className="text-lg text-slate-300 mb-6">{T.masteryDescription.replace('{topicTitle}', topic.title)}</p>
                <button
                    onClick={onBack}
                    className="w-full md:w-auto btn btn-primary text-xl interactive-press"
                >
                    {T.continueLearning}
                </button>
            </div>
        </div>
    );
};

const LevelQuiz: React.FC<{ 
    questions: QuizQuestion[], 
    onQuizPass: () => void,
    onRetry: () => void,
    triggerVisualEffect: (effect: 'correct-answer' | 'incorrect-answer', duration: number) => void,
    T: Translations,
    showTranslations: boolean;
}> = ({ questions, onQuizPass, onRetry, triggerVisualEffect, T, showTranslations }) => {
    const [answers, setAnswers] = useState<{[key: number]: string}>({});
    const [showResults, setShowResults] = useState(false);

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
            triggerVisualEffect('correct-answer', 250);
            onQuizPass();
        } else {
            triggerVisualEffect('incorrect-answer', 5000);
        }
    };
    
    const isPassed = useMemo(() => {
        if (!showResults) return false;
        return questions.every((q, i) => answers[i] === q.correctAnswer);
    }, [showResults, answers, questions]);

    return (
        <div className="mt-8 border-t-2 border-[var(--c-border)] pt-6">
            <h4 className="text-xl font-bold mb-4 flex items-center gap-2" style={{color: 'var(--c-brand-light)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {T.quizTitle}
            </h4>
            <div className="space-y-6">
                {questions.map((q, qIndex) => (
                    <div key={qIndex}>
                        <p className="font-semibold mb-2">{qIndex + 1}. {q.question}</p>
                        {showTranslations && q.question_ar && <p className="text-sm text-slate-400 mb-2 font-tajawal rtl pr-2 border-r-2 border-slate-600">{q.question_ar}</p>}
                        <div className="grid grid-cols-1 gap-2">
                            {q.options.map(opt => {
                                const isSelected = answers[qIndex] === opt;
                                let buttonClass = 'bg-[var(--c-bg-muted)] hover:bg-[var(--c-border)]';
                                if (showResults) {
                                    if (opt === q.correctAnswer) {
                                        buttonClass = 'bg-green-500/80';
                                    } else if (isSelected) {
                                        buttonClass = 'bg-red-500/80';
                                    }
                                }
                                return (
                                    <button 
                                        key={opt}
                                        onClick={() => !showResults && handleAnswer(qIndex, opt)}
                                        className={`p-3 rounded-lg text-left transition-all interactive-press ${buttonClass} ${isSelected && !showResults ? 'ring-2 ring-brand' : ''}`}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                        {showResults && answers[qIndex] !== q.correctAnswer && (
                           <div className="text-sm mt-2 p-2 rounded bg-yellow-900/30 text-yellow-300">
                                <p dangerouslySetInnerHTML={{__html: `${T.incorrectAnswerTitle}: <strong>${q.correctAnswer}</strong>.`}}></p>
                                <p>{q.explanation}</p>
                                {showTranslations && q.explanation_ar && <p className="mt-1 font-tajawal rtl">{q.explanation_ar}</p>}
                           </div>
                        )}
                         {showResults && answers[qIndex] === q.correctAnswer && (
                             <div className="text-sm mt-2 p-2 rounded bg-green-900/30 text-green-300">
                                <p>{T.correctAnswer} {q.explanation}</p>
                                {showTranslations && q.explanation_ar && <p className="mt-1 font-tajawal rtl">{q.explanation_ar}</p>}
                             </div>
                         )}
                    </div>
                ))}
            </div>
            {!showResults && Object.keys(answers).length === questions.length && (
                <button onClick={checkAnswers} className="mt-6 w-full btn btn-primary interactive-press">
                    {T.checkAnswers}
                </button>
            )}
            {showResults && (
                isPassed ? (
                    <p className="mt-6 p-4 text-center font-bold text-green-400 bg-green-900/30 rounded-lg">{T.quizCorrect}</p>
                ) : (
                    <div className="mt-6 flex gap-4">
                        <button onClick={() => { setAnswers({}); setShowResults(false); onRetry(); }} className="w-full btn bg-slate-600 hover:bg-slate-500 text-white interactive-press">
                            {T.retryQuiz}
                        </button>
                    </div>
                )
            )}
        </div>
    );
};

const GrammarSection: React.FC<GrammarSectionProps> = ({ topic, onBack, completedLevels, onCompleteLevel, triggerVisualEffect, T }) => {
    const [activeLevelId, setActiveLevelId] = useState<number>(completedLevels < topic.levels.length ? completedLevels + 1 : topic.levels.length);
    const [showTranslations, setShowTranslations] = useState(false);

    const handleSelectLevel = (levelId: number) => {
        if (levelId <= completedLevels + 1) {
            setActiveLevelId(levelId);
        }
    };

    const handleCompleteQuiz = (level: LessonLevel) => {
        onCompleteLevel(topic.id, level.id);
        if (level.id < topic.levels.length) {
            setActiveLevelId(level.id + 1);
        }
    };

    const isMasteredOnce = useRef(false);

    const isMastered = useMemo(() => {
        const mastered = completedLevels === topic.levels.length;
        if(mastered) {
          isMasteredOnce.current = true;
        }
        return mastered;
    }, [completedLevels, topic.levels.length]);
    
    // This effect handles the one-time display of the mastery modal.
    const [showMasteryModal, setShowMasteryModal] = useState(false);
    useEffect(() => {
        if (isMastered && !isMasteredOnce.current) {
            setShowMasteryModal(true);
        }
    }, [isMastered]);

    if (showMasteryModal) {
        return <MasteryModal topic={topic} onBack={() => {setShowMasteryModal(false); onBack();}} T={T} />;
    }

    const activeLevel = topic.levels.find(l => l.id === activeLevelId);

    return (
        <div className="animation-pop-in">
            <button onClick={onBack} className="flex items-center gap-2 text-[var(--c-brand)] hover:text-[var(--c-brand-light)] font-bold mb-6 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${T.lang === 'fr' ? 'transform scale-x-[-1]' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                {T.backToLessons}
            </button>
             <div className="level-content-area shadow-xl shadow-brand/10 p-6 md:p-8">
                <div className="flex items-center mb-6">
                    <div className="w-16 h-16 text-[var(--c-brand)]" dangerouslySetInnerHTML={{ __html: topic.icon }} />
                    <h2 className={`text-4xl font-bold ${T.lang === 'ar' ? 'mr-4' : 'ml-4'}`}>{topic.title}</h2>
                </div>

                <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--c-brand-light)'}}>{T.lessonLevels}</h3>
                    <div className="flex flex-wrap gap-3">
                        {topic.levels.map((level, index) => {
                            const isCompleted = level.id <= completedLevels;
                            const isActive = level.id === activeLevelId;
                            const isLocked = level.id > completedLevels + 1;
                            return (
                                <button
                                    key={level.id}
                                    onClick={() => handleSelectLevel(level.id)}
                                    disabled={isLocked}
                                    className={`px-4 py-2 rounded-lg font-bold transition-all border-2 animation-slide-in-staggered
                                        ${isLocked ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed' : ''}
                                        ${!isLocked && isActive ? 'text-white' : ''}
                                        ${!isLocked && !isActive ? (isCompleted ? 'bg-green-500/20 border-green-500/50 text-green-300 hover:bg-green-500/30' : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700') : ''}
                                    `}
                                    style={{
                                        animationDelay: `${index * 50}ms`,
                                        ...( !isLocked && isActive ? { backgroundColor: 'var(--c-brand)', borderColor: 'var(--c-brand-light)' } : {})
                                    } as React.CSSProperties}
                                >
                                    {isLocked ? '🔒' : (isCompleted ? '✓' : '●')} {T.lang === 'fr' && level.title_ar ? level.title.split(':')[0] : (level.title.split(':')[0] || T.level)}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {activeLevel && (
                    <div key={activeLevel.id} className="animation-fade-in">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <h3 className="text-3xl font-bold text-white mb-4">{activeLevel.title}</h3>
                             {T.lang === 'fr' && (
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-sm font-bold text-slate-300 font-tajawal">{ T.lang === 'fr' ? 'إظهار الترجمة' : ''}</span>
                                    <button
                                        onClick={() => setShowTranslations(!showTranslations)}
                                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${showTranslations ? 'bg-[var(--c-brand)]' : 'bg-slate-700'}`}
                                    >
                                        <span className={`${showTranslations ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
                                    </button>
                                </div>
                            )}
                        </div>
                        {showTranslations && activeLevel.title_ar && <h3 className="text-xl font-bold text-slate-400 mb-4 rtl font-tajawal">{activeLevel.title_ar}</h3>}

                        <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-strong:text-[var(--c-brand-light)] prose-code:text-amber-300 prose-code:bg-slate-800/70 prose-code:p-1 prose-code:rounded-md">
                            {activeLevel.content.map((p, i) => (
                                <div key={i}>
                                    <p dangerouslySetInnerHTML={{ __html: p }}></p>
                                    {showTranslations && activeLevel.content_ar?.[i] && <div className="translation-content rtl" dangerouslySetInnerHTML={{ __html: activeLevel.content_ar[i] }}></div>}
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-6">
                            <h4 className="text-xl font-bold mb-3 flex items-center gap-2" style={{color: 'var(--c-brand-light)'}}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h4M5 8h1.5M5 11h1.5M5 14h1.5" /></svg>
                                {T.examplesTitle}
                            </h4>
                            <div className="space-y-4">
                                {activeLevel.examples.map((ex, i) => (
                                    <div key={i} className="bg-slate-800/60 p-4 rounded-lg border-l-4 border-brand">
                                        <p className="font-mono text-lg text-white mb-2">{ex.sentence}</p>
                                        {showTranslations && ex.sentence_ar && <p className="font-tajawal text-md text-slate-300 mb-2 rtl">{ex.sentence_ar}</p>}
                                        <p className="text-slate-400"><strong className="text-brand-light">{T.explanation}:</strong> {ex.explanation}</p>
                                        {showTranslations && ex.explanation_ar && <p className="text-slate-400 mt-1 rtl font-tajawal">{ex.explanation_ar}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {activeLevel.quiz && activeLevel.quiz.length > 0 && activeLevelId === completedLevels + 1 && (
                            <LevelQuiz 
                                questions={activeLevel.quiz}
                                onQuizPass={() => handleCompleteQuiz(activeLevel)}
                                onRetry={() => {}}
                                triggerVisualEffect={triggerVisualEffect}
                                T={T}
                                showTranslations={showTranslations}
                            />
                        )}

                        {activeLevelId <= completedLevels && (
                             <div className="mt-8 p-4 text-center font-bold text-green-400 bg-green-900/30 rounded-lg border border-green-500/50">
                                {T.levelPassed.replace('{xp}', activeLevel.xpReward.toString())}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GrammarSection;