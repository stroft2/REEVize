import React, { useState, useRef, useEffect, useCallback } from 'react';

interface MusicPlayerProps {
    isOpen: boolean;
    onClose: () => void;
    globalIsPlaying: boolean;
    setGlobalIsPlaying: (isPlaying: boolean) => void;
}

interface Track {
    title: string;
    artist: string;
    url: string;
}

const tracks: Track[] = [
    { title: 'Lofi Study Beats', artist: 'Chillhop Music', url: 'https://aistudiocdn.com/public/previews/2d86a9f4-180b-468a-b86a-735955609311.mp3' },
    { title: 'Ambient Relaxation', artist: 'Quiet Quest', url: 'https://aistudiocdn.com/public/previews/15f0709b-6404-4b2a-a9f8-09ac29d77e11.mp3' },
    { title: 'Focus Flow', artist: 'Mindful Melodies', url: 'https://aistudiocdn.com/public/previews/d60d3674-3221-4d32-959c-100863073289.mp3' },
    { title: 'Piano for Concentration', artist: 'Classical Minds', url: 'https://aistudiocdn.com/public/previews/20c75c80-c189-4b13-9a4f-a957245d1348.mp3' },
    { title: 'Cosmic Drift', artist: 'Stellar Soundscapes', url: 'https://aistudiocdn.com/public/previews/6e409825-7033-4f18-9dba-423594183d25.mp3' },
    { title: 'Rainy Day Cafe', artist: 'Ambiance World', url: 'https://aistudiocdn.com/public/previews/a3d1d3a3-8339-4dea-b42e-72b225324835.mp3' },
    { title: 'Acoustic Sunrise', artist: 'Guitar Strummer', url: 'https://aistudiocdn.com/public/previews/4b56a5c1-884d-4674-9543-b952b1b51e02.mp3' },
    { title: 'Deep Focus Waves', artist: 'Brainwave Beats', url: 'https://aistudiocdn.com/public/previews/8d9c22b6-5d9c-4e1a-8c3b-4c4f3e2e0e0f.mp3' },
];

const MusicPlayer: React.FC<MusicPlayerProps> = ({ isOpen, onClose, globalIsPlaying, setGlobalIsPlaying }) => {
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const currentTrack = tracks[currentTrackIndex];

    const playPauseToggle = useCallback(() => {
        if (globalIsPlaying) {
            audioRef.current?.pause();
            setGlobalIsPlaying(false);
        } else {
            audioRef.current?.play().catch(e => console.error("Error playing audio:", e));
            setGlobalIsPlaying(true);
        }
    }, [globalIsPlaying, setGlobalIsPlaying]);

    useEffect(() => {
        if (globalIsPlaying) {
            audioRef.current?.play().catch(e => console.error("Error playing audio:", e));
        } else {
            audioRef.current?.pause();
        }
    }, [globalIsPlaying]);
    
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => setProgress(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => nextTrack();

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentTrackIndex]);


    const playTrack = (index: number) => {
        setCurrentTrackIndex(index);
        setProgress(0);
        setTimeout(() => {
            audioRef.current?.play().catch(e => console.error("Error playing audio:", e));
            setGlobalIsPlaying(true);
        }, 100);
    };

    const nextTrack = () => {
        const newIndex = (currentTrackIndex + 1) % tracks.length;
        playTrack(newIndex);
    };

    const prevTrack = () => {
        const newIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        playTrack(newIndex);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const handleProgressScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Number(e.target.value);
        }
    }

    if (!isOpen) return null;

    return (
         <div 
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center animation-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-slate-900/80 glowing-border border rounded-2xl shadow-2xl shadow-purple-500/20 animation-pop-in w-11/12 max-w-sm p-6 backdrop-blur-md text-white"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">موسيقى للدراسة</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
                </div>
                
                {/* Now Playing */}
                <div className="text-center bg-slate-800/50 p-4 rounded-lg mb-4">
                    <p className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-fuchsia-400">{currentTrack.title}</p>
                    <p className="text-slate-400 text-sm">{currentTrack.artist}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={progress}
                        onChange={handleProgressScrub}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        style={{'--thumb-color': '#a855f7'} as React.CSSProperties}
                    />
                     <style>{`
                        input[type=range]::-webkit-slider-thumb {
                            background-color: var(--thumb-color);
                        }
                        input[type=range]::-moz-range-thumb {
                            background-color: var(--thumb-color);
                        }
                     `}</style>
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center items-center gap-6 mb-6">
                    <button onClick={prevTrack} className="p-2 rounded-full hover:bg-purple-500/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={playPauseToggle} className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white shadow-lg transform hover:scale-105 transition-transform">
                        {globalIsPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                    </button>
                    <button onClick={nextTrack} className="p-2 rounded-full hover:bg-purple-500/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                    </button>
                </div>

                {/* Playlist */}
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {tracks.map((track, index) => (
                        <div 
                            key={index} 
                            onClick={() => playTrack(index)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${currentTrackIndex === index ? 'bg-purple-500/30' : 'hover:bg-slate-800/60'}`}
                        >
                            <p className="font-semibold">{track.title}</p>
                            <p className="text-sm text-slate-400">{track.artist}</p>
                        </div>
                    ))}
                </div>

                <audio ref={audioRef} src={currentTrack.url} />
            </div>
        </div>
    );
};

export default MusicPlayer;
