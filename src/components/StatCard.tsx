import type { ReactNode } from 'react';

export function StatCard({
  label,
  value,
  icon,
  accent,
  sublabel,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  accent: string;
  sublabel?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-shadow group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">{value}</p>
          {sublabel && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${accent}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
