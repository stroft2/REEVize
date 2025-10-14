import React from 'react';
import type { GrammarTopic } from '../types';

const GrammarSection: React.FC<{ topic: GrammarTopic }> = ({ topic }) => {
  return (
    <div className="bg-gray-900/80 shadow-2xl rounded-2xl p-6 md:p-8 mb-10 transition-all duration-300 border-2 border-gray-700/50 animation-pop-in">
      <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 mb-4 pb-2 border-b-2 border-gray-700">
        {topic.title}
      </h2>
      <div className="text-lg text-gray-300 leading-relaxed mb-6 space-y-4">
        {topic.description.map((paragraph, index) => (
          <p key={index} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-violet-400">$1</strong>') }} />
        ))}
      </div>
      
      {topic.examples.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold text-white mb-4">أمثلة توضيحية:</h3>
          <ul className="space-y-5">
            {topic.examples.map((example, index) => (
              <li 
                key={index} 
                className="border-l-4 border-violet-500 bg-gray-900/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-800/80 hover:shadow-lg hover:scale-[1.02] animation-slide-in-staggered"
                style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
              >
                <p className="font-semibold text-xl text-gray-100 mb-2">
                  {`" ${example.sentence} "`}
                </p>
                <p className="text-md text-gray-400">
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">الشرح:</span> {example.explanation}
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