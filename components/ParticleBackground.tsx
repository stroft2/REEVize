import React, { useRef, useEffect } from 'react';

interface ParticleBackgroundProps {
    language: 'ar' | 'fr';
    theme: 'light' | 'dark';
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ language, theme }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>();
    const gradientPoints = useRef<any[]>([]);

    const getColorsFromCSS = () => {
        const style = getComputedStyle(document.documentElement);
        return [
            style.getPropertyValue('--c-brand').trim(),
            style.getPropertyValue('--c-brand-light').trim(),
            style.getPropertyValue('--c-accent').trim()
        ];
    };

    const initializeGradients = (canvas: HTMLCanvasElement, colors: string[]) => {
        gradientPoints.current = [];
        const numPoints = 5;
        for (let i = 0; i < numPoints; i++) {
            gradientPoints.current.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: (Math.random() * 0.5 + 0.5) * Math.min(canvas.width, canvas.height) * 0.5,
                color: colors[i % colors.length],
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
            });
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const colors = getColorsFromCSS();
            initializeGradients(canvas, colors);
        };
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            gradientPoints.current.forEach(point => {
                point.x += point.vx;
                point.y += point.vy;

                if (point.x - point.radius < 0 || point.x + point.radius > canvas.width) point.vx *= -1;
                if (point.y - point.radius < 0 || point.y + point.radius > canvas.height) point.vy *= -1;

                const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius);
                gradient.addColorStop(0, `${point.color}33`); // ~20% opacity
                gradient.addColorStop(1, `${point.color}00`); // 0% opacity
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.filter = 'blur(100px)'; // The magic sauce for the fluid look

            animationFrameId.current = requestAnimationFrame(animate);
        };
        
        resizeCanvas();
        animate();

        window.addEventListener('resize', resizeCanvas);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [language, theme]); // Re-run effect when language or theme changes to get new colors

    return <canvas ref={canvasRef} id="aurora-canvas" />;
};

export default ParticleBackground;