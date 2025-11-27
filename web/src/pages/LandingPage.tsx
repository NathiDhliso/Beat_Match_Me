import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Mic2, DollarSign, ArrowRight, Play, Sparkles } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // "GSAP-like" scroll animations using IntersectionObserver
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observerRef.current?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden selection:bg-purple-500 selection:text-white font-sans">
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes glow {
          0% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.2); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
          100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.2); }
        }
        
        .animate-in {
          animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .hero-title {
          background: linear-gradient(to right, #fff, #a855f7, #ec4899);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          background-size: 200% auto;
          animation: gradientMove 5s linear infinite;
        }
        
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .reveal-on-scroll {
          opacity: 0;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">BeatMatchMe</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 rounded-full text-sm font-medium bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite_reverse]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-[slideUpFade_0.8s_ease-out_forwards]">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">The Future of Live Music Interaction</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 leading-tight opacity-0 animate-[slideUpFade_0.8s_ease-out_0.2s_forwards]">
            Control the <span className="hero-title">Vibe</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed opacity-0 animate-[slideUpFade_0.8s_ease-out_0.4s_forwards]">
            The ultimate platform connecting DJs and fans in real-time. Request songs, tip your favorites, and shape the party.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-[slideUpFade_0.8s_ease-out_0.6s_forwards]">
            <button 
              onClick={() => navigate('/login')}
              className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-pink-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            
            <button className="px-8 py-4 rounded-full font-medium text-lg text-white border border-white/20 hover:bg-white/5 transition-colors flex items-center gap-2">
              <Play className="w-5 h-5 fill-current" /> Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 bg-gray-900/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <Music className="w-8 h-8 text-purple-400" />,
                title: "Request Songs",
                desc: "Browse the DJ's live library and request your favorite tracks instantly."
              },
              {
                icon: <DollarSign className="w-8 h-8 text-green-400" />,
                title: "Tip & Support",
                desc: "Show love to the DJ with direct tips and priority requests."
              },
              {
                icon: <Mic2 className="w-8 h-8 text-pink-400" />,
                title: "Live Interaction",
                desc: "Vote on the next genre, shoutouts, and interactive polls."
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="reveal-on-scroll p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-2 group"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:bg-purple-500/20">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-gray-950 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center reveal-on-scroll">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to turn up the volume?</h2>
          <p className="text-xl text-gray-400 mb-12">Join thousands of DJs and fans creating unforgettable moments together.</p>
          
          <button 
            onClick={() => navigate('/login')}
            className="px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-105 transition-all duration-300 animate-[glow_3s_infinite]"
          >
            Join BeatMatchMe Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-400 text-sm">
            © 2024 BeatMatchMe. All rights reserved.
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
