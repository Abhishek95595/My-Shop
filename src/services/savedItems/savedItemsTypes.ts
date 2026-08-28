import { Product } from '../productTypes';

export type SavedListType = 'wishlist' | 'shortlist';

export interface ISavedItemsService {
  getSavedProductIds(userId: string, listType: SavedListType): string[];
  getSavedProducts(userId: string, listType: SavedListType): Product[];
  addProduct(userId: string, listType: SavedListType, productId: string): boolean;
  removeProduct(userId: string, listType: SavedListType, productId: string): boolean;
  clearList(userId: string, listType: SavedListType): void;
  isProductSaved(userId: string, listType: SavedListType, productId: string): boolean;
}
