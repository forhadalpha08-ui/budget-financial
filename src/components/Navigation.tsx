import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Receipt,
  Layers,
  Camera,
  Plus,
  Wallet,
  Sparkles,
  DollarSign,
  CreditCard,
  ListOrdered,
} from 'lucide-react';
import { CurrencyConfig, ViewTab } from '../types';
import { SUPPORTED_CURRENCIES } from '../data/defaultData';

interface NavigationProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  currency: CurrencyConfig;
  onSelectCurrency: (c: CurrencyConfig) => void;
  onOpenScanner: () => void;
  onOpenAddModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  currency,
  onSelectCurrency,
  onOpenScanner,
  onOpenAddModal,
}) => {
  const tabs = [
    { id: 'overview' as ViewTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'reports' as ViewTab, label: 'Reports', icon: BarChart3 },
    { id: 'scanner' as ViewTab, label: 'Scan Receipt', icon: Camera, isAccent: true },
    { id: 'transactions' as ViewTab, label: 'Transactions', icon: ListOrdered },
    { id: 'budgets' as ViewTab, label: 'Budgets', icon: Layers },
  ];

  return (
    <>
      {/* Top Desktop & Tablet Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                  Budget & Receipt Tracker
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  <Sparkles className="w-2.5 h-2.5" /> AI Ready
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                Visual Spending Reports & OCR
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              if (tab.id === 'scanner') {
                return (
                  <button
                    key={tab.id}
                    onClick={onOpenScanner}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan</span>
                  </button>
                );
              }
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Currency & Actions */}
          <div className="flex items-center gap-2">
            {/* Currency Selector */}
            <select
              value={currency.code}
              onChange={(e) => {
                const found = SUPPORTED_CURRENCIES.find((c) => c.code === e.target.value);
                if (found) onSelectCurrency(found);
              }}
              aria-label="Currency"
              className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>

            {/* Quick Add Button */}
            <button
              onClick={onOpenAddModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            if (tab.id === 'scanner') {
              return (
                <button
                  key={tab.id}
                  onClick={onOpenScanner}
                  className="flex flex-col items-center justify-center -mt-6 group focus:outline-none"
                  aria-label="Scan Receipt"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-active:scale-95 transition-transform border-2 border-white dark:border-slate-900">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    Scan
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
