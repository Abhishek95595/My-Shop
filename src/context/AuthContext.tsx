'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { MockUser } from '@/services/auth/authTypes';
import { authService } from '@/services/auth/mockAuthService';

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: (onSuccessCallback?: () => void, triggerEl?: HTMLElement | null) => void;
  closeLoginModal: () => void;
  login: (profile?: { name: string; email: string; avatarUrl?: string }) => Promise<MockUser>;
  logout: () => Promise<void>;
  getTriggerElement: () => HTMLElement | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // In-memory pending action callback (strictly ephemeral, never persisted to localStorage)
  const pendingActionRef = useRef<(() => void) | null>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openLoginModal = useCallback((onSuccessCallback?: () => void, triggerEl?: HTMLElement | null) => {
    // Only one pending action at a time
    pendingActionRef.current = onSuccessCallback || null;

    // Store triggering element for focus return
    if (triggerEl) {
      triggerElementRef.current = triggerEl;
    } else if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      triggerElementRef.current = document.activeElement;
    } else {
      triggerElementRef.current = null;
    }

    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
    // Discard pending action on cancel/close
    pendingActionRef.current = null;

    // Restore focus to trigger element
    if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
      setTimeout(() => {
        triggerElementRef.current?.focus();
      }, 50);
    }
  }, []);

  const login = useCallback(
    async (profile?: { name: string; email: string; avatarUrl?: string }) => {
      const loggedInUser = await authService.signInWithMockGoogle(profile);
      setIsLoginModalOpen(false);

      // Execute pending action once if present, then safely clear it
      const callback = pendingActionRef.current;
      pendingActionRef.current = null;

      if (callback) {
        try {
          callback();
        } catch (err) {
          console.error('Error executing pending action after login:', err);
        }
      }

      // Return focus to triggering element if possible
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        setTimeout(() => {
          triggerElementRef.current?.focus();
        }, 50);
      }

      return loggedInUser;
    },
    []
  );

  const logout = useCallback(async () => {
    pendingActionRef.current = null;
    triggerElementRef.current = null;
    await authService.signOut();
  }, []);

  const getTriggerElement = useCallback(() => triggerElementRef.current, []);

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
        getTriggerElement,
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
