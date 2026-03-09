import React from 'react';
import { Camera, Upload, X, ArrowRight, Info, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { getStoreLogo } from '../utils/receiptUtils';
import { GROCERY_CHAINS } from '../constants';

interface UploadSectionProps {
  preview: string | null;
  setPreview: (p: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startAnalysis: () => void;
  error: string | null;
}

/**
 * ReceiptUploadView - The landing page and upload interface
 * Features a hero banner with a phone mockup and the main upload triggers.
 */
export const ReceiptUploadView: React.FC<UploadSectionProps> = ({ 
  preview, 
  setPreview, 
  fileInputRef, 
  handleFileChange, 
  startAnalysis, 
  error 
}) => {
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
        <p className="text-slate-500 text-base">Matpris sammenligner priser hos de største kjedene</p>
      </div>

      {/* Main Content Area: Upload Triggers */}
      <div className="flex flex-col gap-6">
        {/* Preview State: Displayed after an image is selected */}
        {preview ? (
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="w-full h-32 relative">
              <div className="absolute inset-0 rounded-3xl overflow-hidden border border-slate-200 bg-slate-100">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-transparent" />
              </div>
              
              <button 
                onClick={() => setPreview(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20"
              >
                <X size={16} />
              </button>
            </div>

            {/* Receipt Thumbnail */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-28 aspect-[3/4] rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-slate-200 -mt-16 z-10"
            >
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </motion.div>

            {/* Primary Action: Start Analysis */}
            <button 
              onClick={startAnalysis}
              className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl font-display font-bold text-lg shadow-xl shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Sjekk priser <ArrowRight size={20} />
            </button>
          </div>
        ) : (
          /* Empty State: Upload Triggers */
          <div className="flex flex-col gap-3">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="py-10 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="text-emerald-500 w-7 h-7" />
              </div>
              <div className="text-center px-8">
                <p className="text-base font-display font-bold text-slate-800">Ta bilde av kvitteringen</p>
              </div>
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-white text-slate-500 rounded-2xl font-display font-bold text-sm border border-slate-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Upload size={16} className="text-slate-400" />
              Eller velg fra bibliotek
            </button>
          </div>
        )}
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
      </div>

      {/* Store Logos Section */}
      {!preview && (
        <div className="mt-12">
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
