export interface RateItem {
  id: string;
  label: string; // e.g. "22K Gold (916 Standard)", "24K Fine Gold"
  material: string; // e.g. "22K Gold", "24K Gold", "Silver"
  rate: number; // e.g. 7250
  unit: string; // e.g. "per gram", "per 10 grams", "per kilogram"
  isActive: boolean;
  lastUpdated: string;
}

export type CreateRateInput = Omit<RateItem, 'id' | 'lastUpdated'>;
