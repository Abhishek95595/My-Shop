import { Product } from '../productTypes';
import { RepositoryStatus } from '../types';

export interface SavedCollectionHydrationInput {
  authLoading: boolean;
  userId: string | null;
  loadedUserId: string | null;
  savedIds: string[];
  savedStatus: RepositoryStatus;
  savedError: Error | null;
  products: Product[];
  productsStatus: RepositoryStatus;
  productsError: Error | null;
}

export interface SavedCollectionHydration {
  status: RepositoryStatus;
  products: Product[];
  missingProductIds: string[];
  error: Error | null;
}

export function resolveSavedProducts(
  savedIds: string[],
  products: Product[]
): Pick<SavedCollectionHydration, 'products' | 'missingProductIds'> {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const uniqueSavedIds = Array.from(new Set(savedIds));
  const resolvedProducts: Product[] = [];
  const missingProductIds: string[] = [];

  uniqueSavedIds.forEach((productId) => {
    const product = productsById.get(productId);
    if (product) {
      resolvedProducts.push(product);
    } else {
      missingProductIds.push(productId);
    }
  });

  return { products: resolvedProducts, missingProductIds };
}

export function deriveSavedCollection(
  input: SavedCollectionHydrationInput
): SavedCollectionHydration {
  if (input.authLoading) {
    return { status: 'loading', products: [], missingProductIds: [], error: null };
  }

  if (!input.userId) {
    return { status: 'ready', products: [], missingProductIds: [], error: null };
  }

  if (input.loadedUserId !== input.userId) {
    return { status: 'loading', products: [], missingProductIds: [], error: null };
  }

  if (input.savedStatus === 'error') {
    return {
      status: 'error',
      products: [],
      missingProductIds: [],
      error: input.savedError || new Error('Saved items could not be loaded from Cloud Firestore.'),
    };
  }

  if (input.savedStatus === 'loading' || input.productsStatus === 'loading') {
    return { status: 'loading', products: [], missingProductIds: [], error: null };
  }

  if (input.productsStatus === 'error') {
    return {
      status: 'error',
      products: [],
      missingProductIds: [],
      error: input.productsError || new Error('The product catalogue could not be loaded.'),
    };
  }

  const resolved = resolveSavedProducts(input.savedIds, input.products);
  return { status: 'ready', ...resolved, error: null };
}
