import React from 'react';
import { X, Calendar, DollarSign, Store, CreditCard, Tag, ExternalLink } from 'lucide-react';
import { CurrencyConfig, Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ReceiptViewerModalProps {
  transaction: Transaction | null;
  currency: CurrencyConfig;
  categoryName?: string;
  categoryColor?: string;
  onClose: () => void;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  transaction,
  currency,
  categoryName,
  categoryColor,
  onClose,
}) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {transaction.merchant}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receipt Details & Scanned Items
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Receipt Image Preview */}
          <div className="flex flex-col">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Original Receipt Image
            </h4>
            <div className="flex-1 min-h-[300px] max-h-[460px] bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center overflow-auto shadow-inner">
              {transaction.receiptImage ? (
                <img
                  src={transaction.receiptImage}
                  alt={`Receipt for ${transaction.merchant}`}
                  className="max-w-full max-h-full object-contain rounded shadow-sm"
                />
              ) : (
                <div className="text-center p-6 text-slate-400 text-sm">
                  No image attached for this transaction
                </div>
              )}
            </div>
            {transaction.receiptImage && (
              <div className="mt-2 flex justify-end">
                <a
                  href={transaction.receiptImage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Full Image
                </a>
              </div>
            )}
          </div>

          {/* Right: Parsed Financial Information & Line Items */}
          <div className="flex flex-col space-y-4">
            {/* Metadata Card */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Date
                </span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {formatDate(transaction.date)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Category
                </span>
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${categoryColor || '#6366f1'}18`,
                    color: categoryColor || '#6366f1',
                  }}
                >
                  {categoryName || 'General'}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Payment Method
                </span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {transaction.paymentMethod || 'Card'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Total Paid
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(transaction.amount, currency)}
                </span>
              </div>
            </div>

            {/* Line items if available */}
            <div className="flex-1 flex flex-col">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Itemized Breakdown ({transaction.receiptItems?.length || 0} items)
              </h4>

              <div className="flex-1 max-h-[220px] overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {transaction.receiptItems && transaction.receiptItems.length > 0 ? (
                  transaction.receiptItems.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                          {item.quantity}x
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(item.price, currency)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No itemized lines recorded for this transaction.
                  </div>
                )}
              </div>

              {/* Subtotal, Tax breakdown */}
              {(transaction.subtotal || transaction.tax) && (
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  {transaction.subtotal && (
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(transaction.subtotal, currency)}</span>
                    </div>
                  )}
                  {transaction.tax && (
                    <div className="flex justify-between">
                      <span>Sales Tax</span>
                      <span>{formatCurrency(transaction.tax, currency)}</span>
                    </div>
                  )}
                </div>
              )}

              {transaction.notes && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-semibold">Note: </span>
                  {transaction.notes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
