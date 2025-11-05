/**
 * Loading Skeleton Components
 * Skeleton screens for better perceived performance
 */

import React from 'react';

export const EventCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Image placeholder */}
        <div className="w-20 h-20 bg-gray-700/50 rounded-xl flex-shrink-0"></div>
        
        <div className="flex-1">
          {/* Title */}
          <div className="h-6 bg-gray-700/50 rounded-lg w-3/4 mb-3"></div>
          
          {/* Details */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-4 flex gap-2">
        <div className="h-8 bg-gray-700/50 rounded-lg flex-1"></div>
        <div className="h-8 bg-gray-700/50 rounded-lg flex-1"></div>
      </div>
    </div>
  );
};

export const SongCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 animate-pulse">
      <div className="flex items-center gap-4">
        {/* Album art */}
        <div className="w-16 h-16 bg-gray-700/50 rounded-lg flex-shrink-0"></div>
        
        <div className="flex-1">
          {/* Song title */}
          <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-2"></div>
          {/* Artist */}
          <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
        </div>
        
        {/* Price */}
        <div className="h-8 w-20 bg-gray-700/50 rounded-lg"></div>
      </div>
    </div>
  );
};

export const QueueItemSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-xl p-4 animate-pulse">
      <div className="flex items-center gap-4">
        {/* Position */}
        <div className="w-8 h-8 bg-gray-700/50 rounded-full flex-shrink-0"></div>
        
        <div className="flex-1">
          {/* Song title */}
          <div className="h-5 bg-gray-700/50 rounded w-2/3 mb-2"></div>
          {/* Requester */}
          <div className="h-4 bg-gray-700/50 rounded w-1/3"></div>
        </div>
        
        {/* Status */}
        <div className="h-6 w-20 bg-gray-700/50 rounded-full"></div>
      </div>
    </div>
  );
};

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`${sizeClasses[size]} border-purple-600 border-t-transparent rounded-full animate-spin`}></div>
  );
};

interface LoadingStateProps {
  message?: string;
  children?: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...', children }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-400 mt-4 text-lg">{message}</p>
      {children}
    </div>
  );
};
