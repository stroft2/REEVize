import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Translations } from '../App';

interface SettingsProps {
    theme: 'light' | 'dark';
    onSetTheme: (theme: 'light' | 'dark') => void;
    onResetTheme: () => void;
    activeThemeId: string;
    onResetAllData: () => void;
    onApplyCheatCode: (code: string) => boolean;
    T: Translations;
}

const SettingsCard: React.FC<{ title: string; icon: string; children: React.ReactNode; className?: string, style?: React.CSSProperties }> = ({ title, icon, children, className = '', style }) => (
    <div className={`bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm animation-slide-in-staggered ${className}`} style={style}>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="w-8 h-8 text-[var(--c-brand-light)]" dangerouslySetInnerHTML={{ __html: icon }} />
            {title}
        </h3>
        {children}
    </div>
);

const ResetDataModal: React.FC<{ onClose: () => void; onConfirm: () => void; T: Translations }> = ({ onClose, onConfirm, T }) => {
    const [inputValue, setInputValue] = useState('');
    const correctAnswer = '30638';
    
    return (
        <div className="reset-modal-backdrop">
            <div className="reset-modal-content">
                <div className="w-16 h-16 mx-auto mb-4 text-red-500">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-red-400 mb-2">{T.resetModalTitle}</h2>
                <p className="text-slate-300 mb-6" dangerouslySetInnerHTML={{ __html: T.resetModalDescription }}></p>
                <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 mb-4">
                    <p className="text-slate-300 mb-2 font-bold">{T.resetModalChallenge}</p>
                    <p className="text-2xl font-mono tracking-wider text-yellow-300">32837 + x = 63475</p>
                    <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full mt-4 bg-slate-700/80 border border-brand/30 text-white text-2xl text-center rounded-lg p-2.5 focus-ring-brand"
                        placeholder={T.resetModalPlaceholder}
                    />
                </div>
                 <div className="flex gap-4">
                    <button onClick={onClose} className="w-full btn bg-slate-600 hover:bg-slate-500 text-white interactive-press">
                        {T.resetModalCancel}
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={inputValue !== correctAnswer}
                        className="w-full btn btn-danger interactive-press disabled:bg-slate-700/50 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >
                        {T.resetModalConfirm}
                    </button>
                </div>
            </div>
        </div>
    );
};

const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
const formatStopwatchTime = (timeInMs: number) => {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((timeInMs % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
};


const Settings: React.FC<SettingsProps> = ({ 
    theme, 
    onSetTheme, 
    onResetTheme,
    activeThemeId,
    onResetAllData,
    onApplyCheatCode,
    T,
 }) => {
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    
    // Focus Tools State
    const [focusTab, setFocusTab] = useState<'timer' | 'stopwatch'>('timer');
    
    // Timer State
    const [timerInput, setTimerInput] = useState(25); // Default to 25 mins
    const [timerSeconds, setTimerSeconds] = useState(25 * 60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerIntervalRef = useRef<number | null>(null);

    // Stopwatch State
    const [stopwatchMs, setStopwatchMs] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
    const stopwatchIntervalRef = useRef<number | null>(null);
    const [laps, setLaps] = useState<number[]>([]);

    // Developer Tools State
    const [cheatCodeInput, setCheatCodeInput] = useState('');
    const [cheatCodeFeedback, setCheatCodeFeedback] = useState<string[]>(['> Waiting for command...']);

    const handleTimerStartStop = () => {
        if (isTimerRunning) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
        } else {
            setIsTimerRunning(true);
            timerIntervalRef.current = window.setInterval(() => {
                setTimerSeconds(prev => {
                    if (prev <= 1) {
                        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                        setIsTimerRunning(false);
                        (document.getElementById('alarm-sound') as HTMLAudioElement)?.play();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };
    const handleTimerReset = () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setIsTimerRunning(false);
        setTimerSeconds(timerInput * 60);
    };
    useEffect(() => {
        setTimerSeconds(timerInput * 60);
    }, [timerInput]);
    
    const handleStopwatchStartStop = () => {
        if (isStopwatchRunning) {
            if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
        } else {
            const startTime = Date.now() - stopwatchMs;
            stopwatchIntervalRef.current = window.setInterval(() => {
                setStopwatchMs(Date.now() - startTime);
            }, 10);
        }
        setIsStopwatchRunning(!isStopwatchRunning);
    };
    const handleStopwatchReset = () => {
        if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
        setIsStopwatchRunning(false);
        setStopwatchMs(0);
        setLaps([]);
    };
    const handleLap = () => {
        if(isStopwatchRunning) setLaps(prev => [stopwatchMs, ...prev]);
    };
    
    const handleCheatCodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = cheatCodeInput.trim().toUpperCase();
        if(!code) return;
        const success = onApplyCheatCode(code);
        const feedback = success ? `> SUCCESS: Command '${code}' executed.` : `> ERROR: Command '${code}' not found.`;
        setCheatCodeFeedback(prev => [...prev.slice(-5), feedback]);
        setCheatCodeInput('');
    };

    return (
        <>
            {isResetModalOpen && <ResetDataModal onClose={() => setIsResetModalOpen(false)} onConfirm={onResetAllData} T={T} />}
            <div className="animation-view-in space-y-8">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-gradient-brand">
                        {T.settings}
                    </h2>
                    <p className="text-lg text-slate-400 mt-2">{T.settingsDescription}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Appearance Card */}
                    <SettingsCard title={T.appearance} icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.712c.44.44.44 1.152 0 1.59l-2.88 2.88m-7.5 4.5V17.25" /></svg>' style={{ animationDelay: '0ms' }}>
                        <div className="flex items-center justify-between bg-slate-800/60 p-4 rounded-lg mb-4">
                            <p className="font-bold text-lg">{T.lightMode}</p>
                            <button
                                onClick={() => onSetTheme(theme === 'dark' ? 'light' : 'dark')}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'light' ? 'bg-[var(--c-brand)]' : 'bg-slate-700'}`}
                            >
                                <span
                                    className={`${
                                    theme === 'light' ? 'translate-x-6' : 'translate-x-1'
                                    } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                                />
                            </button>
                        </div>
                        <button
                            onClick={onResetTheme}
                            disabled={activeThemeId === 'default'}
                            className="w-full py-2 btn bg-slate-600 hover:bg-slate-500 text-white interactive-press disabled:bg-slate-700/50 disabled:text-slate-500 disabled:cursor-not-allowed"
                        >
                            {T.resetTheme}
                        </button>
                    </SettingsCard>

                     {/* Focus Tools Card */}
                    <SettingsCard title="Focus Tools" icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>' style={{ animationDelay: '100ms' }}>
                        <div className="bg-slate-800/60 rounded-lg">
                            <div className="flex border-b border-slate-700">
                                <button onClick={() => setFocusTab('timer')} className={`flex-1 p-3 font-bold rounded-tl-lg transition-colors ${focusTab === 'timer' ? 'bg-brand text-white' : 'hover:bg-slate-700'}`}>Timer</button>
                                <button onClick={() => setFocusTab('stopwatch')} className={`flex-1 p-3 font-bold rounded-tr-lg transition-colors ${focusTab === 'stopwatch' ? 'bg-brand text-white' : 'hover:bg-slate-700'}`}>Stopwatch</button>
                            </div>
                            <div className="p-4">
                                {focusTab === 'timer' ? (
                                    <div className="text-center">
                                        <div className="text-6xl font-mono font-bold my-4" style={{textShadow: '0 0 10px var(--c-brand-light)'}}>{formatTime(timerSeconds)}</div>
                                        <input type="number" value={timerInput} onChange={e => setTimerInput(Number(e.target.value))} className="w-24 text-center bg-slate-700 p-1 rounded mb-4" />
                                        <div className="flex gap-2">
                                            <button onClick={handleTimerStartStop} className="w-full btn btn-primary interactive-press">{isTimerRunning ? 'Pause' : 'Start'}</button>
                                            <button onClick={handleTimerReset} className="w-full btn bg-slate-600 hover:bg-slate-500 text-white interactive-press">Reset</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="text-5xl font-mono font-bold my-4" style={{textShadow: '0 0 10px var(--c-brand-light)'}}>{formatStopwatchTime(stopwatchMs)}</div>
                                        <div className="flex gap-2 mb-2">
                                            <button onClick={handleStopwatchStartStop} className="w-full btn btn-primary interactive-press">{isStopwatchRunning ? 'Stop' : 'Start'}</button>
                                            <button onClick={handleLap} className="w-full btn bg-slate-600 hover:bg-slate-500 text-white interactive-press">Lap</button>
                                            <button onClick={handleStopwatchReset} className="w-full btn bg-slate-600 hover:bg-slate-500 text-white interactive-press">Reset</button>
                                        </div>
                                        <div className="h-24 overflow-y-auto text-left bg-slate-900/50 rounded p-2 font-mono text-slate-400">
                                            {laps.map((lap, i) => <div key={i}>Lap {laps.length - i}: {formatStopwatchTime(lap)}</div>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </SettingsCard>
                    
                    {/* Data Management Card */}
                    <SettingsCard title={T.dataManagement} icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>' style={{ animationDelay: '200ms' }}>
                        <p className="text-sm text-slate-400 mb-4">
                            {T.dataWarning}
                        </p>
                        <button 
                            onClick={() => setIsResetModalOpen(true)}
                            className="w-full btn btn-danger border border-red-600/80 interactive-press"
                        >
                            {T.deleteAllData}
                        </button>
                    </SettingsCard>

                    {/* For Developers Card */}
                    <SettingsCard title="For Developers" icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 7.5l3 2.25-3 2.25m3 0h3m-3 2.25l3 2.25-3 2.25M16.5 7.5l-3 2.25 3 2.25m-3 0h3m3 2.25l-3 2.25 3 2.25" /></svg>' style={{ animationDelay: '300ms' }}>
                       <div className="terminal bg-black/80 rounded-lg p-4 font-mono text-sm text-green-400 h-48 flex flex-col">
                         <div className="flex-grow overflow-y-auto">
                            {cheatCodeFeedback.map((line, i) => <p key={i}>{line}</p>)}
                         </div>
                         <form onSubmit={handleCheatCodeSubmit} className="flex items-center gap-2 mt-2">
                            <span className="text-yellow-400">$</span>
                            <input
                                type="text"
                                autoFocus
                                value={cheatCodeInput}
                                onChange={e => setCheatCodeInput(e.target.value)}
                                placeholder="Enter cheat code..."
                                className="terminal-input flex-1 bg-transparent border-none focus:ring-0 text-green-400 placeholder-green-700"
                            />
                         </form>
                       </div>
                    </SettingsCard>

                </div>
            </div>
        </>
    );
};

export default Settings;