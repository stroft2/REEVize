import React, { useState, useEffect, useRef } from 'react';

interface SettingsProps {
    theme: 'light' | 'dark';
    onSetTheme: (theme: 'light' | 'dark') => void;
    onGrantDebugXP: () => void;
}

const SettingsCard: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            {title}
        </h3>
        {children}
    </div>
);

const Settings: React.FC<SettingsProps> = ({ theme, onSetTheme, onGrantDebugXP }) => {
    // Timer State
    const [timerInput, setTimerInput] = useState('10');
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerIntervalRef = useRef<number | null>(null);

    // Stopwatch State
    const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
    const stopwatchIntervalRef = useRef<number | null>(null);
    
    // Password State
    const [password, setPassword] = useState('');
    const [passwordFeedback, setPasswordFeedback] = useState<{message: string; type: 'success' | 'error'} | null>(null);

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
    
    const handleTimerStart = () => {
        const minutes = parseInt(timerInput, 10);
        if (!isNaN(minutes) && minutes > 0) {
            setTimerSeconds(minutes * 60);
            setIsTimerRunning(true);
        }
    };
    
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
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };
    
    // Password Logic
    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'PG1') {
            onGrantDebugXP();
            setPasswordFeedback({ message: 'تمت إضافة 5000 XP بنجاح!', type: 'success' });
            setPassword('');
        } else {
            setPasswordFeedback({ message: 'كلمة السر خاطئة.', type: 'error' });
        }
        setTimeout(() => setPasswordFeedback(null), 3000);
    };

    return (
        <div className="animation-pop-in space-y-8">
            <div className="text-center">
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                    الإعدادات
                </h2>
                <p className="text-lg text-slate-400 mt-2">تحكم في تجربة استخدامك للتطبيق.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Appearance Card */}
                <SettingsCard title="المظهر" icon="🎨">
                    <div className="flex items-center justify-between bg-slate-800/60 p-4 rounded-lg">
                        <p className="font-bold text-lg">الوضع الفاتح</p>
                        <button
                            onClick={() => onSetTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-slate-700"
                        >
                            <span
                                className={`${
                                theme === 'light' ? 'translate-x-6' : 'translate-x-1'
                                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                            />
                        </button>
                    </div>
                </SettingsCard>

                {/* Timer Card */}
                <SettingsCard title="منبه المذاكرة" icon="⏰">
                     <div className="text-center mb-4">
                        <p className="text-5xl font-mono tracking-widest font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                            {formatTime(timerSeconds).substring(3)}
                        </p>
                    </div>
                    {isTimerRunning ? (
                         <button onClick={() => setIsTimerRunning(false)} className="w-full py-2 font-bold text-white rounded-lg bg-red-600 hover:bg-red-500 transition-colors">
                            إيقاف المنبه
                        </button>
                    ) : (
                        <div className="flex gap-2">
                             <input 
                                type="number" 
                                value={timerInput}
                                onChange={(e) => setTimerInput(e.target.value)}
                                min="1"
                                className="w-1/3 bg-slate-800 border border-purple-400/30 text-white text-md rounded-lg p-2.5 text-center"
                                placeholder="دقائق"
                            />
                            <button onClick={handleTimerStart} className="w-2/3 py-2 font-bold text-white rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors">
                                بدء المنبه
                            </button>
                        </div>
                    )}
                </SettingsCard>
                
                {/* Stopwatch Card */}
                <SettingsCard title="ساعة الإيقاف" icon="⏱️">
                     <div className="text-center mb-4">
                        <p className="text-5xl font-mono tracking-widest font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                            {formatTime(stopwatchSeconds)}
                        </p>
                    </div>
                     <div className="flex gap-2">
                        <button onClick={() => setIsStopwatchRunning(!isStopwatchRunning)} className={`w-1/2 py-2 font-bold text-white rounded-lg transition-colors ${isStopwatchRunning ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'}`}>
                            {isStopwatchRunning ? 'إيقاف مؤقت' : 'بدء'}
                        </button>
                         <button onClick={() => { setIsStopwatchRunning(false); setStopwatchSeconds(0); }} className="w-1/2 py-2 font-bold text-white rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors">
                            إعادة ضبط
                        </button>
                    </div>
                </SettingsCard>
                
                {/* Secret Code Card */}
                <SettingsCard title="للمطورين" icon="🤫">
                     <p className="text-sm text-slate-400 mb-2">هل لديك كلمة سر؟</p>
                     <form onSubmit={handlePasswordSubmit} className="flex gap-2">
                         <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-purple-400/30 text-white text-md rounded-lg p-2.5"
                            placeholder="أدخل كلمة السر..."
                        />
                        <button type="submit" className="px-4 py-2 font-bold text-white rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 transition-colors">
                            تفعيل
                        </button>
                    </form>
                    {passwordFeedback && (
                        <p className={`mt-2 text-sm font-bold ${passwordFeedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {passwordFeedback.message}
                        </p>
                    )}
                </SettingsCard>
            </div>
        </div>
    );
};

export default Settings;
