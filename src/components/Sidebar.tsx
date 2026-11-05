import { Droplet, LayoutDashboard, Users, Package, HeartHandshake, CalendarDays, type LucideIcon } from 'lucide-react';
import type { Page } from '@/types';

const NAV_ITEMS: { id: Page; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'donors', label: 'Donor Management', icon: Users },
  { id: 'inventory', label: 'Blood Inventory', icon: Package },
  { id: 'requests', label: 'Blood Requests', icon: HeartHandshake },
  { id: 'camps', label: 'Camps & Events', icon: CalendarDays },
];

export function Sidebar({
  current,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}: {
  current: Page;
  onNavigate: (page: Page) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-200">
            <Droplet className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 text-lg leading-none">LifeFlow</h1>
            <p className="text-xs text-slate-400 mt-0.5">Blood Bank System</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = current === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : ''}`} />
                {item.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />}
              </button>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-700">Donate Blood</p>
            <p className="text-xs text-slate-500 mt-1">Every donation saves up to 3 lives.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
