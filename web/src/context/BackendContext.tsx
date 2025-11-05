import React, { createContext, useContext, useEffect, useState } from 'react';
import { validateBackendReady } from '../utils/validateBackend';

interface BackendContextType {
  subscriptionsAvailable: boolean;
  isReady: boolean;
  errors: string[];
  revalidate: () => Promise<void>;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

export const BackendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<BackendContextType>({
    subscriptionsAvailable: false,
    isReady: false,
    errors: [],
    revalidate: async () => {}
  });

  const revalidate = async () => {
    const validation = await validateBackendReady();
    setState({
      subscriptionsAvailable: validation.subscriptionsAvailable,
      isReady: validation.mutationsAvailable,
      errors: validation.errors,
      revalidate
    });
  };

  useEffect(() => {
    revalidate();
  }, []);

  return (
    <BackendContext.Provider value={state}>
      {children}
    </BackendContext.Provider>
  );
};

export const useBackend = () => {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error('useBackend must be used within BackendProvider');
  }
  return context;
};
