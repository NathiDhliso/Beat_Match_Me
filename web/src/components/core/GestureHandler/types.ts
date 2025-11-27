export interface GestureHandlerProps {
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  children: React.ReactNode;
  peekContent?: PeekContent;
  disabled?: boolean;
}

export interface PeekContent {
  left?: React.ReactNode;
  right?: React.ReactNode;
  up?: React.ReactNode;
  down?: React.ReactNode;
}

export interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export interface Delta {
  x: number;
  y: number;
}

export interface SwipeCallbacks {
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export interface PeekPreview {
  content: React.ReactNode;
  direction: 'left' | 'right' | 'up' | 'down';
  offset: number;
}
