import React from 'react';
import { Sparkles, X, Upload, Search, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnalyzingSectionProps {
  onCancel: () => void;
  preview: string | null;
  status: 'uploading' | 'analyzing' | 'finished';
}

/**
 * ReceiptAnalysisView - Displays a loading state while Gemini AI processes the receipt
 */
export const ReceiptAnalysisView: React.FC<AnalyzingSectionProps> = ({ onCancel, preview, status }) => {
  const getStatusContent = () => {
    switch (status) {
      case 'uploading':
        return {
          title: 'Laster opp bilde',
          desc: 'Forbereder kvitteringen for analyse...',
          icon: Upload,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50'
        };
      case 'analyzing':
        return {
          title: 'Analyserer data',
          desc: 'Vår smarte assistent leser varene dine nå.',
          icon: Search,
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-50'
        };
      case 'finished':
        return {
          title: 'Sammenligningen er ferdig',
          desc: 'Vi har funnet de beste prisene til deg!',
          icon: CheckCircle2,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-100'
        };
      default:
        return {
          title: 'Analyserer...',
          desc: 'Vennligst vent et øyeblikk.',
          icon: Sparkles,
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-50'
        };
    }
  };

  const content = getStatusContent();
  const Icon = content.icon;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center text-center py-12"
    >
      {/* Mini Receipt Preview */}
      {preview && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="relative w-24 aspect-[3/4] rounded-xl overflow-hidden border-4 border-white shadow-xl bg-slate-200 mb-12 z-10 rotate-[-3deg]"
        >
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <AnimatePresence mode="wait">
            {status !== 'finished' && (
              <motion.div 
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-emerald-500/10 animate-pulse" 
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Animated Loading Spinner / Icon */}
      <div className="relative w-24 h-24 mb-8">
        <AnimatePresence mode="wait">
          <motion.div 
            key={status}
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.5, rotate: 20 }}
            className={`absolute inset-0 flex items-center justify-center rounded-full ${content.bgColor} shadow-inner`}
          >
            {status !== 'finished' && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className={`absolute inset-0 border-4 border-transparent border-t-current ${content.color} rounded-full opacity-20`}
              />
            )}
            <Icon className={`${content.color} w-10 h-10 ${status === 'analyzing' ? 'animate-bounce' : status === 'uploading' ? 'animate-pulse' : ''}`} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Status Text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={content.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">{content.title}</h2>
          <p className="text-slate-500 mb-8">{content.desc}</p>
        </motion.div>
      </AnimatePresence>
      
      {/* Cancel Action */}
      {status !== 'finished' && (
        <button 
          onClick={onCancel}
          className="px-6 py-3 text-slate-400 hover:text-slate-600 font-medium flex items-center gap-2 transition-colors"
        >
          <X size={18} />
          Avbryt
        </button>
      )}
    </motion.div>
  );
};
