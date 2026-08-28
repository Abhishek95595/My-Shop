import { IAuthService, MockUser } from './authTypes';

const SESSION_STORAGE_KEY = 'koh_mock_auth_session';

export const PRESET_MOCK_USERS: MockUser[] = [
  {
    id: 'mock-user-01',
    name: 'Abhishek Verma',
    email: 'abhishek.customer@gmail.com',
  },
  {
    id: 'mock-user-02',
    name: 'Priya Sharma',
    email: 'priya.wedding@gmail.com',
  },
];

class MockAuthService implements IAuthService {
  private listeners: Set<(user: MockUser | null) => void> = new Set();

  public getCurrentUser(): MockUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed.id === 'string' && typeof parsed.email === 'string') {
        return parsed as MockUser;
      }
      return null;
    } catch {
      return null;
    }
  }

  public async signInWithMockGoogle(profile?: {
    name: string;
    email: string;
    avatarUrl?: string;
  }): Promise<MockUser> {
    const user: MockUser = profile
      ? {
          id: `mock-user-${profile.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          name: profile.name.trim() || 'Valued Customer',
          email: profile.email.trim().toLowerCase(),
          avatarUrl: profile.avatarUrl,
        }
      : PRESET_MOCK_USERS[0];

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      } catch (err) {
        console.warn('Failed to save mock auth session:', err);
      }
    }

    this.notifyListeners(user);
    return user;
  }

  public async signOut(): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch (err) {
        console.warn('Failed to clear mock auth session:', err);
      }
    }
    this.notifyListeners(null);
  }

  public onAuthStateChanged(callback: (user: MockUser | null) => void): () => void {
    this.listeners.add(callback);
    // Initial emission
    callback(this.getCurrentUser());
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(user: MockUser | null) {
    this.listeners.forEach((cb) => {
      try {
        cb(user);
      } catch (e) {
        console.error('Error in auth state listener:', e);
      }
    });
  }
}

export const authService: IAuthService = new MockAuthService();
