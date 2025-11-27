import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeline = [
      { el: orb1Ref.current, delay: 0, from: { opacity: 0, scale: 0.5 }, to: { opacity: 1, scale: 1 }, duration: 1200 },
      { el: orb2Ref.current, delay: 200, from: { opacity: 0, scale: 0.5 }, to: { opacity: 1, scale: 1 }, duration: 1200 },
      { el: orb3Ref.current, delay: 400, from: { opacity: 0, scale: 0.5 }, to: { opacity: 1, scale: 1 }, duration: 1200 },
      { el: logoRef.current, delay: 300, from: { opacity: 0, y: 60, scale: 0.8 }, to: { opacity: 1, y: 0, scale: 1 }, duration: 800 },
      { el: titleRef.current, delay: 500, from: { opacity: 0, y: 40 }, to: { opacity: 1, y: 0 }, duration: 800 },
      { el: taglineRef.current, delay: 700, from: { opacity: 0, y: 30 }, to: { opacity: 1, y: 0 }, duration: 800 },
      { el: ctaRef.current, delay: 900, from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0 }, duration: 800 },
      { el: footerRef.current, delay: 1100, from: { opacity: 0 }, to: { opacity: 1 }, duration: 600 },
    ];

    timeline.forEach(({ el, delay, from, to, duration }) => {
      if (!el) return;
      
      el.style.opacity = String(from.opacity);
      if (from.y !== undefined) el.style.transform = `translateY(${from.y}px)${from.scale ? ` scale(${from.scale})` : ''}`;
      if (from.scale !== undefined && from.y === undefined) el.style.transform = `scale(${from.scale})`;

      setTimeout(() => {
        el.style.transition = `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        el.style.opacity = String(to.opacity);
        if (to.y !== undefined) el.style.transform = `translateY(${to.y}px)${to.scale ? ` scale(${to.scale})` : ''}`;
        if (to.scale !== undefined && to.y === undefined) el.style.transform = `scale(${to.scale})`;
      }, delay);
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0a0a0b] text-white overflow-hidden selection:bg-purple-500/30 selection:text-white flex flex-col items-center justify-center">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(10px, -15px) scale(1.02); }
          50% { transform: translate(-5px, -25px) scale(1); }
          75% { transform: translate(-15px, -10px) scale(0.98); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-10px, 15px) scale(0.98); }
          50% { transform: translate(5px, 25px) scale(1); }
          75% { transform: translate(15px, 10px) scale(1.02); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.4), 0 0 80px rgba(236, 72, 153, 0.3); }
          50% { box-shadow: 0 0 60px rgba(139, 92, 246, 0.6), 0 0 100px rgba(236, 72, 153, 0.4); }
        }
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .hero-title {
          background: linear-gradient(135deg, #fff 0%, #a855f7 40%, #ec4899 70%, #f97316 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          background-size: 300% auto;
          animation: gradientMove 8s ease infinite;
        }
        
        @keyframes gradientMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .noise-texture::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .btn-glow:hover {
          box-shadow: 0 0 50px rgba(255,255,255,0.25), 0 0 100px rgba(168, 85, 247, 0.2);
        }
      `}</style>

      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          ref={orb1Ref}
          className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"
          style={{ animation: 'float 15s ease-in-out infinite' }}
        />
        <div 
          ref={orb2Ref}
          className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] bg-pink-600/15 rounded-full blur-[120px]"
          style={{ animation: 'float-reverse 12s ease-in-out infinite' }}
        />
        <div 
          ref={orb3Ref}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-orange-500/10 rounded-full blur-[150px]"
          style={{ animation: 'pulse-subtle 10s ease-in-out infinite' }}
        />
      </div>

      {/* Noise Overlay */}
      <div className="absolute inset-0 noise-texture pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        {/* Logo */}
        <div ref={logoRef} className="mb-10">
          <div 
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-3xl"
            style={{ animation: 'glow 4s ease-in-out infinite' }}
          >
            <Music className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 ref={titleRef} className="text-6xl md:text-8xl font-bold tracking-tight mb-6 leading-[1.05]">
          <span className="hero-title">BeatMatchMe</span>
        </h1>
        
        {/* Tagline */}
        <p ref={taglineRef} className="text-xl md:text-2xl text-gray-400 mb-14 leading-relaxed font-light tracking-wide">
          Connect. Request. Vibe.
        </p>
        
        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => navigate('/login')}
            className="group px-10 py-4 bg-white text-black rounded-2xl font-semibold text-lg hover:scale-105 transition-all duration-300 flex items-center gap-3 btn-glow"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="px-10 py-4 rounded-2xl font-medium text-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Footer */}
      <div ref={footerRef} className="absolute bottom-6 left-0 right-0 text-center text-sm text-gray-600">
        © 2024 BeatMatchMe
      </div>
    </div>
  );
};
