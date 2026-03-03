import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  ChevronLeft, 
  CheckCircle2, 
  TrendingDown, 
  ShoppingBag, 
  Info,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X
} from 'lucide-react';
import { motion, AnimatePresence, useSpring, useTransform, animate } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { extractReceiptData } from './services/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const CountUp = ({ value, suffix = "" }: { value: number, suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(latest)
    });
    return () => controls.stop();
  }, [value]);

  return <span>{displayValue.toFixed(0)}{suffix}</span>;
};

// --- Types ---

interface StoreInfo {
  store_name: string | null;
  store_chain: string | null;
  store_location: string | null;
  purchase_date: string | null;
  purchase_time: string | null;
}

interface ReceiptItem {
  original_name: string;
  standardized_name: string;
  product_id: string;
  category: string;
  quantity: number;
  unit: string;
  price_total: number;
  price_per_unit: number | null;
  price_per_kg: number | null;
  price_per_liter: number | null;
  discount: number | null;
  comparisons: Record<string, number | null>;
  confidence: number;
}

interface ExtractionResult {
  store: StoreInfo;
  currency: string;
  comparison_date: string;
  items: ReceiptItem[];
}

// --- Main App ---

export default function App() {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storeLogos: Record<string, string> = {
    'Meny': 'https://www.google.com/s2/favicons?domain=meny.no&sz=64',
    'Kiwi': 'https://www.google.com/s2/favicons?domain=kiwi.no&sz=64',
    'Bunnpris': 'https://www.google.com/s2/favicons?domain=bunnpris.no&sz=64',
    'Rema 1000': 'https://www.google.com/s2/favicons?domain=rema.no&sz=64',
    'Coop Extra': 'https://www.google.com/s2/favicons?domain=coop.no&sz=64',
    'Rema': 'https://www.google.com/s2/favicons?domain=rema.no&sz=64',
    'Coop': 'https://www.google.com/s2/favicons?domain=coop.no&sz=64',
  };

  const getStoreLogo = (name: string | null) => {
    if (!name) return null;
    const key = Object.keys(storeLogos).find(k => name.toLowerCase().includes(k.toLowerCase()));
    return key ? storeLogos[key] : null;
  };

  const normalizeStoreName = (name: string | null) => {
    if (!name) return 'Ukjent butikk';
    const chains = ['Meny', 'Kiwi', 'Bunnpris', 'Rema 1000', 'Coop Extra'];
    const found = chains.find(c => name.toLowerCase().includes(c.toLowerCase()));
    return found || name;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setError(null);
    }
  };

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const startAnalysis = async () => {
    if (!preview || !file) return;
    setStep('analyzing');
    setError(null);

    try {
      const compressedPreview = await compressImage(preview);
      const data = await extractReceiptData(compressedPreview, 'image/jpeg');
      setResult(data);
      setStep('results');
    } catch (err: any) {
      setError(err.message || 'Huffda! Vi klarte ikke å lese kvitteringen. Prøv et tydeligere bilde.');
      setStep('upload');
      console.error(err);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setStep('upload');
  };

  const totalSpent = result?.items.reduce((acc, item) => acc + item.price_total, 0) || 0;
  const totalSavings = result?.items.reduce((acc, item) => acc + (item.discount || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-md px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <ShoppingBag className="text-white w-5 h-5" />
          </div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900">PrisSjekk</h1>
        </div>
        {step === 'results' && (
          <button onClick={reset} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <RefreshCw size={20} />
          </button>
        )}
      </header>

      <main className="w-full max-w-md px-6 pb-12 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-display font-bold leading-tight mb-3">
                  Spar penger på <br />
                  <span className="text-emerald-500">matvarene dine</span>
                </h2>
                <p className="text-slate-500 text-lg">Skann kvitteringen din for å se hvor mye du har spart og finn bedre priser.</p>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                {preview ? (
                  <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl aspect-[4/5] bg-slate-200">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setPreview(null)}
                      className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                    >
                      <X size={20} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                      <button 
                        onClick={startAnalysis}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-display font-bold text-lg shadow-xl shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        Sjekk priser <ArrowRight size={20} />
                      </button>
                    </div>
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
          )}

          {/* STEP 2: ANALYZING */}
          {step === 'analyzing' && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-12"
            >
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
              <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Analyserer kvittering...</h2>
              <p className="text-slate-500 mb-8">Vår smarte assistent leser varene dine nå.</p>
              
              <button 
                onClick={() => setStep('upload')}
                className="px-6 py-3 text-slate-400 hover:text-slate-600 font-medium flex items-center gap-2 transition-colors"
              >
                <X size={18} />
                Avbryt
              </button>
            </motion.div>
          )}

          {/* STEP 3: RESULTS */}
          {step === 'results' && result && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Savings Hero */}
              <div className="bg-emerald-500 rounded-[40px] p-8 text-white shadow-2xl shadow-emerald-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <TrendingDown size={120} strokeWidth={1} />
                </div>
                <div className="relative z-10">
                  <p className="text-emerald-100 font-medium mb-1">Du sparte totalt</p>
                  <h3 className="text-6xl font-display font-extrabold mb-4">
                    <CountUp value={totalSavings} suffix=" kr" />
                  </h3>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 w-fit text-sm">
                    <CheckCircle2 size={16} />
                    <span>Godt jobba!</span>
                  </div>
                </div>
              </div>

              {/* Store Info */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-800">{normalizeStoreName(result.store.store_name)}</h4>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{result.store.purchase_date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Totalt brukt</p>
                  <p className="font-display font-bold text-slate-800">{totalSpent.toFixed(2)} kr</p>
                </div>
              </div>

              {/* Total Price Visualization */}
              <div className="space-y-3">
                <h5 className="font-display font-bold text-slate-800 px-2">Totalpris per butikk</h5>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  {(() => {
                    const normalizedReceiptStore = normalizeStoreName(result.store.store_name);
                    const chains = ['Meny', 'Kiwi', 'Bunnpris', 'Rema 1000', 'Coop Extra'].filter(c => c !== normalizedReceiptStore);
                    
                    const totals = chains.map(chain => {
                      const total = result.items.reduce((sum, item) => sum + (item.comparisons?.[chain] || 0), 0);
                      const missingCount = result.items.filter(item => item.comparisons?.[chain] === null).length;
                      return { chain, total, missingCount, isReceipt: false };
                    });
                    
                    const receiptTotal = result.items.reduce((sum, item) => sum + item.price_total, 0);
                    const allTotals = [...totals, { chain: normalizedReceiptStore, total: receiptTotal, missingCount: 0, isReceipt: true }];
                    
                    const maxTotal = Math.max(...allTotals.map(t => t.total));
                    const minTotal = Math.min(...allTotals.filter(t => t.total > 0).map(t => t.total));

                    return allTotals
                      .sort((a, b) => (a.total || Infinity) - (b.total || Infinity))
                      .map((t, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between items-end text-xs font-bold">
                          <div className="flex items-center gap-2">
                            {getStoreLogo(t.chain) && (
                              <img src={getStoreLogo(t.chain)!} alt="" className="w-4 h-4 rounded-sm" referrerPolicy="no-referrer" />
                            )}
                            <span className={t.isReceipt ? "text-emerald-600" : "text-slate-600"}>
                              {t.chain} {t.isReceipt && "(Din kvittering)"}
                            </span>
                          </div>
                          <span className={t.total === minTotal ? "text-emerald-600" : "text-slate-400"}>
                            {t.total > 0 ? `${t.total.toFixed(2)} kr` : "N/A"}
                          </span>
                        </div>
                        <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden flex">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(t.total / maxTotal) * 100}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className={cn(
                              "h-full rounded-full",
                              t.total === minTotal ? "bg-emerald-500" : t.isReceipt ? "bg-emerald-400/50" : "bg-slate-200"
                            )}
                          />
                        </div>
                        {t.missingCount > 0 && (
                          <p className="text-[9px] text-slate-400 italic">Mangler pris på {t.missingCount} varer</p>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <h5 className="font-display font-bold text-slate-800">Dine varer & prissammenligning</h5>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">{result.items.length} varer</span>
                </div>
                
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto scrollbar-none">
                    <table className="w-full text-left border-collapse min-w-[700px] table-fixed">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="py-3 px-4 font-display font-medium text-[10px] text-slate-400 uppercase tracking-wider w-[140px]">Vare</th>
                          <th className="py-3 px-1 font-display font-medium text-[10px] text-slate-400 uppercase tracking-wider text-center w-[65px]">
                            <div className="flex flex-col items-center gap-1">
                              {getStoreLogo(result.store.store_name) && (
                                <img src={getStoreLogo(result.store.store_name)!} alt="" className="w-3.5 h-3.5 rounded-sm" referrerPolicy="no-referrer" />
                              )}
                              <span className="truncate w-full px-1">{normalizeStoreName(result.store.store_name)}</span>
                            </div>
                          </th>
                          <th className="py-3 px-1 font-display font-medium text-[10px] text-slate-400 uppercase tracking-wider text-center w-[55px]">Diff</th>
                          {['Meny', 'Kiwi', 'Bunnpris', 'Rema 1000', 'Coop Extra']
                            .filter(c => c !== normalizeStoreName(result.store.store_name))
                            .map(store => (
                            <th key={store} className="py-3 px-1 font-display font-medium text-[10px] text-slate-400 uppercase tracking-wider text-center w-[60px]">
                              <div className="flex flex-col items-center gap-1">
                                {getStoreLogo(store) && (
                                  <img src={getStoreLogo(store)!} alt="" className="w-3.5 h-3.5 rounded-sm" referrerPolicy="no-referrer" />
                                )}
                                <span>{store.replace(' 1000', '').replace(' Extra', '')}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {result.items.map((item, idx) => {
                          const normalizedReceiptStore = normalizeStoreName(result.store.store_name);
                          const comparisonChains = ['Meny', 'Kiwi', 'Bunnpris', 'Rema 1000', 'Coop Extra'].filter(c => c !== normalizedReceiptStore);
                          
                          const prices = comparisonChains.map(chain => ({ name: chain, val: item.comparisons?.[chain] }));
                          
                          const validPrices = prices.filter(p => p.val !== null && p.val !== undefined) as { name: string, val: number }[];
                          const minPrice = validPrices.length > 0 ? Math.min(...validPrices.map(p => p.val)) : null;
                          const maxPrice = validPrices.length > 0 ? Math.max(...validPrices.map(p => p.val)) : null;
                          const diff = maxPrice !== null ? maxPrice - item.price_total : null;
                          const isExpanded = expandedIdx === idx;

                          return (
                            <React.Fragment key={idx}>
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
                                <td className="py-2.5 px-4">
                                  <p className="font-display text-slate-800 text-[11px] truncate" title={item.standardized_name}>
                                    {item.standardized_name}
                                  </p>
                                </td>
                                <td className="py-2.5 px-1 text-center">
                                  <p className="font-display text-slate-800 text-[11px]">{item.price_total.toFixed(2)}</p>
                                </td>
                                <td className="py-2.5 px-1 text-center">
                                  {diff !== null ? (
                                    <span className={cn(
                                      "font-display text-[11px]",
                                      diff > 0 ? "text-emerald-500" : diff < 0 ? "text-red-500" : "text-slate-400"
                                    )}>
                                      {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 text-[11px]">—</span>
                                  )}
                                </td>
                                {comparisonChains.map(store => {
                                  const price = item.comparisons?.[store];
                                  const isCheapest = price !== null && price === minPrice;
                                  return (
                                    <td key={store} className="py-2.5 px-1 text-center">
                                      {price !== null && price !== undefined ? (
                                        <span className={cn(
                                          "font-display text-[11px]",
                                          isCheapest ? "text-emerald-600 font-bold" : "text-slate-500"
                                        )}>
                                          {price.toFixed(2)}
                                        </span>
                                      ) : (
                                        <span className="text-slate-300 text-[11px]">—</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </motion.tr>
                              
                              {/* Expanded Row */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.tr
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-slate-50/30"
                                  >
                                    <td colSpan={8} className="p-0">
                                      <div className="px-6 py-4 border-t border-slate-100/50 space-y-4">
                                        <div className="flex items-center gap-8">
                                          <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Antall varer</p>
                                            <p className="font-display font-bold text-slate-700">{item.quantity} {item.unit}</p>
                                          </div>
                                          <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kategori</p>
                                            <p className="font-display font-bold text-slate-700">{item.category}</p>
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pris hentet per butikk</p>
                                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            {['Meny', 'Kiwi', 'Bunnpris', 'Rema 1000', 'Coop Extra']
                                              .filter(c => c !== normalizeStoreName(result.store.store_name))
                                              .map(store => (
                                              <div key={store} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mb-1">{store}</p>
                                                <p className="font-mono text-[10px] text-slate-600">{result.comparison_date}</p>
                                              </div>
                                            ))}
                                          </div>
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
                    </table>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                    <Info size={14} className="text-slate-400" />
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      Priser hentet fra butikkene den {result.comparison_date || '03.03.2026'}
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={reset}
                className="w-full py-5 bg-slate-900 text-white rounded-3xl font-display font-bold text-lg shadow-xl shadow-slate-200 transition-all active:scale-95"
              >
                Skann ny kvittering
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav Spacer */}
      <div className="h-8" />
    </div>
  );
}

function getCategoryEmoji(category: string) {
  const map: Record<string, string> = {
    'Fruit': '🍎',
    'Vegetables': '🥦',
    'Meat': '🥩',
    'Fish': '🐟',
    'Dairy': '🥛',
    'Bread': '🍞',
    'Frozen': '🧊',
    'Snacks': '🍿',
    'Drinks': '🥤',
    'Household': '🧼',
    'Other': '📦'
  };
  return map[category] || '🛒';
}
