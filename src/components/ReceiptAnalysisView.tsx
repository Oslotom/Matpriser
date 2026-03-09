import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyzingSectionProps {
  onCancel: () => void;
}

/**
 * ReceiptAnalysisView - Displays a loading state while Gemini AI processes the receipt
 */
export const ReceiptAnalysisView: React.FC<AnalyzingSectionProps> = ({ onCancel }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center text-center py-12"
    >
      {/* Animated Loading Spinner */}
      <div className="relative w-32 h-32 mb-8">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-4 border-emerald-100 border-t-emerald-500 rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="text-emerald-500 w-10 h-10 animate-pulse" />
        </div>
      </div>

      {/* Status Text */}
      <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Analyserer kvittering...</h2>
      <p className="text-slate-500 mb-8">Vår smarte assistent leser varene dine nå.</p>
      
      {/* Cancel Action */}
      <button 
        onClick={onCancel}
        className="px-6 py-3 text-slate-400 hover:text-slate-600 font-medium flex items-center gap-2 transition-colors"
      >
        <X size={18} />
        Avbryt
      </button>
    </motion.div>
  );
};
