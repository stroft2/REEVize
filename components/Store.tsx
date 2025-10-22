import React, { useState, useMemo } from 'react';
import type { UserProgress, StoreItem } from '../types';
import type { Translations } from '../App';
import { STORE_ITEMS } from '../constants';

interface StoreProps {
    progress: UserProgress, 
    onPurchase: (item: StoreItem) => void,
    onActivateTheme: (themeId: string) => void,
    onPreviewTheme: (themeId: string, isPreview: boolean) => void,
    T: Translations;
}

const Store: React.FC<StoreProps> = ({ progress, onPurchase, onActivateTheme, onPreviewTheme, T }) => {
    const [activeTab, setActiveTab] = useState<'badges' | 'themes'>('badges');
    
    const storeSections = useMemo(() => {
        const itemTranslations: { [id: string]: { name: string, description: string } } = {
            'badge_bronze': { name: T.badge_bronze_name, description: T.badge_bronze_desc },
            'badge_silver': { name: T.badge_silver_name, description: T.badge_silver_desc },
            'badge_gold': { name: T.badge_gold_name, description: T.badge_gold_desc },
            'badge_expert': { name: T.badge_expert_name, description: T.badge_expert_desc },
            'badge_book': { name: T.badge_book_name, description: T.badge_book_desc },
            'badge_star': { name: T.badge_star_name, description: T.badge_star_desc },
            'theme_ocean': { name: T.theme_ocean_name, description: T.theme_ocean_desc },
            'theme_sunset': { name: T.theme_sunset_name, description: T.theme_sunset_desc },
            'theme_forest': { name: T.theme_forest_name, description: T.theme_forest_desc },
        };

        const translatedItems = STORE_ITEMS.map(item => ({
            ...item,
            name: itemTranslations[item.id]?.name || item.name,
            description: itemTranslations[item.id]?.description || item.description,
        }));

        return {
            badges: translatedItems.filter(i => i.type === 'badge'),
            themes: translatedItems.filter(i => i.type === 'theme'),
        };
    }, [T]);

    const tabNames = {
        badges: T.storeBadges,
        themes: T.storeThemes,
    };

    return (
    <div className="animation-pop-in">
        <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gradient-brand">
                {T.storeTitle}
            </h2>
            <p className="text-lg text-slate-300 mt-2">{T.storeDescription}</p>
        </div>
        
        <div className="flex justify-center mb-8 border-b-2 border-slate-700/50">
            {(Object.keys(storeSections) as Array<keyof typeof storeSections>).map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-bold text-lg transition-colors ${activeTab === tab ? 'text-brand-light border-b-2 border-brand-light' : 'text-slate-400 hover:text-white'}`}>
                    {tabNames[tab]}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storeSections[activeTab].map(item => {
                const isPurchased = progress.purchasedItems.includes(item.id);
                const canAfford = progress.xp >= item.cost;
                const isActiveTheme = item.type === 'theme' && progress.activeThemeId === item.id;

                return (
                    <div key={item.id} className={`shine-effect relative bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6 flex flex-col text-center items-center transition-all duration-300 ${isPurchased && !isActiveTheme ? 'opacity-70' : ''}`}>
                        <div className="w-20 h-20 mb-4 text-brand-light" dangerouslySetInnerHTML={{ __html: item.icon }} />
                        <h4 className="text-xl font-bold text-white mb-2">{item.name}</h4>
                        <p className="text-slate-400 text-sm mb-4 flex-grow">{item.description}</p>
                        
                        {item.type === 'theme' && (
                          <div className="flex justify-center items-center gap-2 mb-4">
                            {Object.values(item.payload?.colors?.dark || {}).slice(0, 3).map((value, index) => (
                                <div key={index} className="w-6 h-6 rounded-full border-2 border-slate-500" style={{ backgroundColor: value }}></div>
                            ))}
                            <button
                                onMouseEnter={() => onPreviewTheme(item.id, true)}
                                onMouseLeave={() => onPreviewTheme(progress.activeThemeId, false)}
                                className="px-3 py-1 text-xs font-bold text-brand-light bg-brand/20 rounded-full hover:bg-brand/40"
                            >
                                {T.storePreview}
                            </button>
                          </div>
                        )}
                        
                        {isPurchased && item.type === 'theme' ? (
                             <button
                                onClick={() => onActivateTheme(item.id)}
                                disabled={isActiveTheme}
                                className="w-full btn interactive-press
                                ${isActiveTheme ? 'bg-green-500/80 text-white' : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white'}
                                "
                            >
                                {isActiveTheme ? T.storeThemeActive : T.storeThemeActivate}
                            </button>
                        ) : (
                            <button
                                onClick={() => onPurchase(item)}
                                disabled={isPurchased || !canAfford}
                                className="w-full btn interactive-press
                                ${isPurchased ? 'bg-green-500/80 text-white' : ''}
                                ${!isPurchased && canAfford ? 'btn-primary' : ''}
                                ${!isPurchased && !canAfford ? 'bg-slate-700 text-slate-400' : ''}
                                "
                            >
                                {isPurchased ? T.storePurchased : `${T.storePurchase} (${item.cost} XP)`}
                            </button>
                        )}
                    </div>
                )
            })}
        </div>
    </div>
    );
}

export default Store;