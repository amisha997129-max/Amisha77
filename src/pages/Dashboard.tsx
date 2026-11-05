import { useEffect, useState } from 'react';
import {
  Users,
  Package,
  HeartHandshake,
  Building2,
  Droplet,
  AlertTriangle,
  TrendingUp,
  CalendarClock,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Donor, BloodInventory, BloodRequest, Camp, Page } from '@/types';
import { BloodGroupBadge } from '@/components/BloodGroupBadge';
import { StatCard } from '@/components/StatCard';

export function Dashboard({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [d, i, r, c] = await Promise.all([
        supabase.from('donors').select('*'),
        supabase.from('blood_inventory').select('*'),
        supabase.from('blood_requests').select('*'),
        supabase.from('camps').select('*').order('date', { ascending: true }),
      ]);
      setDonors(d.data ?? []);
      setInventory(i.data ?? []);
      setRequests(r.data ?? []);
      setCamps(c.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const totalUnits = inventory.reduce((s, x) => s + x.units, 0);
  const pendingRequests = requests.filter((r) => r.status === 'Pending').length;
  const lowStock = inventory.filter((i) => i.units < 5);
  const upcomingCamp = camps[0];

  const quickActions: { label: string; icon: typeof Users; page: Page; color: string }[] = [
    { label: 'Register Donor', icon: Users, page: 'donors', color: 'bg-blue-50 text-blue-600' },
    { label: 'View Inventory', icon: Package, page: 'inventory', color: 'bg-success-50 text-success-600' },
    { label: 'New Request', icon: HeartHandshake, page: 'requests', color: 'bg-primary-50 text-primary-600' },
    { label: 'View Camps', icon: CalendarClock, page: 'camps', color: 'bg-accent-50 text-accent-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time overview of your blood bank operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Donors"
          value={donors.length}
          icon={<Users className="w-6 h-6 text-white" />}
          accent="bg-blue-500"
          sublabel={`${donors.filter((d) => d.eligible).length} eligible`}
        />
        <StatCard
          label="Available Units"
          value={totalUnits}
          icon={<Droplet className="w-6 h-6 text-white" />}
          accent="bg-primary-600"
          sublabel="across all blood groups"
        />
        <StatCard
          label="Pending Requests"
          value={pendingRequests}
          icon={<HeartHandshake className="w-6 h-6 text-white" />}
          accent="bg-accent-500"
          sublabel={`${requests.length} total requests`}
        />
        <StatCard
          label="Camps Scheduled"
          value={camps.length}
          icon={<Building2 className="w-6 h-6 text-white" />}
          accent="bg-success-600"
          sublabel="upcoming events"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-primary-600" />
              <h2 className="font-bold text-slate-800">Blood Group Stock</h2>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {inventory.map((inv) => {
              const low = inv.units < 5;
              return (
                <div
                  key={inv.id}
                  className={`relative rounded-xl p-4 text-center border transition-all hover:scale-105 ${
                    low
                      ? 'bg-primary-50 border-primary-200 pulse-ring'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  {low && (
                    <AlertTriangle className="absolute top-2 right-2 w-3.5 h-3.5 text-primary-500" />
                  )}
                  <p className="font-extrabold text-slate-800 text-lg">{inv.blood_group}</p>
                  <p className={`text-2xl font-extrabold mt-1 ${low ? 'text-primary-600' : 'text-slate-700'}`}>
                    {inv.units}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">units</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  onClick={() => onNavigate(a.page)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 flex-1 text-left">{a.label}</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-primary-600" />
              <h2 className="font-bold text-slate-800">Recent Requests</h2>
            </div>
            <button
              onClick={() => onNavigate('requests')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </button>
          </div>
          <div className="space-y-2">
            {requests.slice(0, 4).map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <BloodGroupBadge group={req.blood_group} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{req.patient_name}</p>
                  <p className="text-xs text-slate-400 truncate">{req.hospital_name}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    req.urgency === 'Critical'
                      ? 'bg-primary-100 text-primary-700'
                      : req.urgency === 'Urgent'
                        ? 'bg-warning-100 text-warning-600'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {req.urgency}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold text-slate-800">Next Camp</h2>
          </div>
          {upcomingCamp ? (
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-5">
              <h3 className="font-bold text-slate-800">{upcomingCamp.title}</h3>
              <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4 text-primary-500" />
                  {new Date(upcomingCamp.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-success-600" />
                  {upcomingCamp.registered} registered
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-3">{upcomingCamp.location}</p>
              <button
                onClick={() => onNavigate('camps')}
                className="mt-4 w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
              >
                View Details
              </button>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No upcoming camps.</p>
          )}
        </div>
      </div>
    </div>
  );
}
