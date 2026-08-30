// Minimal Phase 1 Service Abstraction Foundation
export interface IServiceAdapter {
  isReady(): boolean;
}

/**
 * Load state of a Firestore-backed repository.
 *
 * - 'loading' — no snapshot has arrived yet; the cache is not yet meaningful.
 * - 'ready'   — a snapshot arrived; the cache is authoritative (may be empty).
 * - 'error'   — the Firestore listener failed (permission denied, network, setup).
 *               The cache is cleared: an empty result must NOT be read as "no records",
 *               and no local/sample data is substituted.
 */
export type RepositoryStatus = 'loading' | 'ready' | 'error';
