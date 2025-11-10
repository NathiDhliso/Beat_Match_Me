export interface Request {
  id: string;
  songTitle: string;
  artistName: string;
  albumArt?: string;
  type: 'standard' | 'spotlight' | 'dedication' | 'premium';
  position: number;
  userName?: string;
  userAvatar?: string;
  userTier?: string;
  price?: number;
  dedication?: string;
}

export interface QueueVisualizerProps {
  requests: Request[];
  onRequestTap?: (request: Request) => void;
  onAccept?: (id: string) => void;
  onVeto: (id: string) => void;
}

export interface RequestCardProps {
  request: Request;
  angle: number;
  distance: number;
  index: number;
  isMobile: boolean;
  isDragging: boolean;
  dragOffset: number;
  onPointerDown: (e: React.PointerEvent, request: Request) => void;
}

export interface DragState {
  id: string;
  startY: number;
  currentY: number;
}
