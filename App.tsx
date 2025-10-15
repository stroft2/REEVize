import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import GrammarSection from './components/GrammarSection';
import ExampleGenerator from './components/ExampleGenerator';
import Quiz from './components/Quiz';
import ParticleBackground from './components/ParticleBackground';
import CompleteSentence from './components/CompleteSentence';
import { GRAMMAR_TOPICS, QUIZ_SETS } from './constants';
import type { QuizSet, QuizQuestion } from './types';

type View = 'lessons' | 'generator' | 'completer' | 'quiz';

const App: React.FC = () => {
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const [activeView, setActiveView] = useState<View>('lessons');
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  
  // Quiz State
  const [selectedQuizSet, setSelectedQuizSet] = useState<QuizSet | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  
  const [pillStyle, setPillStyle] = useState({});
  const buttonRefs = {
    lessons: useRef<HTMLButtonElement>(null),
    generator: useRef<HTMLButtonElement>(null),
    completer: useRef<HTMLButtonElement>(null),
    quiz: useRef<HTMLButtonElement>(null),
  };

  const updatePillStyle = (view: View) => {
    const button = buttonRefs[view].current;
    if (button) {
      setPillStyle({
        width: button.offsetWidth,
        left: button.offsetLeft,
      });
    }
  };

  useLayoutEffect(() => {
    updatePillStyle(activeView);
  }, [activeView]);

  useEffect(() => {
    const handleResize = () => updatePillStyle(activeView);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeView]);


  const handleViewChange = (newView: View) => {
    if (newView === activeView || isAnimatingOut) return;
    setIsAnimatingOut(true);
    updatePillStyle(newView);
    setTimeout(() => {
      setActiveView(newView);
      setSelectedQuizSet(null);
      setQuizQuestions(null);
      setIsAnimatingOut(false);
    }, 300);
  };
  
  const handleQuizStart = (questionCount: number) => {
    if (!selectedQuizSet) return;
    const shuffled = [...selectedQuizSet.questions].sort(() => 0.5 - Math.random());
    setQuizQuestions(shuffled.slice(0, questionCount));
  }

  const selectedTopic = GRAMMAR_TOPICS[selectedTopicIndex];

  const renderContent = () => {
    switch (activeView) {
      case 'lessons':
        return (
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-1/3 animation-slide-in-staggered" style={{ animationDelay: '100ms', opacity: 0 }}>
              <div className="bg-slate-900/80 border border-purple-400/20 rounded-2xl p-4 sticky top-40 shadow-lg backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-4 text-white">قائمة الدروس</h2>
                <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {GRAMMAR_TOPICS.map((topic, index) => (
                    <li key={index}>
                      <button
                        onClick={() => setSelectedTopicIndex(index)}
                        className={`w-full text-right px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-md ${selectedTopicIndex === index ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'}`}
                      >
                        {topic.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
            <section className="md:w-2/3">
              {selectedTopic && <GrammarSection key={selectedTopicIndex} topic={selectedTopic} />}
            </section>
          </div>
        );
      case 'generator':
        return <ExampleGenerator />;
      case 'completer':
        return <CompleteSentence />;
      case 'quiz':
        if (quizQuestions) {
          return <Quiz questions={quizQuestions} onBack={() => { setQuizQuestions(null); setSelectedQuizSet(null); }} />;
        }
        if (selectedQuizSet) {
             const availableCounts = [5, 10, 15].filter(count => selectedQuizSet.questions.length >= count);
             return (
                 <div className="animation-pop-in bg-slate-900/80 glowing-border border rounded-2xl shadow-2xl shadow-purple-500/10 p-8 text-center backdrop-blur-sm">
                    <button onClick={() => setSelectedQuizSet(null)} className="text-slate-300 hover:text-white mb-4">
                        &larr; العودة لاختيار الاختبار
                    </button>
                    <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                        {selectedQuizSet.title}
                    </h2>
                     <p className="text-gray-400 mb-8">اختر عدد الأسئلة لبدء الاختبار.</p>
                     <div className="flex justify-center gap-4 flex-wrap">
                         {availableCounts.length > 0 ? availableCounts.map(count => (
                             <button 
                                key={count}
                                onClick={() => handleQuizStart(count)}
                                className="px-8 py-4 font-bold text-white text-xl rounded-lg bg-slate-800 border border-purple-400/30 hover:bg-gradient-to-r hover:from-purple-600 hover:to-fuchsia-600 hover:shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 shadow-lg"
                             >
                                 {count} أسئلة
                             </button>
                         )) : <p className="text-gray-500">لا توجد أسئلة كافية لهذا الموضوع حاليًا.</p>}
                     </div>
                 </div>
             )
        }
        return (
          <div className="animation-pop-in">
            <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
              اختر اختبارًا
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {QUIZ_SETS.map((quizSet) => (
                <div 
                  key={quizSet.id} 
                  className="bg-slate-900/80 border border-purple-400/20 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-[1.03] cursor-pointer hover:border-fuchsia-400 hover:shadow-2xl hover:shadow-fuchsia-500/20 backdrop-blur-sm"
                  onClick={() => setSelectedQuizSet(quizSet)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedQuizSet(quizSet)}
                  aria-label={`بدء اختبار: ${quizSet.title}`}
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-200">
      <ParticleBackground />
      <header className="bg-slate-950/50 backdrop-blur-sm p-5 shadow-lg sticky top-0 z-20 border-b border-purple-400/30">
        <div className="container mx-auto max-w-6xl flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 tracking-wide">
              موسوعة النحو المبسط
            </h1>
          </div>
        </div>
        <div className="container mx-auto max-w-6xl mt-4">
            <div className="relative flex justify-center bg-slate-900/80 rounded-full p-1 shadow-inner border border-purple-400/20">
                 <div
                    className="absolute top-1 bottom-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full transition-all duration-300 ease-out"
                    style={pillStyle}
                  />
                 {(['lessons', 'generator', 'completer', 'quiz'] as View[]).map((view) => (
                    <button ref={buttonRefs[view]} key={view} onClick={() => handleViewChange(view)} className={`relative z-10 w-full text-center px-4 py-2 rounded-full font-bold transition-colors duration-300 focus:outline-none ${activeView === view ? 'text-white' : 'text-slate-300 hover:text-white'}`}>
                        {view === 'lessons' ? 'الدروس' : view === 'generator' ? 'مولّد الأمثلة' : view === 'completer' ? 'أكمل الجملة' : 'اختبر نفسك'}
                    </button>
                ))}
            </div>
        </div>
      </header>

      <main className={`container mx-auto max-w-6xl p-4 md:p-8 ${isAnimatingOut ? 'animation-fade-out' : 'animation-fade-in'}`}>
        {renderContent()}
      </main>

      <footer className="text-center p-6 mt-10">
        <p className="text-slate-400">صنع بحب في مصر ❤️ <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-fuchsia-400">بيتر جرجس</span></p>
      </footer>
      
    </div>
  );
};

export default App;