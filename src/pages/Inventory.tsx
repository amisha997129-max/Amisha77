import { useCallback, useEffect, useState } from 'react';
import { Droplet, AlertTriangle, TrendingUp, TrendingDown, Loader2, Minus, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { BloodInventory, BloodGroup } from '@/types';
import { BLOOD_GROUPS } from '@/types';

const LOW_STOCK_THRESHOLD = 5;

const BAR_MAX = 55;

export function Inventory() {
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('blood_inventory').select('*').order('blood_group');
    setInventory(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function adjust(id: string, delta: number, current: number) {
    const newUnits = Math.max(0, current + delta);
    setAdjusting(id);
    await supabase
      .from('blood_inventory')
      .update({ units: newUnits, updated_at: new Date().toISOString() })
      .eq('id', id);
    setAdjusting(null);
    load();
  }

  const total = inventory.reduce((s, x) => s + x.units, 0);
  const lowStock = inventory.filter((i) => i.units < LOW_STOCK_THRESHOLD);
  const maxGroup = [...inventory].sort((a, b) => b.units - a.units)[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Blood Inventory</h1>
        <p className="text-slate-500 text-sm mt-1">Monitor and manage blood stock levels in real time</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <Droplet className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Units</p>
            <p className="text-2xl font-extrabold text-slate-800">{total}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success-50 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-success-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Best Stocked</p>
            <p className="text-2xl font-extrabold text-slate-800">
              {maxGroup?.blood_group} <span className="text-base font-medium text-slate-400">({maxGroup?.units})</span>
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Low Stock Alerts</p>
            <p className="text-2xl font-extrabold text-slate-800">
              {lowStock.length} <span className="text-base font-medium text-slate-400">groups below {LOW_STOCK_THRESHOLD} units</span>
            </p>
          </div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-primary-800">Critical low stock detected</p>
            <p className="text-sm text-primary-600 mt-0.5">
              {lowStock.map((l) => l.blood_group).join(', ')} — please alert donors and schedule collection drives.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {BLOOD_GROUPS.map((group) => {
          const inv = inventory.find((i) => i.blood_group === group);
          const units = inv?.units ?? 0;
          const low = units < LOW_STOCK_THRESHOLD;
          const pct = Math.min(100, (units / BAR_MAX) * 100);
          return (
            <div
              key={group}
              className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-lg ${
                low ? 'border-primary-300 shadow-primary-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white ${
                      low ? 'bg-primary-600' : 'bg-gradient-to-br from-primary-400 to-primary-600'
                    }`}
                  >
                    {group}
                  </div>
                  {low && (
                    <span className="flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Low
                    </span>
                  )}
                </div>
                {low ? (
                  <TrendingDown className="w-5 h-5 text-primary-500" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-success-500" />
                )}
              </div>

              <p className="text-3xl font-extrabold text-slate-800">{units}</p>
              <p className="text-xs text-slate-400 mb-3">units available</p>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${low ? 'bg-primary-500' : 'bg-gradient-to-r from-primary-400 to-primary-600'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => inv && adjust(inv.id, -1, units)}
                  disabled={adjusting === inv?.id || units === 0}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-slate-500 w-12 text-center">{units} u</span>
                <button
                  onClick={() => inv && adjust(inv.id, 1, units)}
                  disabled={adjusting === inv?.id}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-600 text-sm font-medium transition-colors disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
