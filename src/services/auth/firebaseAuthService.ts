import { IAuthService, AuthUser } from './authTypes';
import { auth, isFirebaseConfigured } from '@/lib/firebase/client';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  browserLocalPersistence,
  setPersistence,
  signOut as firebaseSignOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

class FirebaseAuthService implements IAuthService {
  public getCurrentUser(): AuthUser | null {
    if (!isFirebaseConfigured || !auth) {
      return null;
    }
    const fbUser = auth.currentUser;
    return fbUser ? this.mapFirebaseUser(fbUser) : null;
  }

  public async signInWithGoogle(): Promise<AuthUser> {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Google sign-in is unavailable because Firebase is not configured.');
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await setPersistence(auth, browserLocalPersistence);
    const credential = await signInWithPopup(auth, provider);
    return this.mapFirebaseUser(credential.user);
  }

  public async signOut(): Promise<void> {
    if (!isFirebaseConfigured || !auth) {
      return;
    }
    await firebaseSignOut(auth);
  }

  public onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    if (!isFirebaseConfigured || !auth) {
      callback(null);
      return () => undefined;
    }
    return firebaseOnAuthStateChanged(auth, (fbUser) => {
      callback(fbUser ? this.mapFirebaseUser(fbUser) : null);
    });
  }

  private mapFirebaseUser(fbUser: FirebaseUser): AuthUser {
    return {
      id: fbUser.uid,
      name: fbUser.displayName || 'Valued Customer',
      email: fbUser.email || '',
      avatarUrl: fbUser.photoURL || undefined,
    };
  }
}

export const firebaseAuthService = new FirebaseAuthService();
