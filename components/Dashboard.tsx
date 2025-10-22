import React from 'react';
import type { GrammarTopic, UserProgress } from '../types';
import type { Translations } from '../App';

interface DashboardProps {
    onSelectTopic: (topic: GrammarTopic) => void; 
    progress: UserProgress; 
    topics: GrammarTopic[];
    T: Translations;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectTopic, progress, topics, T }) => (
    <div className="animation-pop-in">
        <h2 className="text-4xl font-bold text-center mb-10 text-gradient-brand">
            {T.dashboardTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topics.map((topic, index) => {
                const completed = progress.completedLevels[topic.id] || 0;
                const total = topic.levels.length;
                const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

                return (
                    <div
                        key={topic.id}
                        className="topic-card animation-slide-in-staggered shine-effect"
                        onClick={() => onSelectTopic(topic)}
                        style={{'animationDelay': `${index * 70}ms`} as React.CSSProperties}
                    >
                        <div className="p-6 h-full flex flex-col">
                            <div className="flex items-center mb-4">
                               <div className={`w-12 h-12 shrink-0 ${T.lang === 'ar' ? 'ml-4' : 'mr-4'}`} dangerouslySetInnerHTML={{ __html: topic.icon }} style={{color: 'var(--c-brand-light)'}} />
                               <h3 className="text-2xl font-bold text-white">{topic.title}</h3>
                            </div>
                            <p className="text-gray-400 flex-grow mb-6">{topic.description}</p>
                            <div>
                                <div className="flex justify-between items-center mb-1 text-sm text-slate-300">
                                    <span>{T.dashboardProgress}</span>
                                    <span>{completed}/{total} {T.dashboardLevels}</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fg" style={{ width: `${progressPercentage}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
);

export default Dashboard;