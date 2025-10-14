import React, { useState, useMemo } from 'react';
import { SIMPLE_EXAMPLES, GRAMMAR_TOPICS } from '../constants';
import { SimpleExample } from '../types';

const ExampleGenerator: React.FC = () => {
  const [filter, setFilter] = useState('الكل');

  const filteredExamples = useMemo(() => {
    if (filter === 'الكل') {
      return SIMPLE_EXAMPLES;
    }
    return SIMPLE_EXAMPLES.filter(ex => ex.topicTitle === filter);
  }, [filter]);

  const [currentExample, setCurrentExample] = useState<SimpleExample>(() => filteredExamples[Math.floor(Math.random() * filteredExamples.length)]);
  const [isAnimating, setIsAnimating] = useState(false);

  const generateNewExample = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      let newExample;
      do {
        newExample = filteredExamples[Math.floor(Math.random() * filteredExamples.length)];
      } while (newExample?.sentence === currentExample.sentence && filteredExamples.length > 1);
      setCurrentExample(newExample);
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  };
  
  const topicOptions = ['الكل', ...GRAMMAR_TOPICS.map(topic => topic.title)];

  return (
    <div className="bg-slate-900/80 glowing-border border rounded-2xl shadow-2xl shadow-purple-500/10 animation-pop-in p-6 md:p-8 backdrop-blur-sm">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 mb-2">
        مولّد الأمثلة السريعة
      </h2>
      <p className="text-lg text-gray-300 mb-6">
        اختر درسًا محددًا أو "الكل"، ثم اضغط على الزر للحصول على مثال نحوي عشوائي مع شرحه.
      </p>

      <div className="mb-6">
        <label htmlFor="topic-filter" className="block mb-2 text-sm font-medium text-gray-400">فلترة حسب الدرس:</label>
        <select 
          id="topic-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-slate-800 border border-purple-400/30 text-white text-md rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5"
        >
            {topicOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 min-h-[150px] flex flex-col justify-center items-center transition-opacity duration-300 mb-6 border border-purple-400/20">
        <div className={`w-full text-center ${isAnimating ? 'opacity-0' : 'opacity-100 animation-fade-in'}`}>
            <p className="font-semibold text-2xl text-gray-100 mb-2">
            {`" ${currentExample.sentence} "`}
            </p>
            <p className="text-md text-gray-400">
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-fuchsia-400">توضيح:</span> {currentExample.explanation}
            </p>
        </div>
      </div>

      <button
        onClick={generateNewExample}
        disabled={isAnimating}
        className="w-full px-8 py-4 font-bold text-white text-xl rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnimating ? '...' : 'ولّد مثالاً جديداً'}
      </button>
    </div>
  );
};

export default ExampleGenerator;