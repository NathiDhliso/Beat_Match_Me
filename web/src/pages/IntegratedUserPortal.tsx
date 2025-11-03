/**
 * Integrated User Portal with Live Backend
 * Connects all UI components to GraphQL API
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../hooks/useQueue';
import { useRequest } from '../hooks/useRequest';
import { useUpvote } from '../hooks/useUpvote';
import { useGroupRequest } from '../hooks/useGroupRequest';
import { SongSelectionScreen } from '../components/SongSelection';
import { RequestConfirmation, RequestData } from '../components/RequestConfirmation';
import { RequestTrackingView } from '../components/RequestTracking';
import { AudienceQueueView } from '../components/QueueViews';
import { GroupRequestScreen, GroupRequestLobby, JoinGroupRequestScreen } from '../components/GroupRequest';
import { PaymentModal, PaymentSuccessModal, PaymentData } from '../components/PaymentModal';

type View = 'song-selection' | 'request-confirmation' | 'request-tracking' | 'queue' | 'group-request' | 'group-lobby' | 'join-group';

export const IntegratedUserPortal: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<View>('song-selection');
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [currentEventId] = useState('demo-event-123'); // In production, get from event selection
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [requestData, setRequestData] = useState<RequestData | null>(null);

  // Hooks
  const { queue, loading: queueLoading } = useQueue(currentEventId);
  const { createRequest, loading: requestLoading } = useRequest();
  const { upvote } = useUpvote();
  const { groupRequest, createGroupRequest, contribute } = useGroupRequest();

  // Mock tracklist - in production, fetch from backend
  const mockTracklist = [
    { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Pop', duration: '3:20', upvotes: 15, isInQueue: false },
    { id: '2', title: 'Levitating', artist: 'Dua Lipa', genre: 'Dance', duration: '3:23', upvotes: 23, isInQueue: true },
    { id: '3', title: 'Save Your Tears', artist: 'The Weeknd', genre: 'Pop', duration: '3:35', upvotes: 8, isInQueue: false },
    { id: '4', title: 'Good 4 U', artist: 'Olivia Rodrigo', genre: 'Pop Rock', duration: '2:58', upvotes: 31, isInQueue: false },
    { id: '5', title: 'Peaches', artist: 'Justin Bieber', genre: 'R&B', duration: '3:18', upvotes: 12, isInQueue: false },
  ];

  // Handlers
  const handleSongSelect = (song: any) => {
    setSelectedSong(song);
    setCurrentView('request-confirmation');
  };

  const handleRequestConfirm = async (data: RequestData) => {
    setRequestData(data);
    setShowPayment(true);
  };

  const handlePaymentConfirm = async (paymentData: PaymentData) => {
    try {
      // Create request in backend
      const result = await createRequest({
        eventId: currentEventId,
        songTitle: selectedSong.title,
        artistName: selectedSong.artist,
        genre: selectedSong.genre,
        requestType: requestData!.requestType,
        dedication: requestData!.dedication,
        shoutout: requestData!.shoutout,
      });

      setCurrentRequestId(result.requestId);
      setShowPayment(false);
      setShowSuccess(true);

      // Show success for 3 seconds then go to tracking
      setTimeout(() => {
        setShowSuccess(false);
        setCurrentView('request-tracking');
      }, 3000);
    } catch (error) {
      console.error('Request creation failed:', error);
      alert('Failed to create request. Please try again.');
    }
  };

  const handleUpvote = async (requestId: string, currentUpvotes: number) => {
    try {
      await upvote(requestId, currentUpvotes, (newUpvotes) => {
        // Update UI optimistically
        console.log('Upvotes updated:', newUpvotes);
      });
    } catch (error) {
      console.error('Upvote failed:', error);
    }
  };

  const handleCreateGroupRequest = async (data: { targetAmount: number; numberOfPeople: number }) => {
    try {
      const result = await createGroupRequest({
        eventId: currentEventId,
        songTitle: selectedSong.title,
        artistName: selectedSong.artist,
        targetAmount: data.targetAmount,
      });
      setCurrentView('group-lobby');
    } catch (error) {
      console.error('Group request creation failed:', error);
      alert('Failed to create group request. Please try again.');
    }
  };

  const handleContribute = async (amount: number) => {
    try {
      if (groupRequest?.groupRequestId) {
        await contribute(groupRequest.groupRequestId, amount);
      }
    } catch (error) {
      console.error('Contribution failed:', error);
      alert('Failed to contribute. Please try again.');
    }
  };

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'song-selection':
        return (
          <SongSelectionScreen
            tracklist={mockTracklist}
            onSelectSong={handleSongSelect}
            onFeelingLucky={() => {
              const randomSong = mockTracklist[Math.floor(Math.random() * mockTracklist.length)];
              handleSongSelect(randomSong);
            }}
          />
        );

      case 'request-confirmation':
        return selectedSong ? (
          <RequestConfirmation
            song={selectedSong}
            basePrice={20}
            queuePosition={queue?.orderedRequests?.length + 1 || 1}
            estimatedWaitMinutes={15}
            spotlightSlotsAvailable={2}
            onConfirm={handleRequestConfirm}
            onCancel={() => setCurrentView('song-selection')}
          />
        ) : null;

      case 'request-tracking':
        return currentRequestId ? (
          <RequestTrackingView
            request={{
              id: currentRequestId,
              songTitle: selectedSong?.title || '',
              artist: selectedSong?.artist || '',
              status: 'pending',
              queuePosition: 5,
              totalInQueue: 12,
              estimatedWaitMinutes: 18,
            }}
            onViewQueue={() => setCurrentView('queue')}
            onAddAnother={() => setCurrentView('song-selection')}
            onShare={() => alert('Share functionality')}
          />
        ) : null;

      case 'queue':
        return (
          <AudienceQueueView
            queue={queue?.orderedRequests || []}
            currentlyPlaying={queue?.currentlyPlaying}
            onUpvote={handleUpvote}
          />
        );

      case 'group-request':
        return selectedSong ? (
          <GroupRequestScreen
            song={selectedSong}
            totalCost={20}
            onCreateGroupRequest={handleCreateGroupRequest}
            onCancel={() => setCurrentView('request-confirmation')}
          />
        ) : null;

      case 'group-lobby':
        return groupRequest ? (
          <GroupRequestLobby
            groupRequestId={groupRequest.groupRequestId}
            song={groupRequest}
            targetAmount={groupRequest.targetAmount}
            currentAmount={groupRequest.currentAmount}
            contributors={groupRequest.contributors || []}
            expiresAt={new Date(groupRequest.expiresAt)}
            shareLink={`beatmatchme://group/${groupRequest.groupRequestId}`}
            onCancel={() => setCurrentView('song-selection')}
          />
        ) : null;

      default:
        return <div>Unknown view</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">BeatMatchMe</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentView('song-selection')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Browse Songs
            </button>
            <button
              onClick={() => setCurrentView('queue')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              View Queue
            </button>
            {currentRequestId && (
              <button
                onClick={() => setCurrentView('request-tracking')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                My Request
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {renderView()}

      {/* Payment Modal */}
      {showPayment && requestData && selectedSong && (
        <PaymentModal
          amount={requestData.totalPrice}
          songTitle={selectedSong.title}
          artist={selectedSong.artist}
          onConfirm={handlePaymentConfirm}
          onCancel={() => setShowPayment(false)}
        />
      )}

      {/* Success Modal */}
      {showSuccess && requestData && selectedSong && (
        <PaymentSuccessModal
          amount={requestData.totalPrice}
          songTitle={selectedSong.title}
          onClose={() => {
            setShowSuccess(false);
            setCurrentView('request-tracking');
          }}
        />
      )}

      {/* Loading Overlay */}
      {(requestLoading || queueLoading) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-white mt-4">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};
