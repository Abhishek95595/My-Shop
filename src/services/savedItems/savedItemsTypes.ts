import { RepositoryStatus } from '../types';

export type SavedListType = 'wishlist' | 'shortlist';

export interface ISavedItemsService {
  startUserSync(userId: string, onUpdate: () => void): void;
  stopUserSync(userId: string): void;
  getSavedProductIds(userId: string, listType: SavedListType): string[];
  getStatus(userId: string, listType: SavedListType): RepositoryStatus;
  getLoadError(userId: string, listType: SavedListType): Error | null;
  addProduct(userId: string, listType: SavedListType, productId: string): Promise<boolean>;
  removeProduct(userId: string, listType: SavedListType, productId: string): Promise<boolean>;
  clearList(userId: string, listType: SavedListType): Promise<void>;
}
