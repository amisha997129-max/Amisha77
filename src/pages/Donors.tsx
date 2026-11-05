import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, UserPlus, Phone, Mail, MapPin, Calendar, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Donor, BloodGroup } from '@/types';
import { BLOOD_GROUPS } from '@/types';
import { BloodGroupBadge } from '@/components/BloodGroupBadge';
import { Modal } from '@/components/Modal';

export function Donors() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<BloodGroup | 'all'>('all');
  const [eligibleFilter, setEligibleFilter] = useState<'all' | 'eligible' | 'ineligible'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    age: '',
    blood_group: '' as BloodGroup | '',
    phone: '',
    email: '',
    last_donation_date: '',
    city: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('donors').select('*').order('created_at', { ascending: false });
    setDonors(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return donors.filter((d) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        (d.email?.toLowerCase().includes(q) ?? false) ||
        d.city.toLowerCase().includes(q);
      const matchesGroup = groupFilter === 'all' || d.blood_group === groupFilter;
      const matchesEligible =
        eligibleFilter === 'all' ||
        (eligibleFilter === 'eligible' ? d.eligible : !d.eligible);
      return matchesSearch && matchesGroup && matchesEligible;
    });
  }, [donors, search, groupFilter, eligibleFilter]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.name || !form.age || !form.blood_group || !form.phone || !form.city) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    const lastDate = form.last_donation_date || null;
    const eligible = lastDate
      ? (Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24 * 90) >= 1
      : true;
    const { error } = await supabase.from('donors').insert({
      name: form.name,
      age: parseInt(form.age),
      blood_group: form.blood_group,
      phone: form.phone,
      email: form.email || null,
      last_donation_date: lastDate,
      city: form.city,
      eligible,
    });
    setSaving(false);
    if (error) {
      setFormError('Could not save the donor. Please try again.');
      return;
    }
    setForm({ name: '', age: '', blood_group: '', phone: '', email: '', last_donation_date: '', city: '' });
    setModalOpen(false);
    load();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Donor Management</h1>
          <p className="text-slate-500 text-sm mt-1">{donors.length} registered donors</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-primary-200 transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Register Donor
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email, or city..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
          />
        </div>
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value as BloodGroup | 'all')}
          className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 bg-white"
        >
          <option value="all">All Blood Groups</option>
          {BLOOD_GROUPS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          value={eligibleFilter}
          onChange={(e) => setEligibleFilter(e.target.value as 'all' | 'eligible' | 'ineligible')}
          className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 bg-white"
        >
          <option value="all">All Status</option>
          <option value="eligible">Eligible</option>
          <option value="ineligible">Not Eligible</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <Search className="w-8 h-8 mb-2" />
            <p className="text-sm">No donors match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-left font-semibold px-5 py-3">Donor</th>
                  <th className="text-left font-semibold px-5 py-3">Blood Group</th>
                  <th className="text-left font-semibold px-5 py-3">Contact</th>
                  <th className="text-left font-semibold px-5 py-3">City</th>
                  <th className="text-left font-semibold px-5 py-3">Last Donation</th>
                  <th className="text-left font-semibold px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs">
                          {d.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{d.name}</p>
                          <p className="text-xs text-slate-400">{d.age} years old</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><BloodGroupBadge group={d.blood_group} size="sm" /></td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{d.phone}</span>
                        {d.email && <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{d.email}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600"><span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" />{d.city}</span></td>
                    <td className="px-5 py-4 text-slate-600 text-xs">
                      {d.last_donation_date ? (
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" />{new Date(d.last_donation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      ) : (
                        <span className="text-slate-300">Never</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {d.eligible ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success-700 bg-success-100 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5" /> Not Eligible
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register New Donor">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-primary-50 border border-primary-200 text-primary-700 text-sm px-4 py-2.5 rounded-xl">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name *">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="form-input"
                placeholder="John Doe"
              />
            </Field>
            <Field label="Age *">
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="form-input"
                placeholder="28"
                min={18}
                max={65}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Blood Group *">
              <select
                value={form.blood_group}
                onChange={(e) => setForm({ ...form, blood_group: e.target.value as BloodGroup })}
                className="form-input"
              >
                <option value="">Select...</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </Field>
            <Field label="City / Location *">
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="form-input"
                placeholder="Mumbai"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone Number *">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="form-input"
                placeholder="9876543210"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="form-input"
                placeholder="john@email.com"
              />
            </Field>
          </div>
          <Field label="Last Donation Date">
            <input
              type="date"
              value={form.last_donation_date}
              onChange={(e) => setForm({ ...form, last_donation_date: e.target.value })}
              className="form-input"
            />
          </Field>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="form-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="form-btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Donor'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .form-input {
          width: 100%; padding: 0.625rem 0.875rem; font-size: 0.875rem;
          border: 1px solid #e2e8f0; border-radius: 0.75rem;
          outline: none; transition: all 0.15s;
        }
        .form-input:focus { border-color: #f87171; box-shadow: 0 0 0 3px #fee2e2; }
        .form-btn-primary {
          flex: 1; background: #dc2626; color: white; font-size: 0.875rem; font-weight: 600;
          padding: 0.625rem 1rem; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: background 0.15s;
        }
        .form-btn-primary:hover { background: #b91c1c; }
        .form-btn-primary:disabled { opacity: 0.6; }
        .form-btn-secondary {
          flex: 1; background: #f1f5f9; color: #475569; font-size: 0.875rem; font-weight: 600;
          padding: 0.625rem 1rem; border-radius: 0.75rem; transition: background 0.15s;
        }
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
