import React, { useRef, useEffect } from 'react';

const ParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let stars: Star[] = [];
        const starCount = 80;
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Star {
            x: number;
            y: number;
            radius: number;
            vx: number;
            vy: number;
            alpha: number;
            phase: number;
            phaseSpeed: number;

            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.radius = Math.random() * 1.5 + 0.5;
                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = (Math.random() - 0.5) * 0.2;
                this.alpha = 0.5 + Math.random() * 0.5;
                this.phase = Math.random() * Math.PI * 2;
                this.phaseSpeed = 0.005 + Math.random() * 0.03;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < -this.radius) this.x = canvas.width + this.radius;
                if (this.x > canvas.width + this.radius) this.x = -this.radius;
                if (this.y < -this.radius) this.y = canvas.height + this.radius;
                if (this.y > canvas.height + this.radius) this.y = -this.radius;
                
                this.phase += this.phaseSpeed;
                this.alpha = 0.5 + 0.5 * Math.sin(this.phase);
            }

            draw() {
                ctx!.beginPath();
                ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                const gradient = ctx!.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                gradient.addColorStop(0, `rgba(216, 180, 254, ${this.alpha})`); // purple-300
                gradient.addColorStop(0.8, `rgba(217, 70, 239, ${this.alpha * 0.7})`); // fuchsia-500
                gradient.addColorStop(1, `rgba(217, 70, 239, 0)`);
                ctx!.fillStyle = gradient;
                ctx!.fill();
            }
        }

        const init = () => {
            stars = [];
            for (let i = 0; i < starCount; i++) {
                stars.push(new Star());
            }
        };

        const drawLines = () => {
            for (let i = 0; i < starCount; i++) {
                for (let j = i + 1; j < starCount; j++) {
                    const dx = stars[i].x - stars[j].x;
                    const dy = stars[i].y - stars[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        const opacity = 1 - (distance / 150);
                        ctx!.strokeStyle = `rgba(192, 132, 252, ${opacity * 0.3})`;
                        ctx!.lineWidth = 0.5;
                        ctx!.beginPath();
                        ctx!.moveTo(stars[i].x, stars[i].y);
                        ctx!.lineTo(stars[j].x, stars[j].y);
                        ctx!.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx!.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(star => {
                star.update();
                star.draw();
            });
            drawLines();
            animationFrameId = requestAnimationFrame(animate);
        };
        
        resizeCanvas();
        init();
        animate();
        
        window.addEventListener('resize', () => {
            resizeCanvas();
            init(); // Re-initialize stars on resize to fit new dimensions
        });

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} id="particle-canvas" />;
};

export default ParticleBackground;