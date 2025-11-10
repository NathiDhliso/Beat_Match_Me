export interface StatusArcProps {
  mode: 'browsing' | 'active' | 'earning';
  revenue: number;
  requestCount: number;
}

export interface CounterProps {
  value: number;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
  label?: string;
}
