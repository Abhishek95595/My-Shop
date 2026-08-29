import { IAuthService, MockUser } from './authTypes';
import { auth, isFirebaseConfigured } from '@/lib/firebase/client';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { authService as mockAuthService } from './mockAuthService';

class FirebaseAuthService implements IAuthService {
  public getCurrentUser(): MockUser | null {
    if (!isFirebaseConfigured || !auth) {
      return mockAuthService.getCurrentUser();
    }
    const fbUser = auth.currentUser;
    return fbUser ? this.mapFirebaseUser(fbUser) : null;
  }

  public async signInWithMockGoogle(profile?: {
    name: string;
    email: string;
    avatarUrl?: string;
  }): Promise<MockUser> {
    if (!isFirebaseConfigured || !auth) {
      return mockAuthService.signInWithMockGoogle(profile);
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(auth, provider);
    return this.mapFirebaseUser(credential.user);
  }

  public async signOut(): Promise<void> {
    if (!isFirebaseConfigured || !auth) {
      return mockAuthService.signOut();
    }
    await firebaseSignOut(auth);
  }

  public onAuthStateChanged(callback: (user: MockUser | null) => void): () => void {
    if (!isFirebaseConfigured || !auth) {
      return mockAuthService.onAuthStateChanged(callback);
    }
    return firebaseOnAuthStateChanged(auth, (fbUser) => {
      callback(fbUser ? this.mapFirebaseUser(fbUser) : null);
    });
  }

  private mapFirebaseUser(fbUser: FirebaseUser): MockUser {
    return {
      id: fbUser.uid,
      name: fbUser.displayName || 'Valued Customer',
      email: fbUser.email || '',
      avatarUrl: fbUser.photoURL || undefined,
    };
  }
}

export const firebaseAuthService = new FirebaseAuthService();
