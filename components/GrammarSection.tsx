import React, { useState } from 'react';
import type { GrammarTopic } from '../types';

const GrammarSection: React.FC<{ topic: GrammarTopic }> = ({ topic }) => {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  return (
    <div className="bg-slate-900/80 border rounded-2xl shadow-2xl shadow-purple-500/10 animation-pop-in p-6 md:p-8 glowing-border backdrop-blur-sm">
      <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 mb-4 pb-2 border-b-2 border-purple-400/20">
        {topic.title}
      </h2>
      <div className="text-lg text-gray-300 leading-relaxed mb-6 space-y-4">
        {topic.description.map((paragraph, index) => (
          <div key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
        ))}
      </div>

      {topic.summary && topic.summary.length > 0 && (
        <div className="mb-8 border border-purple-400/20 rounded-xl bg-slate-800/50 overflow-hidden">
          <button
            onClick={() => setIsSummaryOpen(!isSummaryOpen)}
            className="w-full flex justify-between items-center p-4 text-lg font-bold text-white focus:outline-none"
            aria-expanded={isSummaryOpen}
          >
            <span>ملخص سريع للمراجعة ⚡️</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 transition-transform duration-300 ${isSummaryOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isSummaryOpen && (
            <div className="p-4 border-t border-purple-400/20 animation-fade-in">
              <ul className="space-y-2 list-disc pr-5 text-gray-300">
                {topic.summary.map((point, index) => (
                   <li key={index} dangerouslySetInnerHTML={{ __html: point }} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {topic.examples.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold text-white mb-4">أمثلة توضيحية:</h3>
          <ul className="space-y-5">
            {topic.examples.map((example, index) => (
              <li 
                key={index} 
                className="border-l-4 border-fuchsia-500 bg-slate-800/50 p-4 rounded-lg transition-all duration-300 hover:bg-slate-800/80 hover:shadow-[0_0_25px_rgba(217,70,239,0.4)] hover:border-fuchsia-400 hover:scale-[1.02] animation-slide-in-staggered"
                style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
              >
                <p className="font-semibold text-xl text-gray-100 mb-2">
                  {`" ${example.sentence} "`}
                </p>
                <p className="text-md text-gray-400">
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-fuchsia-400">الشرح:</span> {example.explanation}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GrammarSection;
