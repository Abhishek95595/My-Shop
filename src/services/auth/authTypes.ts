export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface IAuthService {
  getCurrentUser(): MockUser | null;
  signInWithMockGoogle(profile?: { name: string; email: string; avatarUrl?: string }): Promise<MockUser>;
  signOut(): Promise<void>;
  onAuthStateChanged(callback: (user: MockUser | null) => void): () => void;
}
