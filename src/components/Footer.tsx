import React from 'react';

interface FooterProps {
  onPrivacyClick: () => void;
  onDashboardClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onPrivacyClick, onDashboardClick }) => {
  return (
    <footer className="w-full max-w-md px-6 py-12 mt-auto mx-auto">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <button 
            onClick={onDashboardClick}
            className="text-xs font-bold text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-widest"
          >
            Dashboard
          </button>
          <button 
            onClick={onPrivacyClick}
            className="text-xs font-bold text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-widest"
          >
            Personvern
          </button>
          <a 
            href="mailto:hei@prissjekk.no"
            className="text-xs font-bold text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-widest"
          >
            Kontakt
          </a>
        </div>
        <p className="text-[10px] font-medium text-slate-300 text-center leading-relaxed">
          © 2026 PrisSjekk. Sammenlign dagligvarepriser i Norge.<br />
          Laget med ❤️ i Norge.
        </p>
      </div>
    </footer>
  );
};
