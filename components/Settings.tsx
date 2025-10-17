import React, { useState, useEffect, useRef } from 'react';

interface SettingsProps {
    theme: 'light' | 'dark';
    onSetTheme: (theme: 'light' | 'dark') => void;
    onModifyXP: (amount: number) => void;
    onResetXP: () => void;
    timerSeconds: number;
    isTimerRunning: boolean;
    onSetIsTimerRunning: (isRunning: boolean) => void;
    onSetTimerSeconds: (seconds: number) => void;
    formatTime: (totalSeconds: number) => string;
    stopwatchSeconds: number;
    isStopwatchRunning: boolean;
    onSetIsStopwatchRunning: (isRunning: boolean) => void;
    onSetStopwatchSeconds: (seconds: number) => void;
    formatStopwatchTime: (totalSeconds: number) => string;
    onResetTheme: () => void;
    activeThemeId: string;
    onResetAllData: () => void;
}

const SettingsCard: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="w-8 h-8 text-purple-400" dangerouslySetInnerHTML={{ __html: icon }} />
            {title}
        </h3>
        {children}
    </div>
);

const ResetDataModal: React.FC<{ onClose: () => void; onConfirm: () => void; }> = ({ onClose, onConfirm }) => {
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
                <h2 className="text-2xl font-bold text-red-400 mb-2">تأكيد مسح البيانات</h2>
                <p className="text-slate-300 mb-6">
                    هل أنت متأكد تمامًا؟ سيتم حذف جميع نقاط الخبرة، المشتريات، والتقدم بشكل نهائي. <strong>لا يمكن التراجع عن هذا الإجراء.</strong>
                </p>
                <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 mb-4">
                    <p className="text-slate-300 mb-2 font-bold">للتأكيد، يرجى حل المعادلة التالية:</p>
                    <p className="text-2xl font-mono tracking-wider text-yellow-300">32837 + x = 63475</p>
                    <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full mt-4 bg-slate-700/80 border border-purple-400/30 text-white text-2xl text-center rounded-lg p-2.5 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="اكتب قيمة x هنا"
                    />
                </div>
                 <div className="flex gap-4">
                    <button onClick={onClose} className="w-full py-3 font-bold text-white rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors">
                        إلغاء
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={inputValue !== correctAnswer}
                        className="w-full py-3 font-bold text-white rounded-lg bg-red-600 hover:bg-red-500 transition-colors disabled:bg-slate-700/50 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >
                        تأكيد المسح
                    </button>
                </div>
            </div>
        </div>
    );
};


const Settings: React.FC<SettingsProps> = ({ 
    theme, 
    onSetTheme, 
    onModifyXP,
    onResetXP,
    timerSeconds,
    isTimerRunning,
    onSetIsTimerRunning,
    onSetTimerSeconds,
    formatTime,
    stopwatchSeconds,
    isStopwatchRunning,
    onSetIsStopwatchRunning,
    onSetStopwatchSeconds,
    formatStopwatchTime,
    onResetTheme,
    activeThemeId,
    onResetAllData
 }) => {
    // Timer State
    const [timerInput, setTimerInput] = useState('10');
    
    // Password State
    const [password, setPassword] = useState('');
    const [passwordFeedback, setPasswordFeedback] = useState<{message: string; type: 'success' | 'error'} | null>(null);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    
    const handleTimerStart = () => {
        const minutes = parseInt(timerInput, 10);
        if (!isNaN(minutes) && minutes > 0) {
            onSetTimerSeconds(minutes * 60);
            onSetIsTimerRunning(true);
        }
    };
    
    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let feedbackMessage: string | null = null;

        switch (password) {
            case 'PG1':
                onModifyXP(5000);
                feedbackMessage = `تمت إضافة 5000 XP بنجاح!`;
                break;
            case '1234':
            case '1337':
            case '0000':
                onModifyXP(100);
                feedbackMessage = `تمت إضافة 100 XP بنجاح!`;
                break;
            case 'IMALOSER':
                onModifyXP(200);
                feedbackMessage = `تمت إضافة 200 XP بنجاح!`;
                break;
            case 'FREEXP':
                onModifyXP(-500);
                feedbackMessage = `تم خصم 500 XP.`;
                break;
            case 'GGEZLOL':
            case 'IGOTSCAMMED':
                onModifyXP(-100);
                feedbackMessage = `تم خصم 100 XP.`;
                break;
            case 'ERASEPLS':
                onResetXP();
                feedbackMessage = `تمت إعادة تعيين نقاط الخبرة إلى 0.`;
                break;
            default:
                setPasswordFeedback({ message: 'كلمة السر خاطئة.', type: 'error' });
                setTimeout(() => setPasswordFeedback(null), 3000);
                return;
        }
        
        if (feedbackMessage) {
            setPasswordFeedback({ message: feedbackMessage, type: 'success' });
            setPassword('');
            setTimeout(() => setPasswordFeedback(null), 3000);
        }
    };

    return (
        <>
            {isResetModalOpen && <ResetDataModal onClose={() => setIsResetModalOpen(false)} onConfirm={onResetAllData} />}
            <div className="animation-pop-in space-y-8">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                        الإعدادات
                    </h2>
                    <p className="text-lg text-slate-400 mt-2">تحكم في تجربة استخدامك للتطبيق.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Appearance Card */}
                    <SettingsCard title="المظهر" icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.712c.44.44.44 1.152 0 1.59l-2.88 2.88m-7.5 4.5V17.25" /></svg>'>
                        <div className="flex items-center justify-between bg-slate-800/60 p-4 rounded-lg mb-4">
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
                        <button
                            onClick={onResetTheme}
                            disabled={activeThemeId === 'default'}
                            className="w-full py-2 font-bold text-white rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors disabled:bg-slate-700/50 disabled:text-slate-500 disabled:cursor-not-allowed"
                        >
                            إعادة تعيين الثيم للافتراضي
                        </button>
                    </SettingsCard>

                    {/* Timer Card */}
                    <SettingsCard title="منبه المذاكرة" icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'>
                        <div className="text-center mb-4">
                            <p className="text-5xl font-mono tracking-widest font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                                {formatTime(timerSeconds)}
                            </p>
                        </div>
                        {isTimerRunning ? (
                            <button onClick={() => onSetIsTimerRunning(false)} className="w-full py-2 font-bold text-white rounded-lg bg-red-600 hover:bg-red-500 transition-colors">
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
                    <SettingsCard title="ساعة الإيقاف" icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a5.25 5.25 0 016.363 4.637a5.25 5.25 0 01-6.363 4.638m-3.69-1.518a5.25 5.25 0 01-4.637-6.363m1.518 3.69A5.25 5.25 0 016.75 6.364m7.89 1.151a5.25 5.25 0 01-1.152 7.89" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 9.75v3l1.5 1.5m6-3.75a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'>
                        <div className="text-center mb-4">
                            <p className="text-5xl font-mono tracking-widest font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">
                                {formatStopwatchTime(stopwatchSeconds)}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => onSetIsStopwatchRunning(!isStopwatchRunning)} className={`w-1/2 py-2 font-bold text-white rounded-lg transition-colors ${isStopwatchRunning ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'}`}>
                                {isStopwatchRunning ? 'إيقاف مؤقت' : 'بدء'}
                            </button>
                            <button onClick={() => { onSetIsStopwatchRunning(false); onSetStopwatchSeconds(0); }} className="w-1/2 py-2 font-bold text-white rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors">
                                إعادة ضبط
                            </button>
                        </div>
                    </SettingsCard>
                    
                    {/* Secret Code Card */}
                    <SettingsCard title="للمطورين" icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>'>
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

                    {/* Data Management Card */}
                    <SettingsCard title="إدارة البيانات" icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>'>
                        <p className="text-sm text-slate-400 mb-4">
                            سيؤدي هذا الإجراء إلى مسح جميع بياناتك، بما في ذلك نقاط الخبرة والمشتريات والتقدم المحرز. لا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <button 
                            onClick={() => setIsResetModalOpen(true)}
                            className="w-full py-2 font-bold text-white rounded-lg bg-red-800 hover:bg-red-700 border border-red-600/80 transition-colors"
                        >
                            مسح جميع بيانات التطبيق
                        </button>
                    </SettingsCard>
                </div>
            </div>
        </>
    );
};

export default Settings;