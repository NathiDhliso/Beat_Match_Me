import React, { useEffect, useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { useThemeClasses } from '../context/ThemeContext';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  message,
  onUndo,
  onDismiss,
  duration = 5000,
}) => {
  const themeClasses = useThemeClasses();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  const handleUndo = () => {
    onUndo();
    onDismiss();
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[320px] max-w-md">
        {/* Progress bar */}
        <div className="h-1 bg-gray-800">
          <div
            className={`h-full ${themeClasses.gradientPrimary} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-4 flex items-center gap-3">
          {/* Message */}
          <div className="flex-1">
            <p className="text-white font-medium">{message}</p>
          </div>

          {/* Undo button */}
          <button
            onClick={handleUndo}
            className={`px-4 py-2 ${themeClasses.gradientPrimary} rounded-lg text-white font-semibold hover:opacity-90 transition-all flex items-center gap-2`}
          >
            <RotateCcw className="w-4 h-4" />
            Undo
          </button>

          {/* Close button */}
          <button
            onClick={onDismiss}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast manager for showing toasts
let toastId = 0;
const activeToasts = new Map<number, () => void>();

interface ToastOptions {
  message: string;
  onUndo: () => void;
  duration?: number;
}

export const showUndoToast = (options: ToastOptions): void => {
  const id = toastId++;
  const container = document.createElement('div');
  document.body.appendChild(container);

  const dismiss = () => {
    activeToasts.delete(id);
    const root = (window as any).__UNDO_TOAST_ROOTS__?.get(container);
    if (root) {
      root.unmount();
      (window as any).__UNDO_TOAST_ROOTS__.delete(container);
    }
    document.body.removeChild(container);
  };

  activeToasts.set(id, dismiss);

  // Lazy load React DOM for rendering
  import('react-dom/client').then(({ createRoot }) => {
    if (!document.body.contains(container)) return;

    // Store roots to clean up properly
    if (!(window as any).__UNDO_TOAST_ROOTS__) {
      (window as any).__UNDO_TOAST_ROOTS__ = new Map();
    }

    const root = createRoot(container);
    (window as any).__UNDO_TOAST_ROOTS__.set(container, root);

    root.render(
      <UndoToast
        message={options.message}
        onUndo={options.onUndo}
        onDismiss={dismiss}
        duration={options.duration}
      />
    );
  });
};

// Dismiss all active toasts
export const dismissAllToasts = (): void => {
  activeToasts.forEach((dismiss) => dismiss());
  activeToasts.clear();
};
