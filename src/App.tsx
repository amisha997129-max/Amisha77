import { useState } from 'react';
import { Menu, Droplet } from 'lucide-react';
import type { Page } from '@/types';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { Donors } from '@/pages/Donors';
import { Inventory } from '@/pages/Inventory';
import { Requests } from '@/pages/Requests';
import { Camps } from '@/pages/Camps';

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dashboard',
  donors: 'Donor Management',
  inventory: 'Blood Inventory',
  requests: 'Blood Requests',
  camps: 'Camps & Events',
};

function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        current={page}
        onNavigate={setPage}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 lg:hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Droplet className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-bold text-slate-800">LifeFlow</span>
            </div>
            <span className="ml-auto text-sm font-medium text-slate-400">{PAGE_TITLES[page]}</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
          {page === 'donors' && <Donors />}
          {page === 'inventory' && <Inventory />}
          {page === 'requests' && <Requests />}
          {page === 'camps' && <Camps />}
        </main>
      </div>
    </div>
  );
}

export default App;
