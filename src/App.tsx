import React, { useState, useRef } from 'react';
import { ShoppingBag, RefreshCw, Info, LayoutDashboard, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { extractReceiptData } from './services/gemini';
import { ExtractionResult } from './types';
import { normalizeStoreName, compressImage } from './utils/helpers';
import { StoreInfoCard } from './components/StoreInfoCard';
import { StoreComparisonList } from './components/StoreComparisonList';
import { ResultTable } from './components/ResultTable';
import { UploadSection } from './components/UploadSection';
import { AnalyzingSection } from './components/AnalyzingSection';
import { Dashboard } from './components/Dashboard';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Footer } from './components/Footer';
import { useEffect } from 'react';

export default function App() {
  const [view, setView] = useState<'app' | 'dashboard' | 'privacy'>('app');
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-md px-6 py-6 flex items-center justify-center">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => { setView('app'); reset(); }}
        >
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
            <ShoppingBag className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-display font-black text-slate-900 tracking-tight">PrisSjekk</span>
        </div>
      </header>

      <main className="w-full max-w-md px-6 pb-12 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <Dashboard key="dashboard" onBack={() => setView('app')} />
          ) : view === 'privacy' ? (
            <PrivacyPolicy key="privacy" onBack={() => setView('app')} />
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
                  <h2 className="text-4xl font-display font-bold text-slate-900 mb-2">Planlegg</h2>
                  
                  <StoreInfoCard result={result} totalSpent={totalSpent} />
                  
                  <StoreComparisonList result={result} />

                  <ResultTable 
                    result={result} 
                    expandedIdx={expandedIdx} 
                    setExpandedIdx={setExpandedIdx} 
                  />

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

      <Footer 
        onPrivacyClick={() => setView('privacy')} 
        onDashboardClick={() => setView('dashboard')}
      />
    </div>
  );
}
