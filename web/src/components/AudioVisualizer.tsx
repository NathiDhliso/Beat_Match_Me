import React, { useEffect, useRef, useState } from 'react';
import { getGradientCSS, getRandomGradient, interpolateColor, type EmotionalState } from '../utils/gradients';

interface AudioVisualizerProps {
  enabled?: boolean;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  enabled = true,
  className = '',
}) => {
  const [emotionalState, setEmotionalState] = useState<EmotionalState>('building_energy');
  const [hueOffset, setHueOffset] = useState(0);
  const [isRare, setIsRare] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 256;
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        startVisualization();
      } catch (error) {
        console.warn('Microphone access denied, using fallback visualization');
        startFallbackVisualization();
      }
    };

    initAudio();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [enabled]);

  const startVisualization = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate frequency bands
      const bass = average(dataArray.slice(0, 10));
      const mid = average(dataArray.slice(10, 50));
      const treble = average(dataArray.slice(50, 128));

      // Determine emotional state based on audio characteristics
      const totalEnergy = bass + mid + treble;
      const bassRatio = bass / totalEnergy;

      let newState: EmotionalState = 'building_energy';
      if (totalEnergy > 600) {
        newState = 'peak_hype';
      } else if (bassRatio > 0.5) {
        newState = 'intimate_moment';
      } else if (totalEnergy < 200) {
        newState = 'cool_down';
      }

      setEmotionalState(newState);
      setAudioLevel(totalEnergy / 765); // Normalize to 0-1

      // Occasionally change gradient with random variation
      if (Math.random() < 0.01) {
        const { state, hueOffset: offset, isRare: rare } = getRandomGradient();
        setEmotionalState(state);
        setHueOffset(offset);
        setIsRare(rare);
      }

      animationFrameRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  };

  const startFallbackVisualization = () => {
    // Simulate audio-reactive behavior without microphone
    const simulate = () => {
      const time = Date.now() / 1000;
      const level = (Math.sin(time * 0.5) + 1) / 2;
      setAudioLevel(level);

      if (Math.random() < 0.005) {
        const { state, hueOffset: offset, isRare: rare } = getRandomGradient();
        setEmotionalState(state);
        setHueOffset(offset);
        setIsRare(rare);
      }

      animationFrameRef.current = requestAnimationFrame(simulate);
    };

    simulate();
  };

  const average = (array: Uint8Array): number => {
    return array.reduce((sum, value) => sum + value, 0) / array.length;
  };

  const gradientStyle = {
    background: getGradientCSS(emotionalState, hueOffset),
    opacity: 0.3 + audioLevel * 0.4,
  };

  return (
    <div
      className={`fixed inset-0 pointer-events-none transition-opacity duration-300 ${className}`}
      style={gradientStyle}
    >
      {isRare && (
        <div className="absolute inset-0 animate-pulse">
          <div className="absolute inset-0 bg-gradient-euphoria opacity-50" />
        </div>
      )}

      {/* Circular waveform on periphery */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: audioLevel * 0.5 }}
      >
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeDasharray={`${audioLevel * 100} ${100 - audioLevel * 100}`}
          className="animate-spin-slow"
        />
      </svg>
    </div>
  );
};

/**
 * Edge glow indicator for gesture hints
 */
interface EdgeGlowProps {
  edge: 'left' | 'right' | 'top' | 'bottom';
  visible: boolean;
  color?: string;
}

export const EdgeGlow: React.FC<EdgeGlowProps> = ({
  edge,
  visible,
  color = 'cyan',
}) => {
  const colorMap = {
    cyan: 'from-primary-500',
    magenta: 'from-accent-500',
    yellow: 'from-gold-500',
    green: 'from-green-500',
  };

  const positionClasses = {
    left: 'left-0 top-0 bottom-0 w-1 bg-gradient-to-r',
    right: 'right-0 top-0 bottom-0 w-1 bg-gradient-to-l',
    top: 'top-0 left-0 right-0 h-1 bg-gradient-to-b',
    bottom: 'bottom-0 left-0 right-0 h-1 bg-gradient-to-t',
  };

  return (
    <div
      className={`
        fixed ${positionClasses[edge]}
        ${colorMap[color as keyof typeof colorMap]} to-transparent
        pointer-events-none
        transition-opacity duration-300
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
      style={{
        boxShadow: visible ? `0 0 20px ${color}` : 'none',
      }}
    />
  );
};

/**
 * Particle burst effect for kick drum detection
 */
interface ParticleBurstProps {
  trigger: boolean;
  color?: string;
}

export const ParticleBurst: React.FC<ParticleBurstProps> = ({
  trigger,
  color = '#00d9ff',
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      setParticles(newParticles);

      setTimeout(() => {
        setParticles([]);
      }, 1000);
    }
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-fade-out"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      ))}
    </div>
  );
};
