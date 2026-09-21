/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Category, CurrencyConfig, TimeFilter, Transaction, ViewTab } from './types';
import { DEFAULT_CATEGORIES, INITIAL_TRANSACTIONS, SUPPORTED_CURRENCIES } from './data/defaultData';
import { Navigation } from './components/Navigation';
import { DashboardOverview } from './components/DashboardOverview';
import { VisualReports } from './components/VisualReports';
import { TransactionsList } from './components/TransactionsList';
import { BudgetsManager } from './components/BudgetsManager';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { TransactionModal } from './components/TransactionModal';
import { ReceiptViewerModal } from './components/ReceiptViewerModal';

const STORAGE_KEYS = {
  TRANSACTIONS: 'budget_tracker_transactions_v1',
  CATEGORIES: 'budget_tracker_categories_v1',
  CURRENCY: 'budget_tracker_currency_v1',
  PERIOD: 'budget_tracker_period_v1',
};

export default function App() {
  // State with localStorage initialization
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [currency, setCurrency] = useState<CurrencyConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      return saved ? JSON.parse(saved) : SUPPORTED_CURRENCIES[0];
    } catch {
      return SUPPORTED_CURRENCIES[0];
    }
  });

  const [currentTab, setCurrentTab] = useState<ViewTab>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<TimeFilter>('this-month');

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [viewingReceiptTransaction, setViewingReceiptTransaction] = useState<Transaction | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.warn('Failed to save transactions to localStorage', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn('Failed to save categories to localStorage', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(currency));
    } catch (e) {
      console.warn('Failed to save currency to localStorage', e);
    }
  }, [currency]);

  // Handlers
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...txData } : t))
      );
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateCategoryBudget = (categoryId: string, newBudget: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, monthlyBudget: newBudget } : c))
    );
  };

  const handleAddCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-custom-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleResetToDefaultData = () => {
    if (window.confirm('Reset transactions and categories to default sample data?')) {
      setTransactions(INITIAL_TRANSACTIONS);
      setCategories(DEFAULT_CATEGORIES);
    }
  };

  // Find category for viewing receipt
  const receiptCategory = viewingReceiptTransaction
    ? categories.find((c) => c.id === viewingReceiptTransaction.categoryId)
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currency={currency}
        onSelectCurrency={setCurrency}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {currentTab === 'overview' && (
          <DashboardOverview
            transactions={transactions}
            categories={categories}
            currency={currency}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenAddTransaction={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            onViewAllTransactions={() => setCurrentTab('transactions')}
            onViewReports={() => setCurrentTab('reports')}
            onViewReceipt={(tx) => setViewingReceiptTransaction(tx)}
          />
        )}

        {currentTab === 'reports' && (
          <VisualReports
            transactions={transactions}
            categories={categories}
            currency={currency}
            selectedPeriod={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
            onOpenReceipt={(tx) => setViewingReceiptTransaction(tx)}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionsList
            transactions={transactions}
            categories={categories}
            currency={currency}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            onOpenScanner={() => setIsScannerOpen(true)}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsAddModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onViewReceipt={(tx) => setViewingReceiptTransaction(tx)}
          />
        )}

        {currentTab === 'budgets' && (
          <BudgetsManager
            categories={categories}
            currency={currency}
            onUpdateCategoryBudget={handleUpdateCategoryBudget}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {currentTab === 'scanner' && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto py-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Receipt Digitization Station
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload images or snapshot paper receipts directly using Gemini AI OCR
              </p>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all"
              >
                Launch Receipt Scanner Window
              </button>
            </div>

            {/* Quick list of previously scanned receipts */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Scanned Receipts Archive ({transactions.filter((t) => t.receiptImage).length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {transactions
                  .filter((t) => t.receiptImage)
                  .map((tx) => {
                    const cat = categories.find((c) => c.id === tx.categoryId);
                    return (
                      <div
                        key={tx.id}
                        onClick={() => setViewingReceiptTransaction(tx)}
                        className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs cursor-pointer hover:border-indigo-500 transition-all flex flex-col group"
                      >
                        <div className="h-36 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden mb-2.5 flex items-center justify-center p-2">
                          <img
                            src={tx.receiptImage}
                            alt={tx.merchant}
                            className="max-h-full object-contain rounded group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                              {tx.merchant}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {tx.date} • {cat?.name}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {currency.symbol}{tx.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        categories={categories}
        currency={currency}
        onSaveTransaction={(tx) => {
          handleSaveTransaction(tx);
          setCurrentTab('overview');
        }}
      />

      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        categories={categories}
        currency={currency}
        initialTransaction={editingTransaction}
        onSave={handleSaveTransaction}
      />

      <ReceiptViewerModal
        transaction={viewingReceiptTransaction}
        currency={currency}
        categoryName={receiptCategory?.name}
        categoryColor={receiptCategory?.color}
        onClose={() => setViewingReceiptTransaction(null)}
      />

      {/* Footer / Reset link */}
      <footer className="py-4 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center gap-4">
          <span>Budget & Receipt Tracker</span>
          <span>•</span>
          <button
            onClick={handleResetToDefaultData}
            className="hover:text-slate-600 dark:hover:text-slate-300 underline"
          >
            Reset to Sample Data
          </button>
        </div>
      </footer>
    </div>
  );
}
