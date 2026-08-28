import { IAuthService, MockUser } from './authTypes';

const SESSION_STORAGE_KEY = 'koh_mock_auth_session';

/**
 * Validates whether an email is a valid format ending specifically in @gmail.com.
 */
export function isValidGmail(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  // Must have characters before @ and end strictly in @gmail.com
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return gmailRegex.test(trimmed);
}

/**
 * Deterministically derives a stable customer ID from the normalized Gmail address.
 * Display name is NOT used for identity/storage resolution.
 */
export function deriveCustomerIdFromEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  const safeId = normalized.replace(/[^a-z0-9]/g, '_');
  return `mock-user-gmail-${safeId}`;
}

export const PRESET_MOCK_USERS: MockUser[] = [
  {
    id: deriveCustomerIdFromEmail('abhishek.customer@gmail.com'),
    name: 'Abhishek Verma',
    email: 'abhishek.customer@gmail.com',
  },
  {
    id: deriveCustomerIdFromEmail('priya.wedding@gmail.com'),
    name: 'Priya Sharma',
    email: 'priya.wedding@gmail.com',
  },
];

/**
 * SECURITY BOUNDARY:
 * Client-side mock identities are strictly customer-level identities for Wishlist
 * and Buying Shortlist local persistence.
 * Under NO circumstances does mock customer authentication grant Admin Dashboard access or roles.
 * Entering owner/admin emails in this mock customer flow does NOT grant any admin privileges or routes.
 * Real admin authorization strictly requires verified Firebase authentication and server-side rules.
 */
class MockAuthService implements IAuthService {
  private listeners: Set<(user: MockUser | null) => void> = new Set();

  public getCurrentUser(): MockUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (
        parsed &&
        typeof parsed.id === 'string' &&
        typeof parsed.email === 'string' &&
        isValidGmail(parsed.email)
      ) {
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
    let normalizedEmail = '';
    let displayName = 'Valued Customer';
    let avatar = profile?.avatarUrl;

    if (profile) {
      normalizedEmail = profile.email.trim().toLowerCase();
      displayName = profile.name.trim() || 'Valued Customer';
    } else {
      normalizedEmail = PRESET_MOCK_USERS[0].email;
      displayName = PRESET_MOCK_USERS[0].name;
    }

    if (!isValidGmail(normalizedEmail)) {
      throw new Error(
        'Invalid Gmail address. Mock customer login requires a valid address ending in @gmail.com'
      );
    }

    const customerId = deriveCustomerIdFromEmail(normalizedEmail);

    const user: MockUser = {
      id: customerId,
      name: displayName,
      email: normalizedEmail,
      avatarUrl: avatar,
    };

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
