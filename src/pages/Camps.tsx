import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, MapPin, Clock, Users, Loader2, CheckCircle2, CalendarPlus, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Camp } from '@/types';
import { Modal } from '@/components/Modal';

export function Camps() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [registeredCamp, setRegisteredCamp] = useState<Camp | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('camps').select('*').order('date', { ascending: true });
    setCamps(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRegister(camp: Camp) {
    setRegistering(camp.id);
    await supabase
      .from('camps')
      .update({ registered: camp.registered + 1 })
      .eq('id', camp.id);
    setRegistering(null);
    setRegisteredCamp({ ...camp, registered: camp.registered + 1 });
    load();
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return {
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      day: d.toLocaleDateString('en-US', { day: 'numeric' }),
      weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
      full: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };
  }

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
        <h1 className="text-2xl font-extrabold text-slate-800">Camps & Events</h1>
        <p className="text-slate-500 text-sm mt-1">Upcoming blood donation drives — register to save a life</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {camps.map((camp) => {
          const d = formatDate(camp.date);
          const isUpcoming = new Date(camp.date) >= new Date(new Date().toDateString());
          return (
            <div
              key={camp.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
            >
              <div className="flex">
                <div className="flex-shrink-0 w-24 bg-gradient-to-br from-primary-500 to-primary-700 p-4 flex flex-col items-center justify-center text-white">
                  <p className="text-xs font-medium uppercase tracking-wider opacity-80">{d.month}</p>
                  <p className="text-3xl font-extrabold leading-none mt-0.5">{d.day}</p>
                  <CalendarDays className="w-5 h-5 mt-2 opacity-60" />
                </div>

                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-800 group-hover:text-primary-700 transition-colors">{camp.title}</h3>
                    {isUpcoming && (
                      <span className="flex-shrink-0 text-xs font-medium text-success-700 bg-success-100 px-2 py-0.5 rounded-full">
                        Upcoming
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-500 mt-2">{camp.description}</p>

                  <div className="space-y-1.5 mt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" /> {camp.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" /> {camp.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      {camp.registered} registered donors
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={() => handleRegister(camp)}
                      disabled={registering === camp.id}
                      className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60"
                    >
                      {registering === camp.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CalendarPlus className="w-4 h-4" /> Register to Donate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!registeredCamp} onClose={() => setRegisteredCamp(null)} title="Registration Confirmed">
        {registeredCamp && (
          <div className="text-center py-2">
            <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success-600" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">You're registered!</h3>
            <p className="text-sm text-slate-500 mt-1">Thank you for choosing to save lives.</p>
            <div className="bg-slate-50 rounded-xl p-4 mt-5 text-left space-y-2">
              <p className="font-semibold text-slate-800">{registeredCamp.title}</p>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CalendarDays className="w-4 h-4 text-slate-400" />
                {formatDate(registeredCamp.date).full}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" /> {registeredCamp.time}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" /> {registeredCamp.location}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> We'll send you a reminder closer to the date.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
