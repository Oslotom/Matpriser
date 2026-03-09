import React from 'react';
import { Camera, Upload, X, ArrowRight, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface UploadSectionProps {
  preview: string | null;
  setPreview: (p: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startAnalysis: () => void;
  error: string | null;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ 
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
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold leading-tight mb-3">
          Sammenlign pris <br />
          <span className="text-emerald-500">på matvarer</span>
        </h2>
        <p className="text-slate-500 text-lg mb-4">Norges første folkestyrte matpris app</p>
        
        <div className="flex flex-wrap gap-2">
          {['Helt gratis', 'Anonymt', 'Priser i sanntid'].map((usp) => (
            <span key={usp} className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-wider shadow-sm">
              {usp}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-8">
        {preview ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: -4 }}
              className="relative w-48 aspect-[3/4] rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-slate-200"
            >
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => setPreview(null)}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white"
              >
                <X size={16} />
              </button>
            </motion.div>

            <button 
              onClick={startAnalysis}
              className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl font-display font-bold text-lg shadow-xl shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Sjekk priser <ArrowRight size={20} />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 border-4 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
          >
            <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="text-emerald-500 w-10 h-10" />
            </div>
            <div className="text-center px-8">
              <p className="text-xl font-display font-bold text-slate-800">Ta bilde av kvitteringen</p>
              <p className="text-slate-400 mt-2">Vi leser den automatisk for deg</p>
            </div>
          </div>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />

        {!preview && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-5 bg-white text-slate-700 rounded-3xl font-display font-bold text-lg shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <Upload size={20} className="text-emerald-500" />
            Velg fra bibliotek
          </button>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100">
          <Info size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </motion.div>
  );
};
