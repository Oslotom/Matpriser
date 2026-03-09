import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { ExtractionResult } from '../types';
import { normalizeStoreName } from '../utils/helpers';

interface StoreInfoCardProps {
  result: ExtractionResult;
  totalSpent: number;
}

export const StoreInfoCard: React.FC<StoreInfoCardProps> = ({ result, totalSpent }) => {
  const storeName = result.store?.store_name || result.store?.store_chain || 'Ukjent butikk';
  const purchaseDate = result.store?.purchase_date || result.comparison_date || 'Ukjent dato';

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
          <ShoppingBag size={24} />
        </div>
        <div>
          <h4 className="font-display font-bold text-slate-800">{normalizeStoreName(storeName)}</h4>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{purchaseDate}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Totalt brukt</p>
        <p className="font-display font-bold text-slate-800">{totalSpent.toFixed(2)} kr</p>
      </div>
    </div>
  );
};
