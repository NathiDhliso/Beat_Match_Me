/**
 * Empty State Component
 * Reusable component for empty data states across the app
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  emoji,
  title,
  message,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {/* Icon or Emoji */}
      <div className="mb-6">
        {Icon ? (
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
            <Icon className="w-10 h-10 text-gray-400" />
          </div>
        ) : emoji ? (
          <div className="text-6xl opacity-50">{emoji}</div>
        ) : null}
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>

      {/* Message */}
      <p className="text-gray-400 text-lg max-w-md mb-6">{message}</p>

      {/* Optional Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
