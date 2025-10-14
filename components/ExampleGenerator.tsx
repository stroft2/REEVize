import React, { useState, useMemo } from 'react';
import { SIMPLE_EXAMPLES } from '../constants';

const ExampleGenerator: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const generateNewExample = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * SIMPLE_EXAMPLES.length);
      } while (newIndex === currentIndex && SIMPLE_EXAMPLES.length > 1);
      setCurrentIndex(newIndex);
      // Allow animation class to be re-triggered
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  };

  const currentExample = useMemo(() => SIMPLE_EXAMPLES[currentIndex], [currentIndex]);

  return (
    <div className="bg-gray-900/80 shadow-2xl rounded-2xl p-6 md:p-8 transition-all duration-300 border-2 border-gray-700/50 animation-pop-in">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 mb-4">
        مولّد الأمثلة السريعة
      </h2>
      <p className="text-lg text-gray-300 mb-6">
        اضغط على الزر للحصول على مثال نحوي عشوائي مع شرح مبسط ومباشر.
      </p>

      <div className="bg-gray-900/50 rounded-lg p-6 min-h-[150px] flex flex-col justify-center items-center transition-opacity duration-300 mb-6 border border-gray-700">
        <div className={`w-full text-center ${isAnimating ? 'opacity-0' : 'opacity-100 animation-fade-in'}`}>
            <p className="font-semibold text-2xl text-gray-100 mb-2">
            {`" ${currentExample.sentence} "`}
            </p>
            <p className="text-md text-gray-400">
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">توضيح:</span> {currentExample.explanation}
            </p>
        </div>
      </div>

      <button
        onClick={generateNewExample}
        disabled={isAnimating}
        className="w-full px-8 py-4 font-bold text-white text-xl rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-violet-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnimating ? '...' : 'ولّد مثالاً جديداً'}
      </button>
    </div>
  );
};

export default ExampleGenerator;