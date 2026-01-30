import React from 'react';

// Badge de Status customizado
const StatusBadge = ({ status }) => {
  const configs = {
    paid: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'Pago', dot: 'bg-emerald-500' },
    sent: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Enviado', dot: 'bg-blue-500' },
    draft: { bg: 'bg-slate-500/10', text: 'text-slate-400', label: 'Rascunho', dot: 'bg-slate-500' },
    overdue: { bg: 'bg-rose-500/10', text: 'text-rose-500', label: 'Atrasado', dot: 'bg-rose-500' },
  };

  const config = configs[status] || configs.draft;

  return (
    <div className={`px-3 py-1 rounded-full ${config.bg} ${config.text} text-[11px] font-bold flex items-center gap-2 w-fit`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </div>
  );
};

export default StatusBadge;
