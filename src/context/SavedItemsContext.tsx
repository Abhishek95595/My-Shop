'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Product } from '@/services/productTypes';
import { productRepository } from '@/services/products/productRepository';
import { firestoreSavedItemsService as savedItemsService } from '@/services/savedItems/firestoreSavedItemsService';
import { deriveSavedCollection } from '@/services/savedItems/savedItemsHydration';
import { SavedListType } from '@/services/savedItems/savedItemsTypes';
import { RepositoryStatus } from '@/services/types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface SavedItemsContextType {
  wishlistIds: string[];
  shortlistIds: string[];
  wishlistProducts: Product[];
  shortlistProducts: Product[];
  wishlistStatus: RepositoryStatus;
  shortlistStatus: RepositoryStatus;
  wishlistError: Error | null;
  shortlistError: Error | null;
  missingWishlistProductIds: string[];
  missingShortlistProductIds: string[];
  isInWishlist: (productId: string) => boolean;
  isInShortlist: (productId: string) => boolean;
  toggleWishlist: (productId: string, productName?: string) => void;
  toggleShortlist: (productId: string, productName?: string) => void;
  removeFromWishlist: (productId: string, productName?: string) => void;
  removeFromShortlist: (productId: string, productName?: string) => void;
  clearWishlist: () => void;
  clearShortlist: () => void;
}

interface PendingSaveAction {
  listType: SavedListType;
  productId: string;
  productName?: string;
}

const SavedItemsContext = createContext<SavedItemsContextType | undefined>(undefined);

function isSameAction(left: PendingSaveAction | null, right: PendingSaveAction): boolean {
  return !!left && left.listType === right.listType && left.productId === right.productId;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getListCopy(listType: SavedListType) {
  return listType === 'wishlist'
    ? {
        label: 'Wishlist',
        savedTitle: 'Saved to Wishlist',
        savedDescription: 'saved to your favourites.',
      }
    : {
        label: 'Buying Shortlist',
        savedTitle: 'Added to Buying Shortlist',
        savedDescription: 'saved for your showroom visit.',
      };
}

export const SavedItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    openLoginModal,
  } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id || null;

  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [shortlistIds, setShortlistIds] = useState<string[]>([]);
  const [wishlistReadStatus, setWishlistReadStatus] = useState<RepositoryStatus>('loading');
  const [shortlistReadStatus, setShortlistReadStatus] = useState<RepositoryStatus>('loading');
  const [wishlistReadError, setWishlistReadError] = useState<Error | null>(null);
  const [shortlistReadError, setShortlistReadError] = useState<Error | null>(null);
  const [publishedProducts, setPublishedProducts] = useState<Product[]>([]);
  const [productsStatus, setProductsStatus] = useState<RepositoryStatus>('loading');
  const [productsError, setProductsError] = useState<Error | null>(null);
  const [pendingSaveAction, setPendingSaveAction] = useState<PendingSaveAction | null>(null);
  const operationsInFlight = useRef(new Set<string>());

  const reloadProducts = useCallback(() => {
    setPublishedProducts(productRepository.getPublishedProducts());
    setProductsStatus(productRepository.getPublishedStatus());
    setProductsError(productRepository.getPublishedLoadError());
  }, []);

  useEffect(() => {
    reloadProducts();
    window.addEventListener('koh_products_updated', reloadProducts);
    return () => window.removeEventListener('koh_products_updated', reloadProducts);
  }, [reloadProducts]);

  const reloadListsForUser = useCallback((nextUserId: string | null) => {
    if (!nextUserId) {
      setLoadedUserId(null);
      setWishlistIds([]);
      setShortlistIds([]);
      setWishlistReadStatus('ready');
      setShortlistReadStatus('ready');
      setWishlistReadError(null);
      setShortlistReadError(null);
      return;
    }

    setLoadedUserId(nextUserId);
    setWishlistIds(savedItemsService.getSavedProductIds(nextUserId, 'wishlist'));
    setShortlistIds(savedItemsService.getSavedProductIds(nextUserId, 'shortlist'));
    setWishlistReadStatus(savedItemsService.getStatus(nextUserId, 'wishlist'));
    setShortlistReadStatus(savedItemsService.getStatus(nextUserId, 'shortlist'));
    setWishlistReadError(savedItemsService.getLoadError(nextUserId, 'wishlist'));
    setShortlistReadError(savedItemsService.getLoadError(nextUserId, 'shortlist'));
  }, []);

  useEffect(() => {
    // Do not start a saved-items read until Firebase has delivered its initial
    // auth state. A transient null user during restoration is not a sign-out.
    if (isAuthLoading) return;

    if (!userId) {
      reloadListsForUser(null);
      return;
    }

    savedItemsService.startUserSync(userId, () => reloadListsForUser(userId));
    return () => savedItemsService.stopUserSync(userId);
  }, [isAuthLoading, reloadListsForUser, userId]);

  const wishlistHydration = useMemo(
    () =>
      deriveSavedCollection({
        authLoading: isAuthLoading,
        userId,
        loadedUserId,
        savedIds: wishlistIds,
        savedStatus: wishlistReadStatus,
        savedError: wishlistReadError,
        products: publishedProducts,
        productsStatus,
        productsError,
      }),
    [
      isAuthLoading,
      loadedUserId,
      productsError,
      productsStatus,
      publishedProducts,
      userId,
      wishlistIds,
      wishlistReadError,
      wishlistReadStatus,
    ]
  );

  const shortlistHydration = useMemo(
    () =>
      deriveSavedCollection({
        authLoading: isAuthLoading,
        userId,
        loadedUserId,
        savedIds: shortlistIds,
        savedStatus: shortlistReadStatus,
        savedError: shortlistReadError,
        products: publishedProducts,
        productsStatus,
        productsError,
      }),
    [
      isAuthLoading,
      loadedUserId,
      productsError,
      productsStatus,
      publishedProducts,
      shortlistIds,
      shortlistReadError,
      shortlistReadStatus,
      userId,
    ]
  );

  const performAdd = useCallback(
    async (currentUserId: string, action: PendingSaveAction) => {
      const operationKey = `add:${currentUserId}:${action.listType}:${action.productId}`;
      if (operationsInFlight.current.has(operationKey)) return;

      operationsInFlight.current.add(operationKey);
      const copy = getListCopy(action.listType);
      const productName = action.productName || 'Product';

      try {
        const added = await savedItemsService.addProduct(
          currentUserId,
          action.listType,
          action.productId
        );

        reloadListsForUser(currentUserId);
        setPendingSaveAction((current) => (isSameAction(current, action) ? null : current));

        if (added) {
          showToast(copy.savedTitle, `${productName} ${copy.savedDescription}`, 'success');
        } else {
          showToast(`Already in ${copy.label}`, `${productName} was already saved.`, 'info');
        }
      } catch (error) {
        showToast(
          `Could Not Save to ${copy.label}`,
          `${getErrorMessage(error, 'The save could not be confirmed.')} Please try again.`,
          'error'
        );
        // Keep the pending action so the same control can retry without another
        // Google sign-in. It is cleared only after Firestore confirms the write.
      } finally {
        operationsInFlight.current.delete(operationKey);
      }
    },
    [reloadListsForUser, showToast]
  );

  useEffect(() => {
    if (isAuthLoading || !userId || !pendingSaveAction) return;
    void performAdd(userId, pendingSaveAction);
  }, [isAuthLoading, pendingSaveAction, performAdd, userId]);

  const performRemove = useCallback(
    async (
      currentUserId: string,
      listType: SavedListType,
      productId: string,
      productName?: string
    ) => {
      const operationKey = `remove:${currentUserId}:${listType}:${productId}`;
      if (operationsInFlight.current.has(operationKey)) return;

      operationsInFlight.current.add(operationKey);
      const copy = getListCopy(listType);

      try {
        const removed = await savedItemsService.removeProduct(currentUserId, listType, productId);
        reloadListsForUser(currentUserId);
        if (removed) {
          showToast(
            `Removed from ${copy.label}`,
            productName ? `${productName} removed.` : undefined,
            'info'
          );
        }
      } catch (error) {
        showToast(
          `Could Not Update ${copy.label}`,
          `${getErrorMessage(error, 'The removal could not be confirmed.')} Please try again.`,
          'error'
        );
      } finally {
        operationsInFlight.current.delete(operationKey);
      }
    },
    [reloadListsForUser, showToast]
  );

  const performClear = useCallback(
    async (currentUserId: string, listType: SavedListType) => {
      const operationKey = `clear:${currentUserId}:${listType}`;
      if (operationsInFlight.current.has(operationKey)) return;

      operationsInFlight.current.add(operationKey);
      const copy = getListCopy(listType);

      try {
        await savedItemsService.clearList(currentUserId, listType);
        reloadListsForUser(currentUserId);
        showToast(`${copy.label} Cleared`, `All ${copy.label.toLowerCase()} items removed.`, 'info');
      } catch (error) {
        showToast(
          `Could Not Clear ${copy.label}`,
          `${getErrorMessage(error, 'The change could not be confirmed.')} Please try again.`,
          'error'
        );
      } finally {
        operationsInFlight.current.delete(operationKey);
      }
    },
    [reloadListsForUser, showToast]
  );

  const toggleSavedItem = useCallback(
    (
      listType: SavedListType,
      productId: string,
      productName: string | undefined,
      isSaved: boolean
    ) => {
      if (!isAuthenticated || !userId) {
        setPendingSaveAction({ listType, productId, productName });
        openLoginModal();
        return;
      }

      if (isSaved) {
        void performRemove(userId, listType, productId, productName);
      } else {
        const action = { listType, productId, productName };
        setPendingSaveAction(action);
        void performAdd(userId, action);
      }
    },
    [isAuthenticated, openLoginModal, performAdd, performRemove, userId]
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const isInShortlist = useCallback(
    (productId: string) => shortlistIds.includes(productId),
    [shortlistIds]
  );

  const toggleWishlist = useCallback(
    (productId: string, productName?: string) => {
      toggleSavedItem('wishlist', productId, productName, isInWishlist(productId));
    },
    [isInWishlist, toggleSavedItem]
  );

  const toggleShortlist = useCallback(
    (productId: string, productName?: string) => {
      toggleSavedItem('shortlist', productId, productName, isInShortlist(productId));
    },
    [isInShortlist, toggleSavedItem]
  );

  const removeFromWishlist = useCallback(
    (productId: string, productName?: string) => {
      if (userId) void performRemove(userId, 'wishlist', productId, productName);
    },
    [performRemove, userId]
  );

  const removeFromShortlist = useCallback(
    (productId: string, productName?: string) => {
      if (userId) void performRemove(userId, 'shortlist', productId, productName);
    },
    [performRemove, userId]
  );

  const clearWishlist = useCallback(() => {
    if (userId) void performClear(userId, 'wishlist');
  }, [performClear, userId]);

  const clearShortlist = useCallback(() => {
    if (userId) void performClear(userId, 'shortlist');
  }, [performClear, userId]);

  return (
    <SavedItemsContext.Provider
      value={{
        wishlistIds,
        shortlistIds,
        wishlistProducts: wishlistHydration.products,
        shortlistProducts: shortlistHydration.products,
        wishlistStatus: wishlistHydration.status,
        shortlistStatus: shortlistHydration.status,
        wishlistError: wishlistHydration.error,
        shortlistError: shortlistHydration.error,
        missingWishlistProductIds: wishlistHydration.missingProductIds,
        missingShortlistProductIds: shortlistHydration.missingProductIds,
        isInWishlist,
        isInShortlist,
        toggleWishlist,
        toggleShortlist,
        removeFromWishlist,
        removeFromShortlist,
        clearWishlist,
        clearShortlist,
      }}
    >
      {children}
    </SavedItemsContext.Provider>
  );
};

export function useSavedItems(): SavedItemsContextType {
  const context = useContext(SavedItemsContext);
  if (!context) {
    throw new Error('useSavedItems must be used within a SavedItemsProvider');
  }
  return context;
}
