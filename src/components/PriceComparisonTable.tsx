import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../utils/cn';
import { ReceiptItem, ExtractionResult } from '../types';
import { GROCERY_CHAINS } from '../constants';
import { getStoreLogo, normalizeStoreName } from '../utils/receiptUtils';

interface ResultTableProps {
  result: ExtractionResult;
  expandedIdx: number | null;
  setExpandedIdx: (idx: number | null) => void;
}

/**
 * PriceComparisonTable - Displays the list of items from the receipt and their price comparisons
 * Includes expandable rows for detailed store-by-store price breakdowns.
 */
export const PriceComparisonTable: React.FC<ResultTableProps> = ({ result, expandedIdx, setExpandedIdx }) => {
  const [showAll, setShowAll] = useState(false);
  const rawStoreName = result.store?.store_name || result.store?.store_chain || 'Ukjent';
  const normalizedReceiptStore = normalizeStoreName(rawStoreName);

  // --- Summary Calculations ---
  const totalPaid = result.items.reduce((sum, item) => sum + item.price_total, 0);
  const totalCheapest = result.items.reduce((sum, item) => {
    const comparisonPrices = GROCERY_CHAINS
      .filter(store => store !== normalizedReceiptStore)
      .map(store => item.comparisons?.[store])
      .filter(val => val !== null && val !== undefined) as number[];
    
    const allPrices = [item.price_total, ...comparisonPrices];
    return sum + Math.min(...allPrices);
  }, 0);
  const totalDiff = totalPaid - totalCheapest;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto scrollbar-none">
        <table className="w-full text-left border-collapse min-w-[400px] table-fixed">
          {/* Table Header */}
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="py-4 px-4 font-display font-medium text-[12px] text-slate-400 uppercase tracking-wider w-[140px]">Vare</th>
              <th className="py-4 px-1 font-display font-medium text-[12px] text-slate-400 uppercase tracking-wider text-center w-[60px]">
                <div className="flex flex-col items-center justify-center">
                  {getStoreLogo(rawStoreName) ? (
                    <img src={getStoreLogo(rawStoreName)!} alt={normalizedReceiptStore} title={normalizedReceiptStore} className="w-6 h-6 rounded-md shadow-sm" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="truncate w-full px-1 text-[10px]">{normalizedReceiptStore}</span>
                  )}
                </div>
              </th>
              <th className="py-4 px-1 font-display font-medium text-[12px] text-slate-400 uppercase tracking-wider text-center w-[50px]">Diff</th>
              <th className="py-4 px-1 font-display font-medium text-[12px] text-slate-400 uppercase tracking-wider text-center w-[80px]">Billigst</th>
            </tr>
          </thead>

          {/* Table Body: List of Items */}
          <tbody className="divide-y divide-slate-50">
            {(showAll ? result.items : result.items.slice(0, 7)).map((item, idx) => {
              // Calculate comparisons for this specific item
              const comparisonPrices = GROCERY_CHAINS
                .filter(store => store !== normalizedReceiptStore)
                .map(store => ({ name: store, val: item.comparisons?.[store] }))
                .filter(p => p.val !== null && p.val !== undefined) as { name: string, val: number }[];

              const allPrices = [
                { name: normalizedReceiptStore, val: item.price_total },
                ...comparisonPrices
              ];
              
              const minItemPrice = Math.min(...allPrices.map(p => p.val));
              const minPriceObj = allPrices.reduce((prev, curr) => prev.val < curr.val ? prev : curr);

              // Difference between what was paid and the cheapest available price
              const diff = item.price_total - minItemPrice;
              const isExpanded = expandedIdx === idx;

              return (
                <React.Fragment key={idx}>
                  {/* Main Row */}
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                    className={cn(
                      "hover:bg-emerald-50/30 transition-colors cursor-pointer",
                      isExpanded && "bg-emerald-50/50"
                    )}
                  >
                    <td className="py-3 px-4">
                      <p className="font-display text-slate-800 text-[13px] font-medium truncate" title={item.standardized_name}>
                        {item.standardized_name}
                      </p>
                    </td>
                    <td className="py-3 px-1 text-center">
                      <p className="font-display text-slate-800 text-[13px]">{item.price_total.toFixed(2)}</p>
                    </td>
                    <td className="py-3 px-1 text-center">
                      <span className={cn(
                        "font-display text-[13px]",
                        diff > 0 ? "text-red-500 font-bold" : diff === 0 ? "text-emerald-500 font-bold" : "text-slate-400"
                      )}>
                        {diff > 0 ? '-' : diff === 0 ? '✓' : ''}{diff > 0 ? diff.toFixed(2) : ''}
                      </span>
                    </td>
                    <td className="py-3 px-1 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {getStoreLogo(minPriceObj.name) && (
                          <img src={getStoreLogo(minPriceObj.name)!} alt={minPriceObj.name} className="w-4 h-4 rounded-sm" referrerPolicy="no-referrer" />
                        )}
                        <span className="font-display text-[13px] text-emerald-600 font-bold">
                          {minPriceObj.val.toFixed(2)}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                  
                  {/* Expanded Row: Detailed Store Comparison */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-50/30"
                      >
                        <td colSpan={4} className="p-0">
                          <div className="px-4 py-5 border-t border-slate-100/50 space-y-4">
                            <div className="flex items-center justify-between px-2">
                              <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Antall varer</p>
                                <p className="font-display font-bold text-slate-700 text-sm">{item.quantity} {item.unit}</p>
                              </div>
                            </div>
                            
                            {/* Inner Comparison Table */}
                            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Butikk</th>
                                    <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Varepris</th>
                                    <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Sammenlign</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {GROCERY_CHAINS.map(store => {
                                    const price = store === normalizedReceiptStore ? item.price_total : item.comparisons?.[store];
                                    const hasPrice = price !== null && price !== undefined;
                                    const isCheapest = hasPrice && price === minItemPrice;
                                    const diffFromReceipt = hasPrice ? price - item.price_total : null;
                                    const isReceiptStore = store === normalizedReceiptStore;
                                    
                                    return (
                                      <tr key={store} className={cn(
                                        "transition-colors",
                                        isCheapest ? "bg-emerald-50/60" : ""
                                      )}>
                                        <td className="py-2.5 px-4">
                                          <div className="flex items-center gap-2">
                                            {getStoreLogo(store) && (
                                              <img src={getStoreLogo(store)!} alt="" className="w-4 h-4 rounded-sm" referrerPolicy="no-referrer" />
                                            )}
                                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{store.split(' ')[0]}</span>
                                          </div>
                                        </td>
                                        <td className="py-2.5 px-4 text-right">
                                          <span className={cn(
                                            "font-display text-[12px]",
                                            isCheapest ? "text-emerald-600 font-bold" : "text-slate-700"
                                          )}>
                                            {hasPrice ? `${price.toFixed(2)} kr` : <span className="text-slate-300 italic text-[10px]">Mangler data</span>}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-right">
                                          {isReceiptStore ? (
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Din pris</span>
                                          ) : diffFromReceipt !== null ? (
                                            <span className={cn(
                                              "font-display text-[11px] font-bold",
                                              diffFromReceipt < 0 ? "text-emerald-500" : diffFromReceipt > 0 ? "text-red-500" : "text-slate-400"
                                            )}>
                                              {diffFromReceipt > 0 ? '+' : ''}{diffFromReceipt.toFixed(2)} kr
                                            </span>
                                          ) : (
                                            <span className="text-slate-300 italic text-[10px]">N/A</span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody>

          {/* Table Footer: Totals */}
          <tfoot>
            <tr className="bg-slate-50 border-t-2 border-slate-200">
              <td className="py-4 px-4 font-display font-bold text-slate-800 text-[13px]">SUM</td>
              <td className="py-4 px-1 text-center font-display font-bold text-slate-800 text-[13px]">{totalPaid.toFixed(2)}</td>
              <td className="py-4 px-1 text-center">
                <span className={cn(
                  "font-display text-[13px] font-bold",
                  totalDiff > 0 ? "text-red-500" : "text-emerald-500"
                )}>
                  {totalDiff > 0 ? '-' : ''}{totalDiff.toFixed(2)}
                </span>
              </td>
              <td className="py-4 px-1 text-center font-display font-bold text-emerald-600 text-[13px]">{totalCheapest.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* "Show All" Toggle Button */}
      {result.items.length > 7 && (
        <button 
          onClick={() => setShowAll(!showAll)}
          className="w-full py-4 bg-slate-50 hover:bg-slate-100 border-t border-slate-100 transition-colors flex items-center justify-center gap-2 text-slate-500 font-display font-bold text-xs uppercase tracking-widest"
        >
          {showAll ? (
            <>
              Vis færre <ChevronUp size={14} />
            </>
          ) : (
            <>
              Vis alle ({result.items.length}) <ChevronDown size={14} />
            </>
          )}
        </button>
      )}
    </div>
  );
};
