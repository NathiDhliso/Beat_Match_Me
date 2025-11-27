import React, { useState, useEffect } from 'react';
import { Music, X } from 'lucide-react';
import type { FloatingBubbleProps } from './types';
import styles from './FloatingActionBubble.module.css';

export const FloatingActionBubble: React.FC<FloatingBubbleProps> = React.memo(({ 
  onMenuToggle, 
  isExpanded, 
  menuOptions 
}) => {
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      setShowItems(true);
    } else {
      const timer = setTimeout(() => {
        setShowItems(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  return (
    <div
      className="fixed z-50 hidden md:block right-6 bottom-6"
      style={{
        overflow: 'visible',
      }}
    >
      <button
        onClick={onMenuToggle}
        className={`relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 shadow-2xl backdrop-blur-lg border-2 border-white/20 hover:scale-110 transition-all duration-300 flex items-center justify-center ${isExpanded ? 'rotate-180' : ''}`}
        style={{
          boxShadow: '0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(168, 85, 247, 0.3)',
        }}
      >
        {isExpanded ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <Music className="w-8 h-8 text-white animate-pulse" />
        )}
        
        {!isExpanded && (
          <>
            <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse" />
          </>
        )}
      </button>

      {showItems && menuOptions && (
        <div className="absolute bottom-20 right-0 flex flex-col gap-3 items-end">
          {menuOptions.map((option, index) => (
            <button
              key={index}
              onClick={option.onClick}
              className={`flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r ${option.color} shadow-lg border border-white/20 hover:scale-105 transition-transform duration-150 ${styles.bubbleItem} ${isExpanded ? styles.bubbleInflate : styles.bubblePop}`}
              style={{
                animationDelay: isExpanded ? `${index * 50}ms` : `${(menuOptions.length - 1 - index) * 30}ms`,
              }}
            >
              <span className="text-white text-sm font-medium">{option.label}</span>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                {option.icon}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

FloatingActionBubble.displayName = 'FloatingActionBubble';
