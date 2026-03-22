import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ExtractionResult } from '../types';
import { getStoreLogo } from '../utils/receiptUtils';

interface StoreComparisonListProps {
  result: ExtractionResult;
}

export const StoreComparisonList: React.FC<StoreComparisonListProps> = ({ result }) => {
  const chains = ['KIWI', 'REMA 1000', 'SPAR', 'COOP EXTRA', 'MENY', 'COOP OBS'];
  
  const totals = chains.map(chain => {
    const total = result.items.reduce((acc, item) => {
      const price = item.comparisons?.[chain] || item.price_unit;
      return acc + (price * item.quantity);
    }, 0);
    return { chain, total, isReceipt: chain === result.store?.store_chain };
  }).sort((a, b) => a.total - b.total);

  const minTotal = Math.min(...totals.map(t => t.total));

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-sm font-bold text-slate-800">Butikker sortert på pris</h5>
        <button className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
          Vis alle <ChevronDown size={14} className="text-emerald-300" />
        </button>
      </div>

      <div className="space-y-4">
        {totals.slice(0, 3).map((t, idx) => {
          const isMin = t.total === minTotal;
          const diff = t.total - minTotal;

          return (
            <div key={t.chain} className={`flex items-center justify-between p-2 rounded-2xl transition-colors ${isMin ? 'bg-emerald-50/40' : ''}`}>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${isMin ? 'text-emerald-500' : 'text-slate-700'}`}>{t.chain}</span>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{t.total.toLocaleString('no-NO', { minimumFractionDigits: 2 })} kr</p>
                {isMin ? (
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">Best</span>
                ) : (
                  <span className="text-[10px] font-bold text-red-400 bg-red-50 px-2 py-0.5 rounded-full">
                    +{diff.toLocaleString('no-NO', { minimumFractionDigits: 2 })} kr
                  </span>
                )}
              </div>
            </div>
          );
        })}
        
        {totals.length > 3 && (
          <div className="text-center py-1">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">... {totals.length - 3} flere ...</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-center gap-2 text-[10px] font-medium text-slate-300">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
        Oppdatert: i dag {new Date().getHours().toString().padStart(2, '0')}:{new Date().getMinutes().toString().padStart(2, '0')} • Prisdata fra butikker
      </div>
    </div>
  );
};
