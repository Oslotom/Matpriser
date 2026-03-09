import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../utils/cn';
import { ExtractionResult, StoreTotal } from '../types';
import { GROCERY_CHAINS } from '../constants';
import { getStoreLogo, normalizeStoreName } from '../utils/helpers';

interface PriceVisualizationProps {
  result: ExtractionResult;
}

export const PriceVisualization: React.FC<PriceVisualizationProps> = ({ result }) => {
  const normalizedReceiptStore = normalizeStoreName(result.store.store_name);
  const chains = GROCERY_CHAINS.filter(c => c !== normalizedReceiptStore);
  
  const totals: StoreTotal[] = chains.map(chain => {
    const total = result.items.reduce((sum, item) => sum + (item.comparisons?.[chain] || 0), 0);
    const missingCount = result.items.filter(item => item.comparisons?.[chain] === null).length;
    return { chain, total, missingCount, isReceipt: false };
  });
  
  const receiptTotal = result.items.reduce((sum, item) => sum + item.price_total, 0);
  const allTotals: StoreTotal[] = [...totals, { chain: normalizedReceiptStore, total: receiptTotal, missingCount: 0, isReceipt: true }];
  
  const maxTotal = Math.max(...allTotals.map(t => t.total));
  const minTotal = Math.min(...allTotals.filter(t => t.total > 0).map(t => t.total));

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-end justify-between gap-3 h-56 mb-6 px-2">
        {allTotals
          .sort((a, b) => (a.total || Infinity) - (b.total || Infinity))
          .map((t, i) => {
            const heightPercentage = (t.total / maxTotal) * 100;
            const isMin = t.total === minTotal && t.total > 0;
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <span className={cn(
                    "text-[11px] font-bold whitespace-nowrap",
                    isMin ? "text-emerald-600" : "text-slate-400"
                  )}>
                    {t.total > 0 ? `${t.total.toFixed(0)} kr` : "N/A"}
                  </span>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercentage}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={cn(
                      "w-full max-w-[40px] rounded-t-xl shadow-sm",
                      isMin ? "bg-emerald-500" : t.isReceipt ? "bg-emerald-400/40" : "bg-slate-100"
                    )}
                  />
                </div>
                <div className="flex flex-col items-center">
                  {getStoreLogo(t.chain) && (
                    <img 
                      src={getStoreLogo(t.chain)!} 
                      alt={t.chain} 
                      title={t.chain}
                      className="w-8 h-8 rounded-md shadow-md border border-white" 
                      referrerPolicy="no-referrer" 
                    />
                  )}
                </div>
              </div>
            );
          })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center border-t border-slate-50 pt-4">
        {allTotals.filter(t => t.missingCount > 0).map((t, i) => (
          <p key={i} className="text-[9px] text-slate-400 italic">
            <span className="font-bold">{t.chain}:</span> Mangler {t.missingCount} priser
          </p>
        ))}
      </div>
    </div>
  );
};
