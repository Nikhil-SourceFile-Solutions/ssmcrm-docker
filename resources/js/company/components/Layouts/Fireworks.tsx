import React, { useEffect, useRef } from 'react';

const Fireworks = ({ trigger }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!trigger) return; // Don't run unless triggered

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let fireworks = [];
        const colors = ['#ff5733', '#33ff57', '#3357ff', '#ff33a1', '#ffd633'];

        class Firework {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.color = color;
                this.particles = [];
                this.createParticles();
            }

            createParticles() {
                for (let i = 0; i < 100; i++) {
                    const angle = Math.random() * 2 * Math.PI;
                    const speed = Math.random() * 5 + 2;
                    const dx = Math.cos(angle) * speed;
                    const dy = Math.sin(angle) * speed;
                    this.particles.push({
                        x: this.x,
                        y: this.y,
                        dx,
                        dy,
                        alpha: 1,
                        life: Math.random() * 100 + 50,
                    });
                }
            }

            update() {
                this.particles = this.particles.filter((p) => p.alpha > 0);
                this.particles.forEach((p) => {
                    p.x += p.dx;
                    p.y += p.dy;
                    p.alpha -= 0.02;
                    p.dx *= 0.98;
                    p.dy *= 0.98;
                });
            }

            draw() {
                this.particles.forEach((p) => {
                    ctx.globalAlpha = p.alpha;
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
        }

        const createFirework = () => {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            fireworks.push(new Firework(x, y, color));
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            fireworks.forEach((firework, index) => {
                firework.update();
                firework.draw();
                if (firework.particles.length === 0) {
                    fireworks.splice(index, 1);
                }
            });
            requestAnimationFrame(animate);
        };

        const interval = setInterval(createFirework, 200);
        animate();

        // Cleanup after 4 seconds
        setTimeout(() => {
            clearInterval(interval);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            fireworks = [];
        }, 4000);

        return () => {
            clearInterval(interval);
            fireworks = [];
        };
    }, [trigger]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 9999,
                pointerEvents: 'none', // Prevent interaction
            }}
        />
    );
};

export default Fireworks;
