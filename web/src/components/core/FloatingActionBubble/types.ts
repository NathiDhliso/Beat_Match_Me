export interface MenuOption {
  icon: React.ReactNode;
  label: string;
  angle: number;
  color: string;
  onClick: () => void;
}

export interface FloatingBubbleProps {
  onMenuToggle: () => void;
  isExpanded: boolean;
  menuOptions?: MenuOption[];
}

export interface RadialMenuItemProps {
  icon: React.ReactNode;
  label: string;
  angle: number;
  distance: number;
  color: string;
  onClick: () => void;
  showLabel?: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface DragRef {
  startX: number;
  startY: number;
}
