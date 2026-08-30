import { db, isFirebaseConfigured } from '@/lib/firebase/client';
import { doc, onSnapshot } from 'firebase/firestore';

export interface AdminUser {
  uid: string;
  name: string;
  email: string;
}

class FirestoreAdminAuthService {
  /**
   * Live-watches admins/{uid} and reports authorization on every change.
   *
   * Authorization is derived exclusively from the existence of the Firestore
   * document admins/{uid}. Because this is a realtime listener (not a one-shot
   * read), deleting that document revokes dashboard access immediately, without
   * a reload or re-authentication.
   *
   * Any listener failure (permission-denied, network loss, setup error) reports
   * `false` so the caller fails closed.
   *
   * Returns the unsubscribe function for the listener.
   */
  public watchAdminStatus(uid: string, onChange: (isAuthorized: boolean) => void): () => void {
    if (!isFirebaseConfigured || !db || !uid) {
      onChange(false);
      return () => {};
    }

    try {
      return onSnapshot(
        doc(db, 'admins', uid),
        (snapshot) => {
          onChange(snapshot.exists());
        },
        (err) => {
          console.error('Admin authorization listener error:', err);
          onChange(false);
        }
      );
    } catch (err) {
      console.error('Failed to attach admin authorization listener:', err);
      onChange(false);
      return () => {};
    }
  }
}

export const adminAuthService = new FirestoreAdminAuthService();
