'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, isFirebaseConfigured } from '@/lib/firebase/client';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { AdminUser, adminAuthService } from '@/services/admin/adminAuthService';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  /**
   * Starts the Google sign-in popup. Resolves `true` when the popup sign-in
   * itself completed; it does NOT mean the account is an admin. Authorization is
   * decided only by the live admins/{uid} listener.
   */
  adminLogin: () => Promise<boolean>;
  adminLogout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /**
   * Verified admin identity. Written only by the admins/{uid} realtime listener,
   * which itself only runs for a live Firebase Auth user. Nothing else may set it.
   */
  const [verifiedAdmin, setVerifiedAdmin] = useState<AdminUser | null>(null);
  /**
   * UI/session intent only: the operator pressed "Sign Out" inside the dashboard
   * while the shared Firebase Auth session must stay signed in for the customer
   * account. It can only subtract access, never grant it.
   */
  const [adminSessionRevoked, setAdminSessionRevoked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // No Firebase project configured: admin access is unavailable. There is no
    // local, mock or storage-backed substitute for admin authorization.
    if (!isFirebaseConfigured || !auth) {
      setVerifiedAdmin(null);
      setIsLoading(false);
      return;
    }

    let unsubscribeAdminDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      // Drop any listener bound to the previous Firebase user first.
      if (unsubscribeAdminDoc) {
        unsubscribeAdminDoc();
        unsubscribeAdminDoc = null;
      }

      if (!fbUser) {
        setVerifiedAdmin(null);
        setAdminSessionRevoked(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      unsubscribeAdminDoc = adminAuthService.watchAdminStatus(fbUser.uid, (isAuthorized) => {
        setVerifiedAdmin(
          isAuthorized
            ? {
                uid: fbUser.uid,
                name: fbUser.displayName || 'Authorized Admin',
                email: fbUser.email || '',
              }
            : null
        );
        setIsLoading(false);
      });
    });

    return () => {
      if (unsubscribeAdminDoc) {
        unsubscribeAdminDoc();
      }
      unsubscribeAuth();
    };
  }, []);

  const adminLogin = useCallback(async (): Promise<boolean> => {
    if (!isFirebaseConfigured || !auth) {
      return false;
    }

    setAdminSessionRevoked(false);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      return true;
    } catch (err) {
      console.error('Google Sign-In failed for admin:', err);
      return false;
    }
  }, []);

  const adminLogout = useCallback(async (): Promise<void> => {
    // Deliberately does not call Firebase signOut: the same Auth session backs
    // the customer account. This only records the intent to leave the dashboard.
    setAdminSessionRevoked(true);
  }, []);

  // Effective authorization: verified Firebase user + existing admins/{uid} doc,
  // minus any local sign-out intent.
  const adminUser = adminSessionRevoked ? null : verifiedAdmin;

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAdminAuthenticated: !!adminUser,
        isLoading,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
