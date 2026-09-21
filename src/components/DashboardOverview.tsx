import React from 'react';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Sparkles,
  Camera,
  Plus,
  ArrowRight,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Category, CurrencyConfig, Transaction } from '../types';
import { calculateSummary, formatCurrency, formatDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface DashboardOverviewProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyConfig;
  onOpenScanner: () => void;
  onOpenAddTransaction: () => void;
  onViewAllTransactions: () => void;
  onViewReports: () => void;
  onViewReceipt: (tx: Transaction) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  transactions,
  categories,
  currency,
  onOpenScanner,
  onOpenAddTransaction,
  onViewAllTransactions,
  onViewReports,
  onViewReceipt,
}) => {
  // Compute for current month (September 2026)
  const currentMonthTransactions = transactions.filter((t) => t.date?.startsWith('2026-09'));
  const summary = calculateSummary(currentMonthTransactions, categories);

  const expenseCategories = categories
    .filter((c) => c.type === 'expense')
    .map((c) => {
      const spent = summary.categorySpendingMap[c.id] || 0;
      const budget = c.monthlyBudget;
      const pct = budget > 0 ? (spent / budget) * 100 : 0;
      return { ...c, spent, budget, pct, remaining: budget - spent };
    })
    .sort((a, b) => b.pct - a.pct);

  const recentTransactions = [...currentMonthTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Month day pace (Sep 21 of 30 days = 70% of month passed)
  const daysInMonth = 30;
  const currentDay = 21;
  const monthProgressPct = (currentDay / daysInMonth) * 100;
  const isSpendingPaceSafe = summary.budgetUsagePercent <= monthProgressPct + 5;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            September 2026 Budget
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Day {currentDay} of {daysInMonth} • {isSpendingPaceSafe ? 'Pacing safely within monthly plan' : 'Approaching spending limits'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenScanner}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" />
            Scan Receipt
          </button>
          <button
            onClick={onOpenAddTransaction}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spent */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Month Spending</span>
            <span className="p-1 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600">
              <TrendingDown className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.totalExpenses, currency)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              Budget: {formatCurrency(summary.totalAllocatedBudget, currency)}
            </span>
            <span className={`font-semibold ${summary.budgetUsagePercent > 100 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
              {summary.budgetUsagePercent.toFixed(1)}% used
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-1.5 h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                summary.budgetUsagePercent > 100 ? 'bg-rose-500' : summary.budgetUsagePercent > 85 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(summary.budgetUsagePercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Remaining Budget</span>
            <span className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
              <Wallet className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.totalAllocatedBudget - summary.totalExpenses, currency)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>9 days left in September cycle</span>
          </div>
        </div>

        {/* Total Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Total Income</span>
            <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summary.totalIncome, currency)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Salary + Side gigs deposited
          </div>
        </div>

        {/* Net Savings & Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Net Monthly Savings</span>
            <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <PiggyBank className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.netSavings, currency)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Savings rate: <span className="font-bold text-emerald-600 dark:text-emerald-400">{summary.savingsRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* AI Receipt Scanning Callout Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-blue-950/30 border border-indigo-100 dark:border-indigo-900/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-xs">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Instant Receipt Digitization
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Snap a paper receipt or upload an invoice photo. Gemini parses store names, prices, items, and tax automatically.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenScanner}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs whitespace-nowrap self-stretch sm:self-auto flex items-center justify-center gap-1.5 transition-colors"
        >
          <Camera className="w-3.5 h-3.5" /> Try Scanning Now
        </button>
      </div>

      {/* Two Column Layout: Category Health & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Budget Progress */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Category Budget Status
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly limits and remaining balances
              </p>
            </div>
            <button
              onClick={onViewReports}
              className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-1"
            >
              Visual Reports <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {expenseCategories.map((cat) => {
              const isOver = cat.spent > cat.budget;
              return (
                <div
                  key={cat.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {cat.name}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(cat.spent, currency)}
                      </span>
                      <span className="text-slate-400 ml-1">
                        / {formatCurrency(cat.budget, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isOver
                          ? 'bg-rose-500'
                          : cat.pct > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(cat.pct, 100)}%` }}
                    />
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      {cat.pct.toFixed(0)}% of limit
                    </span>
                    {isOver ? (
                      <span className="font-semibold text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {formatCurrency(cat.spent - cat.budget, currency)} over
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">
                        {formatCurrency(cat.remaining, currency)} remaining
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions with Receipt Badges */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recent Transactions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Attached receipts & category tracking
                </p>
              </div>
              <button
                onClick={onViewAllTransactions}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-1"
              >
                View all ({transactions.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentTransactions.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                const isExpense = tx.type === 'expense';
                return (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: cat?.color || '#64748b' }}
                      >
                        <CategoryIcon name={cat?.icon || 'Tag'} className="w-4 h-4" />
                      </div>
                      <div className="truncate max-w-[150px] sm:max-w-[200px]">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block">
                          {tx.merchant}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span>{formatDate(tx.date)}</span>
                          <span>•</span>
                          <span className="truncate">{cat?.name || 'General'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {tx.receiptImage && (
                        <button
                          onClick={() => onViewReceipt(tx)}
                          className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 flex items-center gap-1"
                          title="View attached scanned receipt"
                        >
                          <Receipt className="w-3 h-3" />
                          Receipt
                        </button>
                      )}

                      <span
                        className={`text-xs font-bold ${
                          isExpense ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isExpense ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={onOpenAddTransaction}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Quick Add Transaction
            </button>
            <span className="text-[11px] text-slate-400">
              {currentMonthTransactions.length} in September
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
