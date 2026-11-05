import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  HeartHandshake,
  Loader2,
  Plus,
  Search,
  UserCheck,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { BloodRequest, Donor, BloodInventory, BloodGroup, Urgency, RequestStatus } from '@/types';
import { BLOOD_GROUPS } from '@/types';
import { BloodGroupBadge } from '@/components/BloodGroupBadge';
import { Modal } from '@/components/Modal';

const URGENCY_COLORS: Record<Urgency, string> = {
  Critical: 'bg-primary-100 text-primary-700',
  Urgent: 'bg-warning-100 text-warning-600',
  Normal: 'bg-slate-100 text-slate-500',
};

const STATUS_COLORS: Record<RequestStatus, string> = {
  Pending: 'bg-warning-100 text-warning-600',
  Approved: 'bg-blue-100 text-blue-700',
  Fulfilled: 'bg-success-100 text-success-700',
  Rejected: 'bg-slate-100 text-slate-500',
};

const STATUS_ICONS: Record<RequestStatus, typeof Clock> = {
  Pending: Clock,
  Approved: UserCheck,
  Fulfilled: CheckCircle2,
  Rejected: XCircle,
};

export function Requests() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [matchModal, setMatchModal] = useState<BloodRequest | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');

  const [form, setForm] = useState({
    patient_name: '',
    blood_group: '' as BloodGroup | '',
    units_needed: '1',
    urgency: 'Normal' as Urgency,
    hospital_name: '',
    contact: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    const [r, d, i] = await Promise.all([
      supabase.from('blood_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('donors').select('*'),
      supabase.from('blood_inventory').select('*'),
    ]);
    setRequests(r.data ?? []);
    setDonors(d.data ?? []);
    setInventory(i.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.patient_name || !form.blood_group || !form.hospital_name || !form.contact) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('blood_requests').insert({
      patient_name: form.patient_name,
      blood_group: form.blood_group,
      units_needed: parseInt(form.units_needed) || 1,
      urgency: form.urgency,
      hospital_name: form.hospital_name,
      contact: form.contact,
      status: 'Pending',
    });
    setSaving(false);
    if (error) {
      setFormError('Could not submit the request. Please try again.');
      return;
    }
    setForm({ patient_name: '', blood_group: '', units_needed: '1', urgency: 'Normal', hospital_name: '', contact: '' });
    setModalOpen(false);
    load();
  }

  async function updateStatus(id: string, status: RequestStatus) {
    await supabase.from('blood_requests').update({ status }).eq('id', id);
    load();
  }

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  const matchedDonors = useMemo(() => {
    if (!matchModal) return [];
    return donors
      .filter((d) => d.blood_group === matchModal.blood_group && d.eligible)
      .slice(0, 8);
  }, [matchModal, donors]);

  const matchedStock = useMemo(() => {
    if (!matchModal) return 0;
    return inventory.find((i) => i.blood_group === matchModal.blood_group)?.units ?? 0;
  }, [matchModal, inventory]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Blood Requests</h1>
          <p className="text-slate-500 text-sm mt-1">Manage incoming requests and find matching donors</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-primary-200 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'Pending', 'Approved', 'Fulfilled', 'Rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === s
                ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {s === 'all' ? 'All Requests' : s}
            {s !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({requests.filter((r) => r.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <HeartHandshake className="w-8 h-8 mb-2" />
            <p className="text-sm">No requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-left font-semibold px-5 py-3">Patient</th>
                  <th className="text-left font-semibold px-5 py-3">Blood Group</th>
                  <th className="text-left font-semibold px-5 py-3">Units</th>
                  <th className="text-left font-semibold px-5 py-3">Urgency</th>
                  <th className="text-left font-semibold px-5 py-3">Hospital</th>
                  <th className="text-left font-semibold px-5 py-3">Status</th>
                  <th className="text-right font-semibold px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => {
                  const StatusIcon = STATUS_ICONS[req.status];
                  return (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">{req.patient_name}</p>
                        <p className="text-xs text-slate-400">{req.contact}</p>
                      </td>
                      <td className="px-5 py-4"><BloodGroupBadge group={req.blood_group} size="sm" /></td>
                      <td className="px-5 py-4 font-semibold text-slate-700">{req.units_needed}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${URGENCY_COLORS[req.urgency]}`}>
                          {req.urgency}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 text-xs max-w-[180px] truncate">{req.hospital_name}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[req.status]}`}>
                          <StatusIcon className="w-3.5 h-3.5" /> {req.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setMatchModal(req)}
                            className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Find Match
                          </button>
                          {req.status === 'Pending' && (
                            <button
                              onClick={() => updateStatus(req.id, 'Approved')}
                              className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {req.status === 'Approved' && (
                            <button
                              onClick={() => updateStatus(req.id, 'Fulfilled')}
                              className="text-xs font-medium text-success-700 hover:text-success-800 bg-success-100 hover:bg-success-200 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Fulfill
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Blood Request">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-primary-50 border border-primary-200 text-primary-700 text-sm px-4 py-2.5 rounded-xl">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Patient Name *">
              <input value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} className="form-input" placeholder="Patient name" />
            </Field>
            <Field label="Required Blood Group *">
              <select value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value as BloodGroup })} className="form-input">
                <option value="">Select...</option>
                {BLOOD_GROUPS.map((g) => (<option key={g} value={g}>{g}</option>))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Units Needed *">
              <input type="number" min={1} value={form.units_needed} onChange={(e) => setForm({ ...form, units_needed: e.target.value })} className="form-input" />
            </Field>
            <Field label="Urgency Level">
              <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value as Urgency })} className="form-input">
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Critical">Critical</option>
              </select>
            </Field>
          </div>
          <Field label="Hospital Name *">
            <input value={form.hospital_name} onChange={(e) => setForm({ ...form, hospital_name: e.target.value })} className="form-input" placeholder="Hospital name" />
          </Field>
          <Field label="Contact Number *">
            <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="form-input" placeholder="Contact number" />
          </Field>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="form-btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="form-btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!matchModal} onClose={() => setMatchModal(null)} title={`Matching Results — ${matchModal?.blood_group ?? ''}`}>
        {matchModal && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Package className="w-4 h-4" /> In Stock
                </div>
                <p className={`text-2xl font-extrabold ${matchedStock >= matchModal.units_needed ? 'text-success-600' : 'text-primary-600'}`}>
                  {matchedStock} units
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {matchedStock >= matchModal.units_needed
                    ? 'Sufficient stock available'
                    : `Short by ${matchModal.units_needed - matchedStock} unit(s)`}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <UserCheck className="w-4 h-4" /> Eligible Donors
                </div>
                <p className="text-2xl font-extrabold text-slate-800">{matchedDonors.length}</p>
                <p className="text-xs text-slate-400 mt-0.5">matching {matchModal.blood_group} donors</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Suggested Donors</h3>
              {matchedDonors.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-50 rounded-xl p-4">
                  <Search className="w-4 h-4" /> No eligible donors found for this blood group.
                </div>
              ) : (
                <div className="space-y-2">
                  {matchedDonors.map((d) => (
                    <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {d.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{d.name}</p>
                        <p className="text-xs text-slate-400">{d.phone} · {d.city}</p>
                      </div>
                      <BloodGroupBadge group={d.blood_group} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .form-input { width: 100%; padding: 0.625rem 0.875rem; font-size: 0.875rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; outline: none; transition: all 0.15s; }
        .form-input:focus { border-color: #f87171; box-shadow: 0 0 0 3px #fee2e2; }
        .form-btn-primary { flex: 1; background: #dc2626; color: white; font-size: 0.875rem; font-weight: 600; padding: 0.625rem 1rem; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: background 0.15s; }
        .form-btn-primary:hover { background: #b91c1c; }
        .form-btn-primary:disabled { opacity: 0.6; }
        .form-btn-secondary { flex: 1; background: #f1f5f9; color: #475569; font-size: 0.875rem; font-weight: 600; padding: 0.625rem 1rem; border-radius: 0.75rem; transition: background 0.15s; }
        .form-btn-secondary:hover { background: #e2e8f0; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
