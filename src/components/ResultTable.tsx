import React from 'react';
import { motion } from 'motion/react';
import { Plus, Minus, ChevronDown, MoreHorizontal, Search, ShoppingCart } from 'lucide-react';
import { ExtractionResult } from '../types';
import { normalizeStoreName } from '../utils/helpers';

interface ResultTableProps {
  result: ExtractionResult;
  expandedIdx: number | null;
  setExpandedIdx: (idx: number | null) => void;
}

export const ResultTable: React.FC<ResultTableProps> = ({ result }) => {
  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
      <div className="relative mb-8">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center">
            <Plus size={12} className="text-emerald-500" />
          </div>
        </div>
        <input 
          type="text" 
          placeholder="Legg til vare..." 
          className="w-full bg-emerald-50/20 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-slate-600 placeholder:text-slate-300 focus:ring-0 transition-all"
          readOnly
        />
      </div>

      <div className="space-y-8">
        {result.items.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center">
                <img 
                  src={`https://picsum.photos/seed/${item.standardized_name}/100/100`} 
                  alt={item.standardized_name} 
                  className="w-10 h-10 object-contain mix-blend-multiply"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 mb-0.5">{item.standardized_name}</p>
                <p className="text-sm font-bold text-slate-900">{item.price_total.toLocaleString('no-NO', { minimumFractionDigits: 2 })} kr</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                <Minus size={16} />
              </button>
              <span className="text-sm font-bold text-slate-800">{item.quantity}</span>
              <button className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
                <Plus size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
