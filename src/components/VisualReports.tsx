import React, { useState, useMemo } from 'react';
import {
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Store,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Category, CurrencyConfig, TimeFilter, Transaction } from '../types';
import {
  calculateSummary,
  filterTransactionsByPeriod,
  formatCurrency,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface VisualReportsProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyConfig;
  selectedPeriod: TimeFilter;
  onSelectPeriod: (p: TimeFilter) => void;
  onOpenReceipt?: (tx: Transaction) => void;
}

export const VisualReports: React.FC<VisualReportsProps> = ({
  transactions,
  categories,
  currency,
  selectedPeriod,
  onSelectPeriod,
}) => {
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);

  // Filtered transactions based on selected period
  const periodTransactions = useMemo(() => {
    return filterTransactionsByPeriod(transactions, selectedPeriod);
  }, [transactions, selectedPeriod]);

  // Overall calculations for current period
  const summary = useMemo(() => {
    return calculateSummary(periodTransactions, categories);
  }, [periodTransactions, categories]);

  // Category spending data sorted descending
  const categoryData = useMemo(() => {
    const expenseCats = categories.filter((c) => c.type === 'expense');
    return expenseCats
      .map((cat) => {
        const spent = summary.categorySpendingMap[cat.id] || 0;
        const budget = cat.monthlyBudget;
        const percentOfBudget = budget > 0 ? (spent / budget) * 100 : 0;
        const percentOfTotalSpend = summary.totalExpenses > 0 ? (spent / summary.totalExpenses) * 100 : 0;
        return {
          ...cat,
          spent,
          budget,
          percentOfBudget,
          percentOfTotalSpend,
          remaining: budget - spent,
          isOverBudget: spent > budget,
        };
      })
      .filter((c) => c.spent > 0)
      .sort((a, b) => b.spent - a.spent);
  }, [categories, summary]);

  // Multi-month comparison (July, August, September 2026)
  const monthlyCashflow = useMemo(() => {
    const months = [
      { key: '2026-07', label: 'Jul 2026', income: 0, expense: 0 },
      { key: '2026-08', label: 'Aug 2026', income: 0, expense: 0 },
      { key: '2026-09', label: 'Sep 2026', income: 0, expense: 0 },
    ];

    transactions.forEach((tx) => {
      if (!tx.date) return;
      const monthPrefix = tx.date.slice(0, 7);
      const m = months.find((it) => it.key === monthPrefix);
      if (m) {
        if (tx.type === 'income') m.income += tx.amount;
        else m.expense += tx.amount;
      }
    });

    const maxVal = Math.max(
      ...months.map((m) => Math.max(m.income, m.expense)),
      1000
    );

    return { months, maxVal };
  }, [transactions]);

  // Top Merchants
  const topMerchants = useMemo(() => {
    const map: Record<string, { name: string; count: number; total: number; categoryId: string }> = {};
    periodTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const key = t.merchant.trim();
        if (!map[key]) {
          map[key] = { name: key, count: 0, total: 0, categoryId: t.categoryId };
        }
        map[key].count += 1;
        map[key].total += t.amount;
      });

    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [periodTransactions]);

  // SVG Donut Chart Calculation
  const donutSegments = useMemo(() => {
    const total = summary.totalExpenses;
    if (total <= 0) return [];

    let currentAngle = -90; // Start at top
    const radius = 80;
    const strokeWidth = 26;
    const center = 110;
    const circumference = 2 * Math.PI * radius;

    return categoryData.map((cat, idx) => {
      const percentage = (cat.spent / total) * 100;
      const strokeDashoffset = circumference - (percentage / 100) * circumference;
      const rotation = currentAngle;
      currentAngle += (percentage / 100) * 360;

      return {
        ...cat,
        idx,
        percentage,
        strokeDashoffset,
        circumference,
        rotation,
        radius,
        strokeWidth,
        center,
      };
    });
  }, [categoryData, summary.totalExpenses]);

  const activeCategory = activeSegmentIndex !== null ? categoryData[activeSegmentIndex] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Period Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Visual Spending Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time visual analysis of cashflow, category share, and budget pace
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto overflow-x-auto max-w-full">
          {(
            [
              { id: 'this-month', label: 'This Month' },
              { id: 'last-month', label: 'Last Month' },
              { id: 'last-90-days', label: 'Last 90 Days' },
              { id: 'year-to-date', label: 'YTD' },
              { id: 'all', label: 'All Time' },
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPeriod(p.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedPeriod === p.id
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Period Expenses</span>
            <span className="p-1 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600">
              <TrendingDown className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.totalExpenses, currency)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Across {periodTransactions.filter((t) => t.type === 'expense').length} expense transactions
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Period Income</span>
            <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summary.totalIncome, currency)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {periodTransactions.filter((t) => t.type === 'income').length} income deposits
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Net Cash Savings</span>
            <span className={`p-1 rounded-md ${summary.netSavings >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className={`text-2xl font-bold ${summary.netSavings >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
            {formatCurrency(summary.netSavings, currency)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Savings rate: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{summary.savingsRate.toFixed(1)}%</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Budget Utilization</span>
            <span className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
              <Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {summary.budgetUsagePercent.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {formatCurrency(summary.totalAllocatedBudget - summary.totalExpenses, currency)} remaining in budget
          </div>
        </div>
      </div>

      {/* Row 2: Donut Chart & Category Spending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive SVG Donut Chart */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-indigo-600" />
              Category Allocation Share
            </h3>
            <span className="text-xs text-slate-400">Hover for info</span>
          </div>

          <div className="relative w-64 h-64 flex items-center justify-center my-2">
            <svg width="220" height="220" viewBox="0 0 220 220" className="rotate-[-90deg]">
              {/* Background circle track */}
              <circle
                cx="110"
                cy="110"
                r="80"
                fill="none"
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-700/40"
                strokeWidth="26"
              />

              {/* Segments */}
              {donutSegments.map((seg) => {
                const isHovered = activeSegmentIndex === seg.idx;
                return (
                  <circle
                    key={seg.id}
                    cx="110"
                    cy="110"
                    r="80"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={isHovered ? 32 : 26}
                    strokeDasharray={seg.circumference}
                    strokeDashoffset={seg.strokeDashoffset}
                    transform={`rotate(${seg.rotation} 110 110)`}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setActiveSegmentIndex(seg.idx)}
                    onMouseLeave={() => setActiveSegmentIndex(null)}
                    opacity={activeSegmentIndex === null || isHovered ? 1 : 0.45}
                  />
                );
              })}
            </svg>

            {/* Centered Total / Active Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              {activeCategory ? (
                <div className="animate-in fade-in zoom-in-95 duration-150">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${activeCategory.color}20`,
                      color: activeCategory.color,
                    }}
                  >
                    {activeCategory.name}
                  </span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    {formatCurrency(activeCategory.spent, currency)}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {activeCategory.percentOfTotalSpend.toFixed(1)}% of spend
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-xs text-slate-400 font-medium">Total Spent</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(summary.totalExpenses, currency)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {categoryData.length} categories
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Compact Legend */}
          <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            {categoryData.slice(0, 6).map((cat, idx) => (
              <div
                key={cat.id}
                onMouseEnter={() => setActiveSegmentIndex(idx)}
                onMouseLeave={() => setActiveSegmentIndex(null)}
                className={`p-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                  activeSegmentIndex === idx ? 'bg-slate-100 dark:bg-slate-700/60' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="truncate text-slate-700 dark:text-slate-300">{cat.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white ml-1 shrink-0">
                  {cat.percentOfTotalSpend.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Category Breakdown Bars */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Category Budget Performance & Variance
            </h3>
            <span className="text-xs text-slate-400">Spent vs Target</span>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[380px] pr-1">
            {categoryData.map((cat) => {
              const isOver = cat.spent > cat.budget;
              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
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

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(cat.spent, currency)}
                      </span>
                      <span className="text-slate-400">
                        / {formatCurrency(cat.budget, currency)}
                      </span>
                      {isOver ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                          +{(cat.spent - cat.budget).toFixed(0)} over
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                          {(cat.budget - cat.spent).toFixed(0)} left
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-rose-500'
                          : cat.percentOfBudget > 85
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(cat.percentOfBudget, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Monthly Cashflow Trend & Top Merchants */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Cashflow Comparison Bars */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Monthly Cash Flow Comparison (Jul – Sep 2026)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Compare earned income vs living expenses month over month
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span className="text-slate-600 dark:text-slate-400">Expenses</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-4 items-end min-h-[220px]">
            {monthlyCashflow.months.map((m) => {
              const incomeHeight = Math.max(8, (m.income / monthlyCashflow.maxVal) * 160);
              const expenseHeight = Math.max(8, (m.expense / monthlyCashflow.maxVal) * 160);
              const net = m.income - m.expense;

              return (
                <div key={m.key} className="flex flex-col items-center">
                  <div className="flex items-end gap-2 h-44 w-full justify-center">
                    {/* Income Bar */}
                    <div className="flex flex-col items-center gap-1 group relative">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 whitespace-nowrap bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow-xs border border-slate-200 dark:border-slate-800">
                        {formatCurrency(m.income, currency)}
                      </span>
                      <div
                        className="w-7 sm:w-10 bg-emerald-500 rounded-t-lg transition-all hover:bg-emerald-600 shadow-xs"
                        style={{ height: `${incomeHeight}px` }}
                      />
                    </div>

                    {/* Expense Bar */}
                    <div className="flex flex-col items-center gap-1 group relative">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 whitespace-nowrap bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow-xs border border-slate-200 dark:border-slate-800">
                        {formatCurrency(m.expense, currency)}
                      </span>
                      <div
                        className="w-7 sm:w-10 bg-rose-500 rounded-t-lg transition-all hover:bg-rose-600 shadow-xs"
                        style={{ height: `${expenseHeight}px` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-center border-t border-slate-100 dark:border-slate-700/60 pt-2 w-full">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {m.label}
                    </span>
                    <span className={`text-[11px] font-semibold ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {net >= 0 ? '+' : ''}{formatCurrency(net, currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Merchants Leaderboard */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-600" />
                Top Merchants & Providers
              </h3>
              <span className="text-xs text-slate-400">By total spend</span>
            </div>

            <div className="space-y-3">
              {topMerchants.map((merchant, idx) => {
                const cat = categories.find((c) => c.id === merchant.categoryId);
                return (
                  <div
                    key={merchant.name}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                          {merchant.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {merchant.count} {merchant.count === 1 ? 'transaction' : 'transactions'} • {cat?.name || 'General'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {formatCurrency(merchant.total, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        avg {formatCurrency(merchant.total / merchant.count, currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Tracking {periodTransactions.filter((t) => t.type === 'expense').length} purchases</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              Receipt OCR active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
