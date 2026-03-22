import React, { useEffect, useState } from 'react';
import { Camera, Upload, X, ArrowRight, Info, ShoppingBag, Database, List, Store, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { getStoreLogo } from '../utils/receiptUtils';
import { GROCERY_CHAINS } from '../constants';

interface UploadSectionProps {
  preview: string | null;
  setPreview: (p: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string | null;
}

interface Stats {
  uploads: number;
  totalItems: number;
  stores: number;
  chains: number;
}

/**
 * ReceiptUploadView - The landing page and upload interface
 */
export const ReceiptUploadView: React.FC<UploadSectionProps> = ({ 
  preview, 
  setPreview, 
  fileInputRef, 
  handleFileChange, 
  error 
}) => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex-1 flex flex-col"
    >
      {/* Header Section: Title and Subtitle */}
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-display font-bold leading-tight mb-4">
          Sammenlign pris <br />
          <span className="text-emerald-500">på matvarer</span>
        </h2>
        <p className="text-slate-500 text-base">Butikkpriser.no sammenligner priser hos de største kjedene</p>
      </div>

      {/* Main Content Area: Upload Triggers */}
      <div className="flex flex-col gap-6">
        {/* Empty State: Upload Triggers */}
        <div className="flex flex-col gap-3">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="py-12 border-2 border-dashed border-emerald-200 rounded-[32px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition-all group bg-white shadow-xl shadow-emerald-100/50"
          >
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Camera className="text-emerald-500 w-8 h-8" />
            </div>
            <div className="text-center px-8">
              <p className="text-xl font-display font-bold text-slate-800">Ta bilde av kvitteringen</p>
              <p className="text-sm text-slate-500 mt-1">Vi leser varene dine automatisk</p>
              <button 
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-bold text-slate-600 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <Upload size={14} />
                Eller velg fra bibliotek
              </button>
            </div>
          </div>
        </div>
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
      </div>

      {/* Statistics Section */}
      {stats && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-10 mb-2"
        >
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Kvitteringer', value: stats.uploads, icon: Database },
              { label: 'Varer', value: stats.totalItems, icon: List },
              { label: 'Butikker', value: stats.stores, icon: Store },
              { label: 'Kjeder', value: stats.chains, icon: Layers }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="bg-white/50 backdrop-blur-sm border border-slate-100 rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-1 hover:bg-white transition-colors"
              >
                <stat.icon size={12} className="text-emerald-500 mb-1" />
                <span className="text-sm font-display font-bold text-slate-800 leading-none">{stat.value}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Store Logos Section */}
      {!preview && (
        <div className="mt-8">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Vi sammenligner priser fra</h3>
          <div className="grid grid-cols-3 gap-4">
            {GROCERY_CHAINS.map((chain) => (
              <div key={chain} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm">
                <img 
                  src={getStoreLogo(chain) || ''} 
                  alt={chain} 
                  className="w-8 h-8 object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{chain}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How it works section */}
      {!preview && (
        <div className="mt-12 pt-12 border-t border-slate-100">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">Slik fungerer det</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Camera, title: 'Skann', desc: 'Ta bilde' },
              { icon: ShoppingBag, title: 'Analyser', desc: 'AI leser' },
              { icon: ArrowRight, title: 'Spar', desc: 'Se priser' }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <step.icon className="text-emerald-500 w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">{step.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-tight">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Feedback */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100">
          <Info size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </motion.div>
  );
};
