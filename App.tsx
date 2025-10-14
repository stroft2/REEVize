import React, { useState, useEffect } from 'react';
import GrammarSection from './components/GrammarSection';
import ExampleGenerator from './components/ExampleGenerator';
import Quiz from './components/Quiz';
import { GRAMMAR_TOPICS } from './constants';

type View = 'lessons' | 'generator' | 'quiz';

const App: React.FC = () => {
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const [activeView, setActiveView] = useState<View>('lessons');
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Force dark mode permanently
    document.documentElement.classList.add('dark');
  }, []);

  const handleViewChange = (newView: View) => {
    if (newView === activeView || isAnimatingOut) return;
    setIsAnimatingOut(true);
    setTimeout(() => {
      setActiveView(newView);
      setIsAnimatingOut(false);
    }, 300);
  };

  const selectedTopic = GRAMMAR_TOPICS[selectedTopicIndex];

  const renderContent = () => {
    switch (activeView) {
      case 'lessons':
        return (
          <>
            <nav className="container mx-auto max-w-5xl p-4 md:px-8">
              <div className="flex flex-wrap justify-center gap-3">
                {GRAMMAR_TOPICS.map((topic, index) => (
                  <button key={index} onClick={() => setSelectedTopicIndex(index)} className={`px-5 py-2 font-semibold rounded-full text-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-black shadow-md border-2 ${ selectedTopicIndex === index ? 'bg-violet-600 text-white border-violet-500' : 'bg-gray-800 text-slate-300 border-gray-600 hover:bg-gray-700'}`} aria-current={selectedTopicIndex === index ? 'page' : undefined}>
                    {topic.title}
                  </button>
                ))}
              </div>
            </nav>
            {selectedTopic && <GrammarSection key={selectedTopicIndex} topic={selectedTopic} />}
          </>
        );
      case 'generator':
        return <ExampleGenerator />;
      case 'quiz':
        return <Quiz />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <header className="bg-black/70 backdrop-blur-lg p-5 shadow-lg sticky top-0 z-20 transition-colors duration-300 border-b border-gray-800">
        <div className="container mx-auto max-w-5xl flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">موسوعة النحو المبسّط</h1>
          </div>
        </div>
        <div className="container mx-auto max-w-5xl mt-4">
            <div className="flex justify-center bg-slate-800 rounded-full p-1 shadow-inner">
                 {(['lessons', 'generator', 'quiz'] as View[]).map((view) => (
                    <button key={view} onClick={() => handleViewChange(view)} className={`w-full text-center px-4 py-2 rounded-full font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-400 focus:ring-offset-slate-800 ${activeView === view && !isAnimatingOut ? 'bg-violet-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/50'}`}>
                        {view === 'lessons' ? 'الدروس' : view === 'generator' ? 'مولّد الأمثلة' : 'اختبر نفسك'}
                    </button>
                ))}
            </div>
        </div>
      </header>

      <main className={`container mx-auto max-w-5xl p-4 md:p-8 ${isAnimatingOut ? 'animation-fade-out' : 'animation-fade-in'}`}>
        {renderContent()}
      </main>

      <footer className="text-center p-6 mt-10">
        <p className="text-slate-400">صنع بحب في مصر ❤️ <span className="font-signature text-lg">بيتر جرجس</span></p>
      </footer>
    </div>
  );
};

export default App;