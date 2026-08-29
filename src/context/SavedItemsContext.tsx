'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/services/productTypes';
import { firestoreSavedItemsService as savedItemsService } from '@/services/savedItems/firestoreSavedItemsService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface SavedItemsContextType {
  wishlistIds: string[];
  shortlistIds: string[];
  wishlistProducts: Product[];
  shortlistProducts: Product[];
  isInWishlist: (productId: string) => boolean;
  isInShortlist: (productId: string) => boolean;
  toggleWishlist: (productId: string, productName?: string) => void;
  toggleShortlist: (productId: string, productName?: string) => void;
  removeFromWishlist: (productId: string, productName?: string) => void;
  removeFromShortlist: (productId: string, productName?: string) => void;
  clearWishlist: () => void;
  clearShortlist: () => void;
}

const SavedItemsContext = createContext<SavedItemsContextType | undefined>(undefined);

export const SavedItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { showToast } = useToast();

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [shortlistIds, setShortlistIds] = useState<string[]>([]);

  // Refresh saved lists whenever user changes or items update
  const reloadLists = useCallback(() => {
    if (user) {
      setWishlistIds(savedItemsService.getSavedProductIds(user.id, 'wishlist'));
      setShortlistIds(savedItemsService.getSavedProductIds(user.id, 'shortlist'));
    } else {
      setWishlistIds([]);
      setShortlistIds([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      savedItemsService.startUserSync(user.id, reloadLists);
    } else {
      reloadLists();
    }
    return () => {
      if (user) {
        savedItemsService.stopUserSync(user.id);
      }
    };
  }, [user, reloadLists]);

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const isInShortlist = useCallback(
    (productId: string) => shortlistIds.includes(productId),
    [shortlistIds]
  );

  // Derive active published products
  const wishlistProducts = React.useMemo(() => {
    if (!user || wishlistIds.length === 0) return [];
    return savedItemsService.getSavedProducts(user.id, 'wishlist');
  }, [user, wishlistIds]);

  const shortlistProducts = React.useMemo(() => {
    if (!user || shortlistIds.length === 0) return [];
    return savedItemsService.getSavedProducts(user.id, 'shortlist');
  }, [user, shortlistIds]);

  const toggleWishlist = useCallback(
    (productId: string, productName?: string) => {
      if (!isAuthenticated || !user) {
        openLoginModal(() => {
          // Callback after login
          const currentUser = savedItemsService;
          // Refresh user context will handle this via reloadLists
          const name = productName || 'Product';
          showToast('Added to Wishlist', `${name} is saved in your Wishlist.`, 'success');
        });
        return;
      }

      if (isInWishlist(productId)) {
        savedItemsService.removeProduct(user.id, 'wishlist', productId);
        reloadLists();
        showToast('Removed from Wishlist', productName ? `${productName} removed.` : undefined, 'info');
      } else {
        const added = savedItemsService.addProduct(user.id, 'wishlist', productId);
        if (added) {
          reloadLists();
          showToast('Saved to Wishlist', productName ? `${productName} saved to your favourites.` : undefined, 'success');
        }
      }
    },
    [isAuthenticated, user, isInWishlist, openLoginModal, reloadLists, showToast]
  );

  const toggleShortlist = useCallback(
    (productId: string, productName?: string) => {
      if (!isAuthenticated || !user) {
        openLoginModal(() => {
          const name = productName || 'Product';
          showToast('Added to Buying Shortlist', `${name} saved for your offline visit.`, 'success');
        });
        return;
      }

      if (isInShortlist(productId)) {
        savedItemsService.removeProduct(user.id, 'shortlist', productId);
        reloadLists();
        showToast('Removed from Shortlist', productName ? `${productName} removed from shortlist.` : undefined, 'info');
      } else {
        const added = savedItemsService.addProduct(user.id, 'shortlist', productId);
        if (added) {
          reloadLists();
          showToast('Added to Buying Shortlist', productName ? `${productName} saved for store consultation.` : undefined, 'success');
        }
      }
    },
    [isAuthenticated, user, isInShortlist, openLoginModal, reloadLists, showToast]
  );

  const removeFromWishlist = useCallback(
    (productId: string, productName?: string) => {
      if (!user) return;
      savedItemsService.removeProduct(user.id, 'wishlist', productId);
      reloadLists();
      showToast('Removed from Wishlist', productName ? `${productName} removed.` : undefined, 'info');
    },
    [user, reloadLists, showToast]
  );

  const removeFromShortlist = useCallback(
    (productId: string, productName?: string) => {
      if (!user) return;
      savedItemsService.removeProduct(user.id, 'shortlist', productId);
      reloadLists();
      showToast('Removed from Shortlist', productName ? `${productName} removed.` : undefined, 'info');
    },
    [user, reloadLists, showToast]
  );

  const clearWishlist = useCallback(() => {
    if (!user) return;
    savedItemsService.clearList(user.id, 'wishlist');
    reloadLists();
    showToast('Wishlist Cleared', 'All saved wishlist items removed.', 'info');
  }, [user, reloadLists, showToast]);

  const clearShortlist = useCallback(() => {
    if (!user) return;
    savedItemsService.clearList(user.id, 'shortlist');
    reloadLists();
    showToast('Shortlist Cleared', 'All saved shortlist items removed.', 'info');
  }, [user, reloadLists, showToast]);

  return (
    <SavedItemsContext.Provider
      value={{
        wishlistIds,
        shortlistIds,
        wishlistProducts,
        shortlistProducts,
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
  const ctx = useContext(SavedItemsContext);
  if (!ctx) {
    throw new Error('useSavedItems must be used within a SavedItemsProvider');
  }
  return ctx;
}
