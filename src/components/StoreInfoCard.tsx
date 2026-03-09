import React from 'react';
import { List, ShoppingCart, Coins } from 'lucide-react';
import { ExtractionResult } from '../types';

interface StoreInfoCardProps {
  result: ExtractionResult;
  totalSpent: number;
}

export const StoreInfoCard: React.FC<StoreInfoCardProps> = ({ result, totalSpent }) => {
  // Calculate potential savings
  const cheapestTotal = result.items.reduce((acc, item) => {
    const prices = Object.values(item.comparisons || {}).filter((p): p is number => typeof p === 'number');
    const minPrice = prices.length > 0 ? Math.min(...prices) : item.price_unit;
    return acc + (minPrice * item.quantity);
  }, 0);

  const potentialSavings = totalSpent - cheapestTotal;

  return (
    <div className="grid grid-cols-3 gap-2 py-2">
      <div className="flex flex-col items-center text-center">
        <List size={16} className="text-slate-300 mb-1" />
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mb-0.5">Antall varer</p>
        <p className="text-base font-extrabold text-slate-900">{result.items.length}</p>
      </div>
      
      <div className="flex flex-col items-center text-center">
        <ShoppingCart size={16} className="text-slate-300 mb-1" />
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mb-0.5">Totalsum</p>
        <p className="text-base font-extrabold text-slate-900">{totalSpent.toLocaleString('no-NO', { minimumFractionDigits: 2 })} kr</p>
      </div>

      <div className="flex flex-col items-center text-center">
        <Coins size={16} className="text-slate-300 mb-1" />
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mb-0.5">Spar opp til</p>
        <p className="text-base font-extrabold text-emerald-500">{potentialSavings > 0 ? potentialSavings.toLocaleString('no-NO', { minimumFractionDigits: 2 }) : '0,00'} kr</p>
      </div>
    </div>
  );
};
