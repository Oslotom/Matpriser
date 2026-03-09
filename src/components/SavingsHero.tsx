import React from 'react';
import { TrendingDown, CheckCircle2 } from 'lucide-react';
import { CountUp } from './CountUp';

interface SavingsHeroProps {
  totalSavings: number;
}

export const SavingsHero: React.FC<SavingsHeroProps> = ({ totalSavings }) => {
  return (
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
  );
};
