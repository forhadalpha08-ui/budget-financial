import React, { useState } from 'react';
import {
  Layers,
  Plus,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Trash2,
  Edit2,
  Save,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { Category, CurrencyConfig } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface BudgetsManagerProps {
  categories: Category[];
  currency: CurrencyConfig;
  onUpdateCategoryBudget: (categoryId: string, newBudget: number) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
}

export const BudgetsManager: React.FC<BudgetsManagerProps> = ({
  categories,
  currency,
  onUpdateCategoryBudget,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatBudget, setNewCatBudget] = useState<string>('200');
  const [newCatColor, setNewCatColor] = useState<string>('#6366f1');
  const [newCatIcon, setNewCatIcon] = useState<string>('Tag');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');

  // Calculate total monthly budgets
  const totalExpenseBudget = categories
    .filter((c) => c.type === 'expense')
    .reduce((sum, c) => sum + (c.monthlyBudget || 0), 0);

  const totalIncomeBudget = categories
    .filter((c) => c.type === 'income')
    .reduce((sum, c) => sum + (c.monthlyBudget || 0), 0);

  const projectedSavings = totalIncomeBudget - totalExpenseBudget;
  const projectedSavingsRate = totalIncomeBudget > 0 ? (projectedSavings / totalIncomeBudget) * 100 : 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    onAddCategory({
      name: newCatName.trim(),
      monthlyBudget: parseFloat(newCatBudget) || 0,
      color: newCatColor,
      icon: newCatIcon,
      type: newCatType,
    });

    setNewCatName('');
    setNewCatBudget('200');
    setIsAddingCategory(false);
  };

  const colorPresets = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6', '#f43f5e', '#64748b'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Budget & Category Limits
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure target spending caps for each life category to safeguard savings
          </p>
        </div>

        <button
          onClick={() => setIsAddingCategory(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {/* Target Planning Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            Total Monthly Expense Budget
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalExpenseBudget, currency)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {categories.filter((c) => c.type === 'expense').length} expense categories
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            Expected Monthly Income
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalIncomeBudget, currency)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Base salaries & freelance target
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            Projected Monthly Savings
          </span>
          <div className={`text-2xl font-bold ${projectedSavings >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
            {formatCurrency(projectedSavings, currency)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Target savings rate: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{projectedSavingsRate.toFixed(1)}%</span>
          </span>
        </div>
      </div>

      {/* Add Category Drawer / Form */}
      {isAddingCategory && (
        <form
          onSubmit={handleAddSubmit}
          className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-indigo-200 dark:border-indigo-800 shadow-md space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" /> Add Custom Category
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingCategory(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Subscriptions, Pets"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Target Budget *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-400">{currency.symbol}</span>
                <input
                  type="number"
                  step="10"
                  required
                  value={newCatBudget}
                  onChange={(e) => setNewCatBudget(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <select
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="expense">Expense (-)</option>
                <option value="income">Income (+)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Accent Color
              </label>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {colorPresets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCatColor(c)}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      newCatColor === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-1' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Create Category
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          return (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {cat.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {cat.type} Category
                    </span>
                  </div>
                </div>

                {cat.id.startsWith('cat-custom') && (
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Budget amount editor */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Monthly Limit:
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative w-32">
                    <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">
                      {currency.symbol}
                    </span>
                    <input
                      type="number"
                      step="10"
                      value={cat.monthlyBudget}
                      onChange={(e) =>
                        onUpdateCategoryBudget(cat.id, Number(e.target.value) || 0)
                      }
                      className="w-full pl-6 pr-2 py-1 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-right focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
