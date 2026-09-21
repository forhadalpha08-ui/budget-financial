import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Receipt,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  ArrowUpDown,
  Tag,
  CreditCard,
  Camera,
} from 'lucide-react';
import { Category, CurrencyConfig, Transaction, TransactionType } from '../types';
import {
  downloadCsv,
  exportTransactionsToCsv,
  formatCurrency,
  formatDate,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface TransactionsListProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyConfig;
  onOpenAddModal: () => void;
  onOpenScanner: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onViewReceipt: (tx: Transaction) => void;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  categories,
  currency,
  onOpenAddModal,
  onOpenScanner,
  onEditTransaction,
  onDeleteTransaction,
  onViewReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [onlyWithReceipts, setOnlyWithReceipts] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Category map for quick lookup
  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search filter
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchMerchant = tx.merchant.toLowerCase().includes(query);
          const matchNotes = tx.notes?.toLowerCase().includes(query);
          const matchCategory = categoryMap.get(tx.categoryId)?.name.toLowerCase().includes(query);
          if (!matchMerchant && !matchNotes && !matchCategory) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) {
          return false;
        }

        // Type filter
        if (selectedType !== 'all' && tx.type !== selectedType) {
          return false;
        }

        // Receipt attached filter
        if (onlyWithReceipts && !tx.receiptImage) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, searchTerm, selectedCategory, selectedType, onlyWithReceipts, sortBy, categoryMap]);

  // Handle Export CSV
  const handleExport = () => {
    const csv = exportTransactionsToCsv(filteredTransactions, categories);
    downloadCsv(csv, `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Transactions & History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Showing {filteredTransactions.length} of {transactions.length} records
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
          </button>
          <button
            onClick={onOpenScanner}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors shadow-xs"
          >
            <Camera className="w-3.5 h-3.5" /> Scan Receipt
          </button>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search merchant, tag, note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="date-desc">Date (Newest first)</option>
              <option value="date-asc">Date (Oldest first)</option>
              <option value="amount-desc">Amount (Highest first)</option>
              <option value="amount-asc">Amount (Lowest first)</option>
            </select>
          </div>
        </div>

        {/* Checkbox Quick Toggles */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyWithReceipts}
              onChange={(e) => setOnlyWithReceipts(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-indigo-600" /> Only with attached receipt
            </span>
          </label>

          {(searchTerm || selectedCategory !== 'all' || selectedType !== 'all' || onlyWithReceipts) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedType('all');
                setOnlyWithReceipts(false);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table / List View */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map((tx) => {
              const cat = categoryMap.get(tx.categoryId);
              const isExpense = tx.type === 'expense';
              return (
                <div
                  key={tx.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Left: Category Icon, Merchant, Date, Tags */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: cat?.color || '#64748b' }}
                    >
                      <CategoryIcon name={cat?.icon || 'Tag'} className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {tx.merchant}
                        </span>
                        {tx.receiptImage && (
                          <button
                            onClick={() => onViewReceipt(tx)}
                            className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 flex items-center gap-1"
                          >
                            <Receipt className="w-3 h-3" />
                            Receipt Attached
                          </button>
                        )}
                        {tx.isScanned && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300">
                            AI Scanned
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span
                          className="font-medium"
                          style={{ color: cat?.color || '#64748b' }}
                        >
                          {cat?.name || 'General'}
                        </span>
                        {tx.paymentMethod && (
                          <>
                            <span>•</span>
                            <span>{tx.paymentMethod}</span>
                          </>
                        )}
                        {tx.notes && (
                          <>
                            <span>•</span>
                            <span className="italic truncate max-w-[180px]">{tx.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                    <span
                      className={`text-base font-bold ${
                        isExpense ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No transactions match your search
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try adjusting your search keywords, clearing filters, or scan a new receipt.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
