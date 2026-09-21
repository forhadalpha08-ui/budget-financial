import { Category, CurrencyConfig, Transaction } from '../types';

export function formatCurrency(
  amount: number,
  currency: CurrencyConfig = { code: 'USD', symbol: '$', name: 'US Dollar' }
): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  
  // Format with commas and 2 decimals
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (currency.symbol === '¥') {
    // JPY usually has no decimals
    const rounded = Math.round(abs).toLocaleString('en-US');
    return `${isNegative ? '-' : ''}${currency.symbol}${rounded}`;
  }

  return `${isNegative ? '-' : ''}${currency.symbol}${formatted}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: 'this-month' | 'last-month' | 'last-90-days' | 'year-to-date' | 'all',
  referenceDate: Date = new Date(2026, 8, 21) // Sep 21, 2026
): Transaction[] {
  if (period === 'all') return transactions;

  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth(); // 0-indexed (8 = Sep)

  return transactions.filter((tx) => {
    if (!tx.date) return false;
    const [y, m, d] = tx.date.split('-').map(Number);
    const txDate = new Date(y, m - 1, d);

    if (period === 'this-month') {
      return y === currentYear && m - 1 === currentMonth;
    }

    if (period === 'last-month') {
      const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      return y === prevMonthYear && m - 1 === prevMonth;
    }

    if (period === 'last-90-days') {
      const diffMs = referenceDate.getTime() - txDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 90;
    }

    if (period === 'year-to-date') {
      return y === currentYear && txDate <= referenceDate;
    }

    return true;
  });
}

export function calculateSummary(
  transactions: Transaction[],
  categories: Category[]
) {
  let totalIncome = 0;
  let totalExpenses = 0;
  const categorySpendingMap: Record<string, number> = {};

  // Initialize map
  categories.forEach((c) => {
    categorySpendingMap[c.id] = 0;
  });

  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
      categorySpendingMap[tx.categoryId] = (categorySpendingMap[tx.categoryId] || 0) + tx.amount;
    }
  });

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Total allocated monthly budget for expense categories
  const totalAllocatedBudget = categories
    .filter((c) => c.type === 'expense')
    .reduce((sum, c) => sum + c.monthlyBudget, 0);

  const budgetUsagePercent = totalAllocatedBudget > 0
    ? (totalExpenses / totalAllocatedBudget) * 100
    : 0;

  return {
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    totalAllocatedBudget,
    budgetUsagePercent,
    categorySpendingMap,
  };
}

export function exportTransactionsToCsv(
  transactions: Transaction[],
  categories: Category[]
): string {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const headers = ['ID', 'Date', 'Merchant', 'Type', 'Category', 'Amount', 'Payment Method', 'Notes', 'Has Receipt'];
  
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    `"${t.merchant.replace(/"/g, '""')}"`,
    t.type,
    `"${(catMap.get(t.categoryId) || 'Uncategorized').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
    t.receiptImage ? 'Yes' : 'No',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function downloadCsv(csvContent: string, fileName = 'budget_transactions.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
