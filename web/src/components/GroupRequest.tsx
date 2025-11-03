import React, { useState, useEffect } from 'react';
import { Users, Share2, Copy, Clock, Check } from 'lucide-react';

interface GroupRequestScreenProps {
  song: {
    id: string;
    title: string;
    artist: string;
  };
  totalCost: number;
  onCreateGroupRequest: (data: { targetAmount: number; numberOfPeople: number }) => void;
  onCancel: () => void;
}

export const GroupRequestScreen: React.FC<GroupRequestScreenProps> = ({
  song,
  totalCost,
  onCreateGroupRequest,
  onCancel,
}) => {
  const [targetAmount, setTargetAmount] = useState(totalCost);
  const [numberOfPeople, setNumberOfPeople] = useState(2);

  const perPersonCost = Math.ceil(targetAmount / numberOfPeople);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={onCancel} className="text-gray-400 hover:text-white mb-4">
          ← Back
        </button>

        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create Group Request</h1>
              <p className="text-gray-400">Split the cost with friends</p>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-white mb-1">{song.title}</h3>
            <p className="text-gray-400 text-sm">{song.artist}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Target Amount (R)
              </label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                min={totalCost}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Number of People
              </label>
              <input
                type="number"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(Math.max(2, Number(e.target.value)))}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                min={2}
              />
            </div>

            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4">
              <p className="text-sm text-gray-300 mb-1">Cost per person</p>
              <p className="text-3xl font-bold text-white">R{perPersonCost}</p>
            </div>
          </div>

          <button
            onClick={() => onCreateGroupRequest({ targetAmount, numberOfPeople })}
            className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Create Group Request
          </button>
        </div>
      </div>
    </div>
  );
};

interface Contributor {
  userId: string;
  name: string;
  amount: number;
  status: 'pending' | 'paid';
}

interface GroupRequestLobbyProps {
  groupRequestId: string;
  song: {
    title: string;
    artist: string;
  };
  targetAmount: number;
  currentAmount: number;
  contributors: Contributor[];
  expiresAt: Date;
  shareLink: string;
  onCancel: () => void;
}

export const GroupRequestLobby: React.FC<GroupRequestLobbyProps> = ({
  song,
  targetAmount,
  currentAmount,
  contributors,
  expiresAt,
  shareLink,
  onCancel,
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = expiresAt.getTime() - now;

      if (distance < 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const progress = (currentAmount / targetAmount) * 100;
  const remaining = targetAmount - currentAmount;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Join my group request for ${song.title}`,
        text: `Help me request "${song.title}" by ${song.artist}!`,
        url: shareLink,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Group Request</h1>
              <p className="text-gray-400">{song.title} - {song.artist}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-orange-400">
                <Clock className="w-5 h-5" />
                <span className="font-bold">{timeLeft}</span>
              </div>
              <p className="text-xs text-gray-500">Time left</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Progress</span>
              <span className="text-white font-bold">R{currentAmount} of R{targetAmount}</span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {remaining > 0 ? `R${remaining} more needed` : 'Fully funded! 🎉'}
            </p>
          </div>

          {/* Contributors */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Contributors</h3>
            <div className="space-y-2">
              {contributors.map((contributor) => (
                <div
                  key={contributor.userId}
                  className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                      {contributor.name.charAt(0)}
                    </div>
                    <span className="text-white font-semibold">{contributor.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">R{contributor.amount}</span>
                    {contributor.status === 'paid' ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Link
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full bg-gray-700 text-white py-3 px-6 rounded-xl font-bold hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Link
                </>
              )}
            </button>

            <button
              onClick={onCancel}
              className="w-full bg-gray-800 text-gray-300 py-3 px-6 rounded-xl font-semibold hover:bg-gray-750 transition-all"
            >
              Cancel Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface JoinGroupRequestScreenProps {
  groupRequest: {
    id: string;
    song: {
      title: string;
      artist: string;
    };
    initiatorName: string;
    targetAmount: number;
    currentAmount: number;
    requiredContribution: number;
  };
  onContribute: (amount: number) => void;
  onCancel: () => void;
}

export const JoinGroupRequestScreen: React.FC<JoinGroupRequestScreenProps> = ({
  groupRequest,
  onContribute,
  onCancel,
}) => {
  const [customAmount, setCustomAmount] = useState(groupRequest.requiredContribution);

  const progress = (groupRequest.currentAmount / groupRequest.targetAmount) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={onCancel} className="text-gray-400 hover:text-white mb-4">
          ← Back
        </button>

        <div className="bg-gray-800 rounded-2xl p-6">
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-4 mb-4">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Join Group Request</h1>
            <p className="text-gray-400">
              {groupRequest.initiatorName} invited you to contribute
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-white text-lg mb-1">{groupRequest.song.title}</h3>
            <p className="text-gray-400">{groupRequest.song.artist}</p>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Funding Progress</span>
              <span className="text-white font-bold">
                R{groupRequest.currentAmount} / R{groupRequest.targetAmount}
              </span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Contribution Amount */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Your Contribution
            </label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(Math.max(10, Number(e.target.value)))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              min={10}
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Minimum: R10 • Suggested: R{groupRequest.requiredContribution}
            </p>
          </div>

          <button
            onClick={() => onContribute(customAmount)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Contribute R{customAmount}
          </button>
        </div>
      </div>
    </div>
  );
};
