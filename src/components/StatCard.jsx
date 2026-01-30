import React from 'react';
import { TrendingUp } from 'lucide-react';

// Cartão de Estatística (Métricas)
const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] hover:border-slate-700 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
        <Icon className={`${color.replace('bg-', 'text-')}`} size={24} />
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center gap-1`}>
        <TrendingUp size={12} /> {change}
      </span>
    </div>
    <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
  </div>
);

export default StatCard;
