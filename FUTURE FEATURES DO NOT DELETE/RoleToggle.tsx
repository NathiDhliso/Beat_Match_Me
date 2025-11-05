/**
 * Role Toggle - Simple button to switch between PERFORMER and AUDIENCE
 * For development/testing only
 */

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { updateUserAttributes } from 'aws-amplify/auth';

interface RoleToggleProps {
  currentRole: 'PERFORMER' | 'AUDIENCE';
  onRoleChange: () => void;
}

export const RoleToggle: React.FC<RoleToggleProps> = ({ currentRole, onRoleChange }) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const newRole = currentRole === 'PERFORMER' ? 'AUDIENCE' : 'PERFORMER';
    
    setLoading(true);
    try {
      await updateUserAttributes({
        userAttributes: {
          'custom:role': newRole,
        },
      });
      
      // Reload to apply changes
      window.location.reload();
    } catch (err: any) {
      console.error('Failed to update role:', err);
      
      // If Cognito attribute update fails, just reload anyway
      // The role might not be persisted, but we can still test the UI
      alert(`Note: Role attribute update failed. This is expected if custom:role is not configured in Cognito.\n\nFor testing, the app will reload with the current role.`);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="btn-logout"
      title={`Switch to ${currentRole === 'PERFORMER' ? 'Audience' : 'Performer'} mode`}
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      <span className="text-xs">{currentRole}</span>
    </button>
  );
};
