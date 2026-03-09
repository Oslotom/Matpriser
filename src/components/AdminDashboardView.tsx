import React, { useEffect, useState } from 'react';
import { Users, FileText, Package, TrendingUp, ArrowLeft, Search, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Stats {
  visitors: number;
  uploads: number;
  products: number;
  totalItems: number;
  weekly: { name: string; uploads: number }[];
}

interface ProductPrice {
  product_id: string;
  standardized_name: string;
  store_chain: string;
  price: number;
  purchase_date: string;
}

interface DashboardProps {
  onBack: () => void;
}

/**
 * AdminDashboardView - Provides analytics and search capabilities for administrators
 * Displays usage statistics, growth charts, and product price history.
 */
export const AdminDashboardView: React.FC<DashboardProps> = ({ onBack }) => {
  // --- State Management ---
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductPrice[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- Side Effects ---
  
  /**
   * Fetch aggregate statistics on mount
   */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  /**
   * Handle debounced product search
   */
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          setSearchResults(data);
        } catch (err) {
          console.error('Search failed:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // --- Sub-components ---
  
  /**
   * StatCard - A reusable card for displaying a single metric
   */
  const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: number | string, color: string }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3"
    >
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="text-white w-5 h-5" />
      </div>
      <div>
        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{label}</h3>
        <p className="text-xl font-display font-black text-slate-900">{value}</p>
      </div>
    </motion.div>
  );

  // --- Render ---
  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-600 hover:text-slate-900 transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-display font-extrabold text-slate-900">Dashboard</h2>
      </div>

      {loading ? (
        /* Loading State */
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stats ? (
        <>
          {/* Stats Grid: Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard 
              icon={Users} 
              label="Besøkende" 
              value={stats.visitors} 
              color="bg-blue-500" 
            />
            <StatCard 
              icon={FileText} 
              label="Kvitteringer" 
              value={stats.uploads} 
              color="bg-emerald-500" 
            />
            <StatCard 
              icon={Package} 
              label="Produkter" 
              value={stats.products} 
              color="bg-amber-500" 
            />
            <StatCard 
              icon={TrendingUp} 
              label="Prispunkter" 
              value={stats.totalItems} 
              color="bg-indigo-500" 
            />
          </div>

          {/* Weekly Growth Chart */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
          >
            <h3 className="text-slate-800 font-display font-bold mb-6">Opplastinger per uke</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weekly}>
                  <defs>
                    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="uploads" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorUploads)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Product Price Search Section */}
          <div className="space-y-4">
            <h3 className="text-slate-800 font-display font-bold px-2">Søk i prishistorikk</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Søk etter produkt (f.eks. melk)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Search Results Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              {searchResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                        <th className="px-4 py-3">Produkt</th>
                        <th className="px-4 py-3">Kjede</th>
                        <th className="px-4 py-3">Pris</th>
                        <th className="px-4 py-3">Dato</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {searchResults.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-900">{item.standardized_name}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
                              {item.store_chain}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-emerald-600">{item.price.toFixed(2)} kr</td>
                          <td className="px-4 py-3 text-slate-400 text-xs flex items-center gap-1">
                            <Calendar size={12} />
                            {item.purchase_date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Ingen produkter funnet for "{searchQuery}"
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Begynn å skrive for å søke i databasen
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Error State */
        <div className="p-8 bg-red-50 text-red-600 rounded-3xl text-center font-medium">
          Klarte ikke å hente statistikk.
        </div>
      )}
    </div>
  );
};
