'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MockUser } from '@/services/auth/authTypes';
import { authService } from '@/services/auth/mockAuthService';

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: (onSuccessCallback?: () => void) => void;
  closeLoginModal: () => void;
  login: (profile?: { name: string; email: string; avatarUrl?: string }) => Promise<MockUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openLoginModal = useCallback((onSuccessCallback?: () => void) => {
    if (onSuccessCallback) {
      setPendingAction(() => onSuccessCallback);
    } else {
      setPendingAction(null);
    }
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
    setPendingAction(null);
  }, []);

  const login = useCallback(
    async (profile?: { name: string; email: string; avatarUrl?: string }) => {
      const loggedInUser = await authService.signInWithMockGoogle(profile);
      setIsLoginModalOpen(false);

      if (pendingAction) {
        try {
          pendingAction();
        } catch (err) {
          console.error('Error executing pending action after login:', err);
        }
        setPendingAction(null);
      }
      return loggedInUser;
    },
    [pendingAction]
  );

  const logout = useCallback(async () => {
    await authService.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
