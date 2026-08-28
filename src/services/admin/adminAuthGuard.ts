import { MockUser } from '../auth/authTypes';

/**
 * PHASE 4 MOCK ADMIN ALLOWLIST
 * Only these two normalized Gmail identities are permitted to access the local /admin dashboard.
 * 
 * SECURITY BOUNDARY:
 * This is a local mock client-side demonstration check.
 * It does NOT constitute server-side or production security.
 * Client-side mock email checks must never be trusted for real administrative authorization.
 * Production admin authorization will strictly require verified server-side
 * authentication and authorization rules.
 */
export const ADMIN_EMAILS: readonly string[] = [
  '100abhisheksarraf@gmail.com',
  '100dilipsarraf@gmail.com',
] as const;

export const PRESET_ADMIN_PERSONAS: { name: string; email: string }[] = [
  {
    name: 'Abhishek Sarraf (Admin)',
    email: '100abhisheksarraf@gmail.com',
  },
  {
    name: 'Dilip Kumar Verma (Owner & Admin)',
    email: '100dilipsarraf@gmail.com',
  },
];

/**
 * Checks whether a given mock customer identity matches an approved admin email.
 * Normalizes email to lowercase and trims whitespace before evaluation.
 */
export function isMockAdmin(user: MockUser | null): boolean {
  if (!user || !user.email) return false;
  const normalized = user.email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(normalized);
}
