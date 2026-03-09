import React, { useState, useRef } from 'react';
import { ShoppingBag, RefreshCw, Info, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { extractReceiptData } from './services/receiptExtractionService';
import { ExtractionResult } from './types';
import { normalizeStoreName, compressImage } from './utils/receiptUtils';
import { ReceiptSummaryCard } from './components/ReceiptSummaryCard';
import { PriceComparisonTable } from './components/PriceComparisonTable';
import { ReceiptUploadView } from './components/ReceiptUploadView';
import { ReceiptAnalysisView } from './components/ReceiptAnalysisView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { useEffect } from 'react';

/**
 * MatprisApp - Main application component
 * Handles routing between views, global state, and the receipt analysis flow.
 */
export default function MatprisApp() {
  // --- State Management ---
  const [view, setView] = useState<'app' | 'dashboard' | 'privacy' | 'contact'>('app');
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Side Effects ---
  useEffect(() => {
    // Track visit on mount for analytics
    fetch('/api/track-visit', { method: 'POST' }).catch(console.error);
  }, []);

  // --- Handlers ---
  
  /**
   * Handles the selection of a receipt image file
   */
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

  /**
   * Triggers the AI analysis of the uploaded receipt
   */
  const startAnalysis = async () => {
    if (!preview || !file) return;
    setStep('analyzing');
    setError(null);

    try {
      // 1. Compress image to reduce payload size and prevent timeouts
      const compressedBase64 = await compressImage(file);
      
      // 2. Extract data using Gemini AI
      const data = await extractReceiptData(compressedBase64, 'image/jpeg');
      
      if (!data || !data.store || !data.items) {
        throw new Error("Klarte ikke å lese butikk eller varer fra kvitteringen. Prøv et tydeligere bilde.");
      }
      
      // 3. Normalize store chain and save this receipt's data to the database
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

      // 4. Fetch real comparison data from the database for these products
      const productIds = data.items.map(item => item.product_id).join(',');
      const pricesRes = await fetch(`/api/prices?product_ids=${productIds}`);
      const realPrices = await pricesRes.json();

      // 5. Augment the result with real data (replacing Gemini's guesses/nulls)
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

  /**
   * Resets the app state to start a new scan
   */
  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setStep('upload');
    setExpandedIdx(null);
  };

  // --- Calculations ---
  const totalSpent = result?.items.reduce((acc, item) => acc + item.price_total, 0) || 0;

  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      {/* Global Header */}
      <header className="w-full max-w-md px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('app'); reset(); }}>
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <ShoppingBag className="text-white w-5 h-5" />
          </div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900">Matpris</h1>
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
            <AdminDashboardView key="dashboard" onBack={() => setView('app')} />
          ) : view === 'privacy' ? (
            <motion.div 
              key="privacy"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-display font-bold text-slate-900">Personvern</h2>
              <div className="prose prose-slate text-slate-600 space-y-4">
                <p>Vi tar ditt personvern på alvor. Matpris lagrer kun data fra kvitteringer for å forbedre prissammenligningen.</p>
                <p>Ingen personlig informasjon knyttet til din identitet blir lagret eller delt med tredjeparter.</p>
              </div>
              <button 
                onClick={() => setView('app')}
                className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold"
              >
                Tilbake
              </button>
            </motion.div>
          ) : view === 'contact' ? (
            <motion.div 
              key="contact"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-display font-bold text-slate-900">Kontakt oss</h2>
              <div className="prose prose-slate text-slate-600 space-y-4">
                <p>Har du spørsmål eller tilbakemeldinger? Vi vil gjerne høre fra deg!</p>
                <p>Send oss en e-post på: <a href="mailto:kontakt@matpris.no" className="text-emerald-500 font-bold">kontakt@matpris.no</a></p>
              </div>
              <button 
                onClick={() => setView('app')}
                className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold"
              >
                Tilbake
              </button>
            </motion.div>
          ) : (
            <>
              {/* Step 1: Upload Receipt */}
              {step === 'upload' && (
                <ReceiptUploadView 
                  key="upload"
                  preview={preview}
                  setPreview={setPreview}
                  fileInputRef={fileInputRef}
                  handleFileChange={handleFileChange}
                  startAnalysis={startAnalysis}
                  error={error}
                />
              )}

              {/* Step 2: AI Analysis in progress */}
              {step === 'analyzing' && (
                <ReceiptAnalysisView 
                  key="analyzing"
                  onCancel={() => setStep('upload')} 
                />
              )}

              {/* Step 3: Display Results */}
              {step === 'results' && result && (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <ReceiptSummaryCard result={result} totalSpent={totalSpent} />
                  
                  <div className="space-y-3">
                    <PriceComparisonTable 
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

      <footer className="w-full max-w-md px-6 py-8 border-t border-slate-100 mt-auto">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setView('privacy')}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
            >
              Personvern
            </button>
            <button 
              onClick={() => setView('contact')}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
            >
              Kontakt oss
            </button>
          </div>
          <p className="text-[10px] text-slate-300 font-medium uppercase tracking-[0.2em]">
            © 2024 Matpris AS
          </p>
        </div>
      </footer>

      <div className="h-8" />
    </div>
  );
}
