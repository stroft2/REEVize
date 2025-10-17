import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import GrammarSection from './components/GrammarSection';
import ExampleGenerator from './components/ExampleGenerator';
import Quiz from './components/Quiz';
import ParticleBackground from './components/ParticleBackground';
import CompleteSentence from './components/CompleteSentence';
import Settings from './components/Settings'; // Import the new Settings component
import { GRAMMAR_TOPICS, QUIZ_SETS, STORE_ITEMS, ACHIEVEMENTS } from './constants';
import type { QuizSet, QuizQuestion, GrammarTopic, UserProgress, StoreItem, Achievement } from './types';

type View = 'dashboard' | 'lesson' | 'generator' | 'completer' | 'quiz' | 'store' | 'settings' | 'profile';
type Sound = 'correct' | 'incorrect' | 'level-up' | 'purchase' | 'achievement';

const ICONS: Record<Exclude<View, 'lesson'>, React.ReactNode> = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    generator: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>,
    completer: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M15.5,5.5h-0.959c-0.23,0-0.45,0.082-0.627,0.24L10.5,9.586L8.087,7.172C7.91,7.016,7.69,6.934,7.459,6.934H6.5c-0.414,0-0.75,0.336-0.75,0.75v0.922c0,0.229,0.084,0.449,0.244,0.625l3.5,3.594c0.195,0.199,0.451,0.293,0.707,0.293s0.512-0.094,0.707-0.293l4.5-4.594C15.916,10.375,16,10.156,16,9.926V9c0-0.414-0.336-0.75-0.75-0.75h-0.922c-0.229,0-0.449-0.084-0.625-0.244L10.5,4.414l2.413,2.413C12.984,6.899,13.204,6.98,13.434,6.98H14.5c0.414,0,0.75-0.336,0.75-0.75V5.5C15.25,5.086,14.914,4.75,14.5,4.75z M4,4h8c0.552,0,1,0.448,1,1s-0.448,1-1,1H4C3.448,6,3,5.552,3,5S3.448,4,4,4z M13,15h-1v-2c0-0.552-0.448-1-1-1H5c-0.552,0-1,0.448-1,1v2H3c-0.552,0-1,0.448-1,1s0.448,1,1,1h10c0.552,0,1-0.448,1-1S13.552,15,13,15z" clipRule="evenodd"/></svg>,
    quiz: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3,2.268a2,2,0,0,0-2.6,0l-6,5.25A2,2,0,0,0,2,9.25v6.5a2,2,0,0,0,2,2h12a2,2,0,0,0,2-2v-6.5a2,2,0,0,0-0.7-1.732l-6-5.25ZM10,4.5l6,5.25v6.5H4v-6.5L10,4.5ZM9,11v4h2v-4H9Zm0-3h2v2H9V8Z" clipRule="evenodd" /></svg>,
    store: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l.237-.237.954-3.818.008-.032.01-.041L9.4 3H15a1 1 0 000-2H3zM6 16a2 2 0 100 4 2 2 0 000-4zm9-2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    profile: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
};

const NavButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    children: React.ReactNode;
}> = ({ isActive, onClick, children, icon }) => (
    <button
        onClick={onClick}
        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-fuchsia-500 ${isActive ? 'bg-purple-500/30 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
    >
        {icon}
        {children}
    </button>
);

type Notification = { id: number; message: string; icon: string; };

const Toast: React.FC<{ notification: Notification; onDismiss: () => void }> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-5 right-5 bg-slate-800 border border-purple-500/50 rounded-xl shadow-2xl shadow-purple-500/20 p-4 flex items-center gap-4 z-50 animation-fade-in-up">
      <div className="w-10 h-10 text-purple-400" dangerouslySetInnerHTML={{ __html: notification.icon }} />
      <div>
        <p className="font-bold text-white">تهانينا!</p>
        <p className="text-slate-300">{notification.message}</p>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  
  // Gamification State
  const [progress, setProgress] = useState<UserProgress>({
     xp: 0, 
     purchasedItems: [], 
     completedLevels: {}, 
     activeThemeId: 'default', 
     achievements: [], 
     lastLoginDate: '' 
    });
  const [xpGain, setXpGain] = useState<{ amount: number; base: number; multiplier: number; key: number } | null>(null);

  // Timers State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  
  const timerIntervalRef = useRef<number | null>(null);
  const stopwatchIntervalRef = useRef<number | null>(null);

  const playSound = (sound: Sound) => {
    try {
        const soundMap = {
            'correct': 'correct-sound',
            'incorrect': 'incorrect-sound',
            'level-up': 'level-up-sound',
            'purchase': 'purchase-sound',
            'achievement': 'level-up-sound', // Reuse for achievements
        };
        const audio = document.getElementById(soundMap[sound]) as HTMLAudioElement;
        audio.currentTime = 0;
        audio.play().catch(e => console.error("Sound play failed:", e));
    } catch (e) {
        console.error("Could not play sound:", e);
    }
  };

  const showNotification = useCallback((message: string, icon: string) => {
    const newNotif = { id: Date.now(), message, icon };
    setNotifications(prev => [...prev, newNotif]);
  }, []);

  const dismissNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const applyTheme = useCallback((themeId: string, isPreview = false) => {
    const root = document.documentElement;
    const themeItem = STORE_ITEMS.find(item => item.id === themeId && item.type === 'theme');
    const themeColors = themeItem?.payload?.colors?.[theme];

    const colorProps = ['--c-brand', '--c-brand-light', '--c-accent', '--c-bg', '--c-bg-surface', '--c-bg-muted', '--c-border', '--c-text-primary', '--c-text-secondary'];
    
    if (themeColors) {
        for (const prop of colorProps) {
            const key = prop as keyof typeof themeColors;
            if (themeColors[key]) {
                root.style.setProperty(prop, themeColors[key]);
            } else {
                root.style.removeProperty(prop);
            }
        }
    } else { // Reverting to default theme
        for (const prop of colorProps) {
            root.style.removeProperty(prop);
        }
    }
  }, [theme]);

  // Handle Light/Dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme') as 'light' | 'dark' | null;
    if (savedTheme) {
        setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('light-theme', theme === 'light');
    document.documentElement.classList.toggle('light-theme', theme === 'light');
    localStorage.setItem('appTheme', theme);
    applyTheme(progress.activeThemeId);
  }, [theme, progress.activeThemeId, applyTheme]);
  
  // Theme application on progress change
  useEffect(() => {
    applyTheme(progress.activeThemeId);
  }, [progress.activeThemeId, applyTheme]);
  
  const checkAndAwardAchievements = useCallback((payload?: any) => {
    setProgress(prev => {
        let newProgress = { ...prev };
        let awardedXp = 0;
        let newAchievements = false;

        for (const achievement of ACHIEVEMENTS) {
            if (!newProgress.achievements.includes(achievement.id) && achievement.condition(newProgress, payload)) {
                newProgress.achievements = [...newProgress.achievements, achievement.id];
                awardedXp += achievement.xpReward;
                showNotification(`أحرزت إنجاز "${achievement.name}"! +${achievement.xpReward} XP`, achievement.icon);
                playSound('achievement');
                newAchievements = true;
            }
        }
        if (newAchievements) {
           return { ...newProgress, xp: newProgress.xp + awardedXp };
        }
        return prev;
    });
  }, [showNotification]);


  // Load progress from localStorage on mount & check daily bonus
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem('nahwProgress');
      const today = new Date().toISOString().split('T')[0];
      let currentProgress: UserProgress = savedProgress 
        ? JSON.parse(savedProgress) 
        : { xp: 0, purchasedItems: [], completedLevels: {}, activeThemeId: 'default', achievements: [], lastLoginDate: '' };

      if (currentProgress.lastLoginDate !== today) {
        currentProgress.xp += 15;
        currentProgress.lastLoginDate = today;
        showNotification("مكافأة الدخول اليومي! +15 XP", "🎁");
      }
      setProgress(currentProgress);
    } catch (error) {
      console.error("Failed to load progress:", error);
    }
  }, [showNotification]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('nahwProgress', JSON.stringify(progress));
      checkAndAwardAchievements(); // Check for XP-based achievements
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  }, [progress, checkAndAwardAchievements]);
  
  const xpMultiplier = useMemo(() => {
    const mainBadges = progress.purchasedItems
        .map(id => STORE_ITEMS.find(item => item.id === id && item.type === 'badge' && item.payload?.multiplier && item.payload.multiplier > 1))
        .filter(Boolean) as StoreItem[];
    
    const additiveBadges = progress.purchasedItems
        .map(id => STORE_ITEMS.find(item => item.id === id && item.type === 'badge' && item.payload?.multiplier && item.payload.multiplier < 1))
        .filter(Boolean) as StoreItem[];

    let highestMultiplier = 1;
    if (mainBadges.length > 0) {
        highestMultiplier = Math.max(...mainBadges.map(b => b.payload!.multiplier!));
    }

    const additiveBonus = additiveBadges.reduce((sum, b) => sum + b.payload!.multiplier!, 0);

    return highestMultiplier + additiveBonus;
  }, [progress.purchasedItems]);

  const addXP = useCallback((amount: number) => {
    const finalAmount = Math.round(amount * xpMultiplier);
    setProgress(prev => ({ ...prev, xp: prev.xp + finalAmount }));
    setXpGain({
        amount: finalAmount,
        base: amount,
        multiplier: xpMultiplier,
        key: Date.now()
    });
    if (xpMultiplier > 1 && amount > 0) {
        showNotification(`+${finalAmount} XP (${amount} × ${xpMultiplier.toFixed(2)})`, '✨');
    }
  }, [xpMultiplier, showNotification]);
  
  const grantDebugXP = useCallback((amount: number) => {
    setProgress(prev => ({...prev, xp: prev.xp + amount}));
    showNotification(`تمت إضافة ${amount} XP بنجاح!`, "🤫");
  }, [showNotification]);

  const handleCompleteLevel = useCallback((topicId: string, levelId: number) => {
      setProgress(prev => {
          const topic = GRAMMAR_TOPICS.find(t => t.id === topicId);
          if (!topic) return prev;
          const level = topic.levels.find(l => l.id === levelId);
          if (!level) return prev;

          const currentCompleted = prev.completedLevels[topicId] || 0;
          if (currentCompleted < levelId) {
             playSound('level-up');
             const finalXp = Math.round(level.xpReward * xpMultiplier);
             const newCompleted = { ...prev.completedLevels, [topicId]: levelId };
             
             setXpGain({
                 amount: finalXp,
                 base: level.xpReward,
                 multiplier: xpMultiplier,
                 key: Date.now()
             });
             if (xpMultiplier > 1) {
                showNotification(`+${finalXp} XP (${level.xpReward} × ${xpMultiplier.toFixed(2)})`, '✨');
             }
             setTimeout(() => checkAndAwardAchievements(), 0);

             return { ...prev, xp: prev.xp + finalXp, completedLevels: newCompleted };
          }
          return prev; 
      });
  }, [xpMultiplier, showNotification, checkAndAwardAchievements]);
  
  const handlePurchaseItem = useCallback((item: StoreItem) => {
    setProgress(prev => {
        if (prev.xp >= item.cost && !prev.purchasedItems.includes(item.id)) {
            playSound('purchase');
            const updatedProgress = {
                ...prev,
                xp: prev.xp - item.cost,
                purchasedItems: [...prev.purchasedItems, item.id],
            };
            setTimeout(() => checkAndAwardAchievements(), 0);
            return updatedProgress;
        }
        return prev;
    });
  }, [checkAndAwardAchievements]);
  
  const handleActivateTheme = useCallback((themeId: string) => {
      setProgress(prev => ({ ...prev, activeThemeId: themeId }));
  }, []);

  const handleResetTheme = useCallback(() => {
    setProgress(prev => ({ ...prev, activeThemeId: 'default' }));
    showNotification("تمت إعادة تعيين الثيم إلى الوضع الافتراضي.", "🎨");
  }, [showNotification]);

  const handleQuizComplete = useCallback((result: { score: number, total: number }) => {
    const earnedXp = Math.round((result.score / result.total) * 50); // Max 50 XP
    addXP(earnedXp);
    checkAndAwardAchievements(result);
  }, [addXP, checkAndAwardAchievements]);
  
    // Timer Logic
    useEffect(() => {
        if (isTimerRunning) {
            timerIntervalRef.current = window.setInterval(() => {
                setTimerSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(timerIntervalRef.current!);
                        setIsTimerRunning(false);
                        const alarmSound = document.getElementById('alarm-sound') as HTMLAudioElement;
                        if (alarmSound) {
                           alarmSound.play().catch(e => console.error("Audio play failed:", e));
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [isTimerRunning]);

    // Stopwatch Logic
    useEffect(() => {
        if (isStopwatchRunning) {
            stopwatchIntervalRef.current = window.setInterval(() => {
                setStopwatchSeconds(prev => prev + 1);
            }, 1000);
        } else if (stopwatchIntervalRef.current) {
            clearInterval(stopwatchIntervalRef.current);
        }
        return () => {
            if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
        };
    }, [isStopwatchRunning]);

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };
    
    const formatStopwatchTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

  // Quiz State
  const [selectedQuizSet, setSelectedQuizSet] = useState<QuizSet | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);

  const handleViewChange = (newView: View) => {
    if (newView === activeView || isAnimatingOut) return;
    setIsAnimatingOut(true);
    setTimeout(() => {
      setActiveView(newView);
      setSelectedTopic(null); // Reset topic when changing main view
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
  
  const handleSelectTopic = (topic: GrammarTopic) => {
      setIsAnimatingOut(true);
      setTimeout(() => {
          setSelectedTopic(topic);
          setActiveView('lesson');
          setIsAnimatingOut(false);
      }, 300)
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onSelectTopic={handleSelectTopic} progress={progress} />;
      case 'lesson':
        return selectedTopic && (
          <GrammarSection 
            topic={selectedTopic}
            onBack={() => handleViewChange('dashboard')}
            completedLevels={progress.completedLevels[selectedTopic.id] || 0}
            onCompleteLevel={handleCompleteLevel}
          />
        );
      case 'generator':
        return <ExampleGenerator addXP={addXP} />;
      case 'completer':
        return <CompleteSentence addXP={addXP} />;
      case 'quiz':
        return <QuizFlow 
            selectedQuizSet={selectedQuizSet}
            quizQuestions={quizQuestions}
            onSelectQuizSet={setSelectedQuizSet}
            onStartQuiz={handleQuizStart}
            onBack={() => { setQuizQuestions(null); setSelectedQuizSet(null); }}
            onQuizComplete={handleQuizComplete}
            playSound={playSound}
        />;
      case 'store':
        return <Store progress={progress} onPurchase={handlePurchaseItem} onActivateTheme={handleActivateTheme} onPreviewTheme={applyTheme} />;
      case 'profile':
        return <Profile progress={progress} topics={GRAMMAR_TOPICS} />;
      case 'settings':
        return <Settings 
            theme={theme} 
            onSetTheme={setTheme} 
            onGrantDebugXP={grantDebugXP}
            timerSeconds={timerSeconds}
            isTimerRunning={isTimerRunning}
            onSetIsTimerRunning={setIsTimerRunning}
            onSetTimerSeconds={setTimerSeconds}
            formatTime={formatTime}
            stopwatchSeconds={stopwatchSeconds}
            isStopwatchRunning={isStopwatchRunning}
            onSetIsStopwatchRunning={setIsStopwatchRunning}
            onSetStopwatchSeconds={setStopwatchSeconds}
            formatStopwatchTime={formatStopwatchTime}
            onResetTheme={handleResetTheme}
            activeThemeId={progress.activeThemeId}
         />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-200">
      <ParticleBackground />
      {notifications.map(n => 
        <Toast key={n.id} notification={n} onDismiss={() => dismissNotification(n.id)} />
      )}
      <header className="app-header p-4">
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center">
            <div className="w-full flex justify-between items-center">
                <div className="flex items-center space-x-3 space-x-reverse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10.392C2.057 15.71 3.245 16 4.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10.392c1.057.514 2.245.804 3.5.804 1.255 0 2.443-.29 3.5-.804V4.804C16.943 4.29 15.755 4 14.5 4z" />
                    </svg>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 tracking-wide">
                    موسوعة النحو المبسط
                    </h1>
                </div>
                <button 
                    onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                    className="md:hidden p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700/50"
                    aria-label="Toggle navigation"
                >
                    {isHeaderExpanded ? 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> :
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    }
                </button>
            </div>
          
          <div className={`header-nav-mobile md:!max-h-none md:!opacity-100 md:!overflow-visible md:flex md:items-center md:gap-2 ${isHeaderExpanded ? 'expanded' : ''}`}>
            <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 md:mt-0">
                <div className="flex items-center gap-2">
                    {isTimerRunning && timerSeconds > 0 && (
                        <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-2 font-mono text-base font-bold text-yellow-300">
                            <span>⏰</span> {formatTime(timerSeconds)}
                        </div>
                    )}
                    {isStopwatchRunning && (
                        <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-2 font-mono text-base font-bold text-cyan-300">
                            <span>⏱️</span> {formatStopwatchTime(stopwatchSeconds)}
                        </div>
                    )}
                    <div className="relative">
                        <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg px-4 py-2 font-bold text-lg flex items-center gap-2">
                            <span className="text-yellow-400">XP:</span> {progress.xp}
                            {xpMultiplier > 1 && <span className="text-xs bg-fuchsia-500/30 text-fuchsia-300 px-2 py-0.5 rounded-full font-bold">x{xpMultiplier.toFixed(2)}</span>}
                        </div>
                         {xpGain && (
                            <div key={xpGain.key} className="xp-gain-popup text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
                                +{xpGain.amount} XP!
                            </div>
                        )}
                    </div>
                </div>
                <nav className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-1.5 flex flex-wrap justify-center gap-1 mt-2 sm:mt-0">
                    {(['dashboard', 'generator', 'completer', 'quiz', 'store', 'profile', 'settings'] as Exclude<View, 'lesson'>[]).map((view) => (
                        <NavButton key={view} isActive={activeView === view} onClick={() => handleViewChange(view)} icon={ICONS[view]}>
                            {view === 'dashboard' ? 'الرئيسية' : view === 'generator' ? 'مولّد الأمثلة' : view === 'completer' ? 'أكمل الجملة' : view === 'quiz' ? 'الاختبار' : view === 'store' ? 'المتجر' : view === 'profile' ? 'الملف الشخصي' : 'الإعدادات'}
                        </NavButton>
                    ))}
                </nav>
             </div>
          </div>
        </div>
      </header>
      
      <main className={`container mx-auto max-w-6xl p-4 md:p-8 ${isAnimatingOut ? 'animation-fade-out' : 'animation-fade-in'}`}>
        {renderContent()}
      </main>

      <footer className="text-center p-8 mt-12">
        <p className="text-slate-400">صنع بحب في مصر ❤️ <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-fuchsia-400">بيتر جرجس</span></p>
      </footer>
    </div>
  );
};

const Dashboard = React.memo<{onSelectTopic: (topic: GrammarTopic) => void; progress: UserProgress}>(({ onSelectTopic, progress }) => (
    <div className="animation-pop-in">
        <h2 className="text-4xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
            اختر درسًا لتبدأ رحلتك
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {GRAMMAR_TOPICS.map((topic) => {
                const completed = progress.completedLevels[topic.id] || 0;
                const total = topic.levels.length;
                const progressPercentage = (completed / total) * 100;

                return (
                    <div
                        key={topic.id}
                        className="topic-card"
                        onClick={() => onSelectTopic(topic)}
                    >
                        <div className="p-6 h-full flex flex-col">
                            <div className="flex items-center mb-4">
                               <div className="w-12 h-12 ml-4 text-purple-400" dangerouslySetInnerHTML={{ __html: topic.icon }} />
                               <h3 className="text-2xl font-bold text-white">{topic.title}</h3>
                            </div>
                            <p className="text-gray-400 flex-grow mb-6">{topic.description}</p>
                            <div>
                                <div className="flex justify-between items-center mb-1 text-sm text-slate-300">
                                    <span>التقدم</span>
                                    <span>{completed}/{total} مستويات</span>
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
));

const QuizFlow: React.FC<{
    selectedQuizSet: QuizSet | null,
    quizQuestions: QuizQuestion[] | null,
    onSelectQuizSet: (qs: QuizSet) => void,
    onStartQuiz: (count: number) => void,
    onBack: () => void,
    onQuizComplete: (result: { score: number, total: number }) => void,
    playSound: (sound: Sound) => void;
}> = ({ selectedQuizSet, quizQuestions, onSelectQuizSet, onStartQuiz, onBack, onQuizComplete, playSound }) => {
    if (quizQuestions) {
      return <Quiz questions={quizQuestions} onBack={onBack} onQuizComplete={onQuizComplete} playSound={playSound} />;
    }
    if (selectedQuizSet) {
         const availableCounts = [5, 10, 15].filter(count => selectedQuizSet.questions.length >= count);
         return (
             <div className="animation-pop-in bg-slate-900/70 border border-slate-700/50 rounded-2xl shadow-2xl shadow-purple-500/10 p-8 text-center backdrop-blur-sm">
                <button onClick={() => onSelectQuizSet(null)} className="text-slate-300 hover:text-white mb-6 text-lg">
                    &rarr; العودة لاختيار الاختبار
                </button>
                <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                    {selectedQuizSet.title}
                </h2>
                 <p className="text-gray-400 mb-8 text-lg">اختر عدد الأسئلة لبدء الاختبار.</p>
                 <div className="flex justify-center gap-4 flex-wrap">
                     {availableCounts.length > 0 ? availableCounts.map(count => (
                         <button 
                            key={count}
                            onClick={() => onStartQuiz(count)}
                            className="px-8 py-4 font-bold text-white text-xl rounded-lg bg-slate-800 border border-purple-500/30 hover:bg-gradient-to-r hover:from-purple-600 hover:to-fuchsia-600 hover:shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 shadow-lg"
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
        <h2 className="text-4xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
          اختر اختبارًا
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {QUIZ_SETS.map((quizSet) => (
            <div 
              key={quizSet.id} 
              className="bg-slate-900/70 border border-slate-700/50 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-[1.03] cursor-pointer hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20 backdrop-blur-sm"
              onClick={() => onSelectQuizSet(quizSet)}
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
}

const Store: React.FC<{
    progress: UserProgress, 
    onPurchase: (item: StoreItem) => void,
    onActivateTheme: (themeId: string) => void,
    onPreviewTheme: (themeId: string, isPreview: boolean) => void,
}> = ({ progress, onPurchase, onActivateTheme, onPreviewTheme }) => {
    const [activeTab, setActiveTab] = useState<'badges' | 'themes'>('badges');
    
    const storeSections = useMemo(() => ({
        badges: STORE_ITEMS.filter(i => i.type === 'badge'),
        themes: STORE_ITEMS.filter(i => i.type === 'theme'),
    }), []);

    return (
    <div className="animation-pop-in">
        <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                متجر المكافآت
            </h2>
            <p className="text-lg text-slate-300 mt-2">استخدم نقاط الخبرة (XP) لشراء أوسمة وثيمات مميزة!</p>
        </div>
        
        <div className="flex justify-center mb-8 border-b-2 border-slate-700/50">
            {(Object.keys(storeSections) as Array<keyof typeof storeSections>).map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-bold text-lg transition-colors ${activeTab === tab ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-400 hover:text-white'}`}>
                    {tab === 'badges' ? 'الأوسمة' : 'الثيمات'}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storeSections[activeTab].map(item => {
                const isPurchased = progress.purchasedItems.includes(item.id);
                const canAfford = progress.xp >= item.cost;
                const isActiveTheme = item.type === 'theme' && progress.activeThemeId === item.id;

                return (
                    <div key={item.id} className={`bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6 flex flex-col text-center items-center transition-opacity ${isPurchased && !isActiveTheme ? 'opacity-70' : ''}`}>
                        <div className="w-20 h-20 mb-4 text-purple-400" dangerouslySetInnerHTML={{ __html: item.icon }} />
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
                                className="px-3 py-1 text-xs font-bold text-purple-300 bg-purple-500/20 rounded-full hover:bg-purple-500/40"
                            >
                                استعراض
                            </button>
                          </div>
                        )}
                        
                        {isPurchased && item.type === 'theme' ? (
                             <button
                                onClick={() => onActivateTheme(item.id)}
                                disabled={isActiveTheme}
                                className="w-full px-4 py-2 font-bold rounded-lg transition-all duration-300 disabled:cursor-not-allowed
                                ${isActiveTheme ? 'bg-green-500/80 text-white' : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white'}
                                "
                            >
                                {isActiveTheme ? 'الثيم النشط' : 'تفعيل الثيم'}
                            </button>
                        ) : (
                            <button
                                onClick={() => onPurchase(item)}
                                disabled={isPurchased || !canAfford}
                                className="w-full px-4 py-2 font-bold rounded-lg transition-all duration-300 disabled:cursor-not-allowed
                                ${isPurchased ? 'bg-green-500/80 text-white' : ''}
                                ${!isPurchased && canAfford ? 'bg-purple-600 hover:bg-purple-500 text-white' : ''}
                                ${!isPurchased && !canAfford ? 'bg-slate-700 text-slate-400' : ''}
                                "
                            >
                                {isPurchased ? 'تم الشراء' : `شراء (${item.cost} XP)`}
                            </button>
                        )}
                    </div>
                )
            })}
        </div>
    </div>
    );
}

// FIX: Define the Profile component to resolve 'Cannot find name Profile' error.
const Profile: React.FC<{ progress: UserProgress, topics: GrammarTopic[] }> = ({ progress, topics }) => {
    const totalLevels = useMemo(() => topics.reduce((sum, topic) => sum + topic.levels.length, 0), [topics]);
    const completedLevelsCount = useMemo(() => Object.values(progress.completedLevels).reduce((sum, count) => sum + count, 0), [progress.completedLevels]);
    const completionPercentage = totalLevels > 0 ? (completedLevelsCount / totalLevels) * 100 : 0;
    
    const unlockedAchievements = useMemo(() => ACHIEVEMENTS.filter(ach => progress.achievements.includes(ach.id)), [progress.achievements]);

    return (
        <div className="animation-pop-in space-y-8">
            <div className="text-center">
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                    الملف الشخصي
                </h2>
                <p className="text-lg text-slate-400 mt-2">نظرة عامة على تقدمك وإنجازاتك.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Progress Card */}
                <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-2xl font-bold text-white mb-4">إحصائيات التقدم</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-lg">
                            <span className="font-bold">✨ نقاط الخبرة (XP):</span>
                            <span className="font-bold text-2xl text-yellow-300">{progress.xp}</span>
                        </div>
                         <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-lg">
                            <span className="font-bold">📚 المستويات المكتملة:</span>
                            <span className="font-bold text-xl text-purple-300">{completedLevelsCount} / {totalLevels}</span>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1 text-sm text-slate-300">
                                <span>إجمالي التقدم</span>
                                <span>{completionPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fg" style={{ width: `${completionPercentage}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievements Card */}
                <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-2xl font-bold text-white mb-4">الإنجازات المحققة ({unlockedAchievements.length} / {ACHIEVEMENTS.length})</h3>
                    {unlockedAchievements.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {unlockedAchievements.map(ach => (
                                <div key={ach.id} className="flex items-center gap-4 bg-slate-800/60 p-3 rounded-lg">
                                    <div className="w-10 h-10 text-yellow-400 shrink-0" dangerouslySetInnerHTML={{ __html: ach.icon }} />
                                    <div>
                                        <p className="font-bold text-white">{ach.name}</p>
                                        <p className="text-sm text-slate-400">{ach.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-8">لم تحقق أي إنجازات بعد. استمر في التعلم!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// FIX: Add default export for App component to be used in index.tsx
export default App;
