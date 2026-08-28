// Minimal Phase 1 Mock Adapter Foundation
import { IServiceAdapter } from './types';

export const mockAdapter: IServiceAdapter = {
  isReady() {
    return true;
  },
};
