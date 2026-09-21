export type TransactionType = 'expense' | 'income';

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  merchant: string;
  amount: number;
  categoryId: string;
  type: TransactionType;
  paymentMethod: string;
  notes?: string;
  receiptImage?: string; // base64 or sample URI
  receiptItems?: ReceiptItem[];
  subtotal?: number;
  tax?: number;
  tip?: number;
  isScanned?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  monthlyBudget: number;
  type: TransactionType;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

export interface BudgetGoal {
  monthlyIncomeGoal: number;
  monthlySavingsTarget: number;
}

export interface ScanResult {
  merchant: string;
  date: string;
  total: number;
  subtotal?: number;
  tax?: number;
  tip?: number;
  category: string;
  paymentMethod: string;
  items: ReceiptItem[];
  confidence: number;
  notes?: string;
  isSimulated?: boolean;
}

export type ViewTab = 'overview' | 'reports' | 'transactions' | 'budgets' | 'scanner';
export type TimeFilter = 'this-month' | 'last-month' | 'last-90-days' | 'year-to-date' | 'all';
