'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AuthUser } from '@/services/auth/authTypes';
import { firebaseAuthService as authService } from '@/services/auth/firebaseAuthService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: (triggerEl?: HTMLElement | null) => void;
  closeLoginModal: () => void;
  login: () => Promise<AuthUser>;
  logout: () => Promise<void>;
  getTriggerElement: () => HTMLElement | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openLoginModal = useCallback((triggerEl?: HTMLElement | null) => {
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

    // Restore focus to trigger element
    if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
      setTimeout(() => {
        triggerElementRef.current?.focus();
      }, 50);
    }
  }, []);

  const login = useCallback(
    async () => {
      const loggedInUser = await authService.signInWithGoogle();
      setUser(loggedInUser);
      setIsLoginModalOpen(false);

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
