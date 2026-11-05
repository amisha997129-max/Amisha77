import { useEffect, useState, type ReactNode } from 'react';
import { Droplet } from 'lucide-react';

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    } else {
      const t = setTimeout(() => setShow(false), 200);
      document.body.style.overflow = '';
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open && !show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-lg bg-white rounded-2xl shadow-2xl transition-all duration-200 ${
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <Droplet className="w-4 h-4 text-primary-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto scrollbar-thin">{children}</div>
      </div>
    </div>
  );
}
