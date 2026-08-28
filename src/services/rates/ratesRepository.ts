import { RateItem, CreateRateInput } from './ratesTypes';

const RATES_STORAGE_KEY = 'koh_owner_rates';

class MockRatesRepository {
  public getAllRates(): RateItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(RATES_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as RateItem[]) : [];
    } catch {
      return [];
    }
  }

  public getActiveRates(): RateItem[] {
    return this.getAllRates().filter((r) => r.isActive && r.rate > 0);
  }

  private saveRates(rates: RateItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(rates));
      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new Event('koh_rates_updated'));
      }
    } catch (err) {
      console.warn('Failed saving rates to localStorage:', err);
    }
  }

  public addRate(input: CreateRateInput): RateItem {
    const trimmedLabel = input.label.trim();
    if (!trimmedLabel) throw new Error('Rate label is required.');
    if (typeof input.rate !== 'number' || input.rate <= 0) {
      throw new Error('Numeric rate must be greater than zero.');
    }

    const newRate: RateItem = {
      ...input,
      id: `rate-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      label: trimmedLabel,
      material: input.material.trim() || '22K Gold',
      unit: input.unit.trim() || 'per gram',
      lastUpdated: new Date().toISOString(),
    };

    const current = this.getAllRates();
    this.saveRates([...current, newRate]);
    return newRate;
  }

  public updateRate(id: string, updates: Partial<CreateRateInput>): RateItem | null {
    const current = this.getAllRates();
    const target = current.find((r) => r.id === id);
    if (!target) return null;

    const updated: RateItem = {
      ...target,
      ...updates,
      id: target.id,
      lastUpdated: new Date().toISOString(),
    };

    const next = current.map((r) => (r.id === id ? updated : r));
    this.saveRates(next);
    return updated;
  }

  public deleteRate(id: string): void {
    const current = this.getAllRates();
    const next = current.filter((r) => r.id !== id);
    this.saveRates(next);
  }

  public toggleActive(id: string): RateItem | null {
    const current = this.getAllRates();
    const target = current.find((r) => r.id === id);
    if (!target) return null;
    return this.updateRate(id, { isActive: !target.isActive });
  }
}

export const ratesRepository = new MockRatesRepository();
