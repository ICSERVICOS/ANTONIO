
export interface DividendPayment {
  date: string;
  amount: number;
  type: string;
}

export interface StockData {
  ticker: string;
  name: string;
  currency: string;
  currentPrice: number;
  eps: number; // Earnings Per Share
  bvps: number; // Book Value Per Share
  dividendYield: number;
  avgDividend5Years: number;
  lastUpdated: string;
  region: 'Brazil' | 'Europe';
  nextDividendDate?: string;
  payoutFrequency?: string;
  dividendHistory?: DividendPayment[];
}

export interface CalculationResult {
  bazinFairPrice: number;
  grahamFairPrice: number;
  upsideBazin: number;
  upsideGraham: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}
