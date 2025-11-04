/**
 * useQueueSubscription Hook
 * Real-time WebSocket subscription for queue updates
 * Handles connection monitoring, automatic reconnection, and background mode
 */

import { useEffect, useState, useCallback, useRef } from 'react';

interface QueuePosition {
  requestId: string;
  queuePosition: number;
  status: string;
  estimatedWaitTime?: string;
}

interface QueueUpdate {
  eventId: string;
  orderedRequests: QueuePosition[];
  lastUpdated: number;
}

interface ConnectionStatus {
  isConnected: boolean;
  reconnectAttempts: number;
  lastError?: string;
}

export function useQueueSubscription(requestId: string | null, eventId: string | null) {
  const [queueData, setQueueData] = useState<QueuePosition | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    reconnectAttempts: 0,
  });
  const [isBackgroundMode, setIsBackgroundMode] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 2000;

  // Battery optimization: Switch to polling if battery is low
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        battery.addEventListener('levelchange', () => {
          if (battery.level < 0.2) {
            console.log('Low battery detected, switching to polling mode');
            setIsBackgroundMode(true);
          }
        });
      });
    }
  }, []);

  const connect = useCallback(() => {
    if (!requestId || !eventId) return;

    try {
      // In production, use your AppSync WebSocket endpoint
      const wsUrl = `wss://your-appsync-endpoint.amazonaws.com/graphql?header=${btoa(JSON.stringify({
        host: 'your-appsync-endpoint.amazonaws.com',
        'x-api-key': process.env.REACT_APP_APPSYNC_API_KEY
      }))}&payload=${btoa(JSON.stringify({
        query: `
          subscription OnQueueUpdate($eventId: ID!) {
            onQueueUpdate(eventId: $eventId) {
              eventId
              orderedRequests {
                requestId
                queuePosition
                status
              }
              lastUpdated
            }
          }
        `,
        variables: { eventId }
      }))}`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected');
        setConnectionStatus({
          isConnected: true,
          reconnectAttempts: 0,
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: QueueUpdate = JSON.parse(event.data);
          
          // Find this request in the queue
          const myRequest = data.orderedRequests.find(r => r.requestId === requestId);
          
          if (myRequest) {
            // Calculate estimated wait time (3 minutes per position)
            const estimatedMinutes = myRequest.queuePosition * 3;
            
            setQueueData({
              ...myRequest,
              estimatedWaitTime: `~${estimatedMinutes} minutes`,
            });

            // Trigger notifications based on position
            if (myRequest.queuePosition === 1) {
              sendNotification("You're Next!", "Your song will play next!");
            } else if (myRequest.queuePosition === 2) {
              sendNotification("Coming Up Next!", "Your song is almost up!");
            }
          }
        } catch (error) {
          console.error('Error parsing queue update:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: false,
          lastError: 'Connection error',
        }));
      };

      wsRef.current.onclose = () => {
        console.log('🔌 WebSocket closed');
        setConnectionStatus(prev => ({
          isConnected: false,
          reconnectAttempts: prev.reconnectAttempts + 1,
        }));

        // Attempt to reconnect
        if (connectionStatus.reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`🔄 Reconnecting... (Attempt ${connectionStatus.reconnectAttempts + 1}/${maxReconnectAttempts})`);
            connect();
          }, reconnectDelay);
        } else {
          console.log('❌ Max reconnection attempts reached, switching to polling');
          setIsBackgroundMode(true);
        }
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: false,
        lastError: 'Failed to connect',
      }));
    }
  }, [requestId, eventId, connectionStatus.reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
  }, []);

  const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/logo.png' });
    }
  };

  // Polling fallback for background mode or low battery
  useEffect(() => {
    if (isBackgroundMode && requestId && eventId) {
      console.log('📡 Starting polling mode');
      
      const poll = async () => {
        try {
          // Fetch queue data from API
          const response = await fetch(`/api/queue/${eventId}`, {
            headers: {
              'Content-Type': 'application/json',
              // Add auth headers
            },
          });
          
          const data: QueueUpdate = await response.json();
          const myRequest = data.orderedRequests.find(r => r.requestId === requestId);
          
          if (myRequest) {
            const estimatedMinutes = myRequest.queuePosition * 3;
            setQueueData({
              ...myRequest,
              estimatedWaitTime: `~${estimatedMinutes} minutes`,
            });
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      };

      // Poll every 15 seconds in background mode
      pollingIntervalRef.current = setInterval(poll, 15000);
      poll(); // Initial poll

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [isBackgroundMode, requestId, eventId]);

  // Connect/disconnect WebSocket based on background mode
  useEffect(() => {
    if (!isBackgroundMode) {
      connect();
    } else {
      disconnect();
    }

    return () => disconnect();
  }, [isBackgroundMode, connect, disconnect]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📱 App in background');
        // Keep WebSocket open but be ready to switch to polling if needed
      } else {
        console.log('📱 App in foreground');
        setIsBackgroundMode(false);
        
        // Refresh data when returning to foreground
        if (connectionStatus.isConnected) {
          console.log('🔄 Syncing queue data...');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connectionStatus.isConnected]);

  const refresh = useCallback(async () => {
    if (!requestId || !eventId) return;

    try {
      const response = await fetch(`/api/queue/${eventId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data: QueueUpdate = await response.json();
      const myRequest = data.orderedRequests.find(r => r.requestId === requestId);
      
      if (myRequest) {
        const estimatedMinutes = myRequest.queuePosition * 3;
        setQueueData({
          ...myRequest,
          estimatedWaitTime: `~${estimatedMinutes} minutes`,
        });
      }
    } catch (error) {
      console.error('Refresh error:', error);
    }
  }, [requestId, eventId]);

  return {
    queueData,
    connectionStatus,
    isBackgroundMode,
    refresh,
  };
}
