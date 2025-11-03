import React, { useMemo } from 'react';
import type { UserProgress, GrammarTopic } from '../types';
import type { Translations } from '../App';
import { ACHIEVEMENTS } from '../constants';

interface ProfileProps {
    progress: UserProgress, 
    topics: GrammarTopic[], 
    T: Translations
}

const Profile: React.FC<ProfileProps> = ({ progress, topics, T }) => {
    const totalLevels = useMemo(() => topics.reduce((sum, topic) => sum + topic.levels.length, 0), [topics]);
    const completedLevelsCount = useMemo(() => Object.values(progress.completedLevels).reduce((sum: number, count: number) => sum + count, 0), [progress.completedLevels]);
    const completionPercentage = totalLevels > 0 ? (completedLevelsCount / totalLevels) * 100 : 0;
    
    const unlockedAchievements = useMemo(() => ACHIEVEMENTS.map(ach => {
        const itemTranslations: { [id: string]: { name: string, description: string } } = {
            'ach_first_level': { name: T.ach_first_level_name, description: T.ach_first_level_desc },
            'ach_first_topic': { name: T.ach_first_topic_name, description: T.ach_first_topic_desc },
            'ach_perfect_quiz': { name: T.ach_perfect_quiz_name, description: T.ach_perfect_quiz_desc },
            'ach_first_purchase': { name: T.ach_first_purchase_name, description: T.ach_first_purchase_desc },
            'ach_xp_1000': { name: T.ach_xp_1000_name, description: T.ach_xp_1000_desc },
            'ach_polyglot': { name: T.ach_polyglot_name, description: T.ach_polyglot_desc },
            'ach_streak_3': { name: T.ach_streak_3_name, description: T.ach_streak_3_desc },
            'ach_night_owl': { name: T.ach_night_owl_name, description: T.ach_night_owl_desc },
            'ach_early_bird': { name: T.ach_early_bird_name, description: T.ach_early_bird_desc },
            'ach_shopaholic': { name: T.ach_shopaholic_name, description: T.ach_shopaholic_desc },
            'ach_theme_collector': { name: T.ach_theme_collector_name, description: T.ach_theme_collector_desc },
            'ach_master_ar': { name: T.ach_master_ar_name, description: T.ach_master_ar_desc },
            'ach_master_fr': { name: T.ach_master_fr_name, description: T.ach_master_fr_desc },
            'ach_master_en': { name: T.ach_master_en_name, description: T.ach_master_en_desc },
        };
        const isUnlocked = progress.achievements.includes(ach.id);
        const translated = itemTranslations[ach.id];
        return {
            ...ach,
            name: translated?.name || ach.name,
            description: translated?.description || ach.description,
            isUnlocked,
        }
    }).sort((a,b) => (b.isUnlocked ? 1 : 0) - (a.isUnlocked ? 1 : 0)), [progress.achievements, T]);

    return (
        <div className="animation-view-in space-y-8">
            <div className="text-center">
                <h2 className="text-4xl font-bold text-gradient-brand">
                    {T.profile}
                </h2>
                <p className="text-lg text-slate-400 mt-2">{T.profileDescription}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Progress Card */}
                <div className="stat-card animation-slide-in-staggered" style={{ animationDelay: '0ms' }}>
                    <h3 className="text-2xl font-bold text-white mb-4">{T.profileStats}</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-lg">
                            <span className="font-bold">✨ {T.profileXP}</span>
                            <span className="font-bold text-2xl text-yellow-300">{progress.xp}</span>
                        </div>
                         <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-lg">
                            <span className="font-bold">📚 {T.profileLevels}</span>
                            <span className="font-bold text-xl text-brand-light">{completedLevelsCount} / {totalLevels}</span>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1 text-sm text-slate-300">
                                <span>{T.profileTotalProgress}</span>
                                <span>{completionPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fg" style={{ width: `${completionPercentage}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievements Card */}
                <div className="stat-card animation-slide-in-staggered" style={{ animationDelay: '100ms' }}>
                    <h3 className="text-2xl font-bold text-white mb-4">{T.profileAchievements} ({unlockedAchievements.filter(a => a.isUnlocked).length} / {ACHIEVEMENTS.length})</h3>
                    {unlockedAchievements.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {unlockedAchievements.map((ach, index) => (
                                <div 
                                    key={ach.id} 
                                    className={`flex items-center gap-4 bg-slate-800/60 p-3 rounded-lg transition-opacity animation-slide-in-staggered ${!ach.isUnlocked ? 'opacity-40' : 'border border-yellow-500/30'}`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className={`w-10 h-10 shrink-0 ${ach.isUnlocked ? 'text-yellow-400' : 'text-slate-500'}`} dangerouslySetInnerHTML={{ __html: ach.icon }} />
                                    <div>
                                        <p className="font-bold text-white">{ach.name}</p>
                                        <p className="text-sm text-slate-400">{ach.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-8">{T.profileNoAchievements}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;