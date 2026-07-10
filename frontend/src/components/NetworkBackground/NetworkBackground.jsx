import { useEffect, useRef } from 'react';
import './NetworkBackground.css';

export default function NetworkBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const mouseTrailRef = useRef([]);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const CONFIG = {
      particleCount: 110,
      connectionDist: 140,
      mouseRadius: 200,
      mouseForce: 0.04,
      baseDrift: 0.55,
      trailLength: 12,
      colors: {
        coral: { r: 255, g: 107, b: 74 },
        gold: { r: 232, g: 179, b: 65 },
        teal: { r: 78, g: 205, b: 196 },
      },
    };

    const PALETTES = [CONFIG.colors.coral, CONFIG.colors.gold, CONFIG.colors.teal];

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * CONFIG.baseDrift;
        this.vy = (Math.random() - 0.5) * CONFIG.baseDrift;
        this.depth = Math.random() * 0.7 + 0.3; // 0.3–1.0 parallax depth
        this.radius = this.depth * 2;
        this.color = PALETTES[Math.floor(Math.random() * PALETTES.length)];
        this.phase = Math.random() * Math.PI * 2;
      }

      update(time) {
        // Organic drift with sine wobble
        this.x += this.vx + Math.sin(time * 0.7 + this.phase) * 0.3 * this.depth;
        this.y += this.vy + Math.cos(time * 0.5 + this.phase) * 0.25 * this.depth;

        // Mouse attraction
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.mouseRadius && dist > 0) {
          const force = ((CONFIG.mouseRadius - dist) / CONFIG.mouseRadius) * CONFIG.mouseForce * this.depth;
          this.x += dx * force;
          this.y += dy * force;
        }

        // Wrap around edges with padding
        const pad = 20;
        if (this.x < -pad) this.x = canvas.width + pad;
        if (this.x > canvas.width + pad) this.x = -pad;
        if (this.y < -pad) this.y = canvas.height + pad;
        if (this.y > canvas.height + pad) this.y = -pad;
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    }

    function initParticles() {
      particlesRef.current = [];
      for (let i = 0; i < CONFIG.particleCount; i++) {
        particlesRef.current.push(new Particle());
      }
    }

    function render(time) {
      const t = time / 1000;
      const w = canvas.width / (Math.min(window.devicePixelRatio, 2));
      const h = canvas.height / (Math.min(window.devicePixelRatio, 2));

      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      // Update particles
      for (const p of particles) {
        p.update(t);
      }

      // Draw connections + triangle fills
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONFIG.connectionDist) {
            const alpha = (1 - dist / CONFIG.connectionDist) * 0.18 * Math.min(a.depth, b.depth);

            // Connection line
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Triangle fills: find a third connected particle
            for (let k = j + 1; k < particles.length; k++) {
              const c = particles[k];
              const distAC = Math.sqrt((a.x - c.x) ** 2 + (a.y - c.y) ** 2);
              const distBC = Math.sqrt((b.x - c.x) ** 2 + (b.y - c.y) ** 2);

              if (distAC < CONFIG.connectionDist && distBC < CONFIG.connectionDist) {
                const triAlpha = alpha * 0.12;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.lineTo(c.x, c.y);
                ctx.closePath();
                ctx.fillStyle = `rgba(255, 107, 74, ${triAlpha})`;
                ctx.fill();
              }
            }
          }
        }
      }

      // Draw particles (nodes)
      for (const p of particles) {
        const { r, g, b } = p.color;

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.04 * p.depth})`;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.6 * p.depth})`;
        ctx.fill();
      }

      // Vignette
      const vigGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.75);
      vigGrad.addColorStop(0, 'rgba(8, 8, 12, 0)');
      vigGrad.addColorStop(1, 'rgba(8, 8, 12, 0.5)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);

      animRef.current = requestAnimationFrame(render);
    }

    function onMouseMove(e) {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    }

    function onMouseLeave() {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    }

    resize();
    initParticles();
    animRef.current = requestAnimationFrame(render);

    window.addEventListener('resize', () => { resize(); initParticles(); });
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="network-canvas" />;
}
