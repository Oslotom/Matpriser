import React, { useState, useRef } from 'react';
import { ShoppingBag, RefreshCw, Info, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { extractReceiptData } from './services/gemini';
import { ExtractionResult } from './types';
import { normalizeStoreName, compressImage } from './utils/helpers';
import { SavingsHero } from './components/SavingsHero';
import { StoreInfoCard } from './components/StoreInfoCard';
import { PriceVisualization } from './components/PriceVisualization';
import { ResultTable } from './components/ResultTable';
import { UploadSection } from './components/UploadSection';
import { AnalyzingSection } from './components/AnalyzingSection';
import { Dashboard } from './components/Dashboard';
import { useEffect } from 'react';

export default function App() {
  const [view, setView] = useState<'app' | 'dashboard'>('app');
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Track visit on mount
    fetch('/api/track-visit', { method: 'POST' }).catch(console.error);
  }, []);

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

  const startAnalysis = async () => {
    if (!preview || !file) return;
    setStep('analyzing');
    setError(null);

    try {
      // Compress image to reduce payload size and prevent timeouts
      const compressedBase64 = await compressImage(file);
      const data = await extractReceiptData(compressedBase64, 'image/jpeg');
      
      if (!data || !data.store || !data.items) {
        throw new Error("Klarte ikke å lese butikk eller varer fra kvitteringen. Prøv et tydeligere bilde.");
      }
      
      // 1. Normalize store chain and save this receipt's data to the database
      const normalizedStoreChain = normalizeStoreName(data.store.store_chain || data.store.store_name || 'Ukjent');
      const dataToSave = {
        ...data,
        store: {
          ...data.store,
          store_chain: normalizedStoreChain
        }
      };

      await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });

      // 2. Fetch real comparison data from the database for these products
      const productIds = data.items.map(item => item.product_id).join(',');
      const pricesRes = await fetch(`/api/prices?product_ids=${productIds}`);
      const realPrices = await pricesRes.json();

      // 3. Augment the result with real data (replacing Gemini's guesses/nulls)
      const augmentedItems = data.items.map(item => ({
        ...item,
        comparisons: realPrices[item.product_id] || {}
      }));

      setResult({ ...data, items: augmentedItems });
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
    setExpandedIdx(null);
  };

  const totalSpent = result?.items.reduce((acc, item) => acc + item.price_total, 0) || 0;
  const totalSavings = result?.items.reduce((acc, item) => acc + (item.discount || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-md px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('app')}>
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <ShoppingBag className="text-white w-5 h-5" />
          </div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900">PrisSjekk</h1>
        </div>
        <div className="flex items-center gap-2">
          {view === 'app' && (
            <button 
              onClick={() => setView('dashboard')}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              title="Dashboard"
            >
              <LayoutDashboard size={20} />
            </button>
          )}
          {step === 'results' && view === 'app' && (
            <button onClick={reset} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <RefreshCw size={20} />
            </button>
          )}
        </div>
      </header>

      <main className="w-full max-w-md px-6 pb-12 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <Dashboard key="dashboard" onBack={() => setView('app')} />
          ) : (
            <>
              {step === 'upload' && (
                <UploadSection 
                  key="upload"
                  preview={preview}
                  setPreview={setPreview}
                  fileInputRef={fileInputRef}
                  handleFileChange={handleFileChange}
                  startAnalysis={startAnalysis}
                  error={error}
                />
              )}

              {step === 'analyzing' && (
                <AnalyzingSection 
                  key="analyzing"
                  onCancel={() => setStep('upload')} 
                />
              )}

              {step === 'results' && result && (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <SavingsHero totalSavings={totalSavings} />
                  <StoreInfoCard result={result} totalSpent={totalSpent} />
                  
                  <div className="space-y-3">
                    <h5 className="font-display font-bold text-slate-800 px-2">Totalpris per butikk</h5>
                    <PriceVisualization result={result} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                      <h5 className="font-display font-bold text-slate-800">Dine varer & prissammenligning</h5>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">{result.items.length} varer</span>
                    </div>
                    <ResultTable 
                      result={result} 
                      expandedIdx={expandedIdx} 
                      setExpandedIdx={setExpandedIdx} 
                    />
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-2">
                    <Info size={14} className="text-slate-400" />
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      Priser hentet fra butikkene den {result.comparison_date}
                    </p>
                  </div>

                  <button 
                    onClick={reset}
                    className="w-full py-5 bg-slate-900 text-white rounded-3xl font-display font-bold text-lg shadow-xl shadow-slate-200 transition-all active:scale-95"
                  >
                    Skann ny kvittering
                  </button>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>

      <div className="h-8" />
    </div>
  );
}
