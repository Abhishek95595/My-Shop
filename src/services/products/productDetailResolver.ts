import { Product } from '../productTypes';
import { RepositoryStatus } from '../types';

export type ProductDetailResolutionState =
  | { status: 'loading' }
  | { status: 'ready_with_product'; product: Product }
  | { status: 'ready_missing' }
  | { status: 'error'; message: string };

/**
 * Pure state resolution logic for product detail views.
 *
 * Requirements:
 * - When repository is 'loading', the state is strictly 'loading'. It must NEVER
 *   falsely infer that a product is missing while data is still loading.
 * - When repository is 'error', surfaces an error state rather than classifying as missing.
 * - When repository is 'ready', checks if product was found:
 *   - Found -> 'ready_with_product'
 *   - Not found -> 'ready_missing'
 */
export function resolveProductDetailState(
  repoStatus: RepositoryStatus,
  foundProduct: Product | null,
  loadError?: Error | null
): ProductDetailResolutionState {
  if (repoStatus === 'loading') {
    return { status: 'loading' };
  }

  if (repoStatus === 'error') {
    return {
      status: 'error',
      message: loadError?.message || 'Unable to connect to jewellery catalogue.',
    };
  }

  if (foundProduct) {
    return { status: 'ready_with_product', product: foundProduct };
  }

  return { status: 'ready_missing' };
}
