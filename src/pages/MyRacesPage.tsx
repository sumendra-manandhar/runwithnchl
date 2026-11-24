import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Ticket, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Registration } from '../types';

export const MyRacesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMyRegistrations = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('registrations')
      .select('*, events(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRegistrations(data as Registration[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadMyRegistrations();
    }
  }, [user]);

  const handleCancel = async (regId: string) => {
    if (!confirm('Are you sure you want to cancel this race registration?')) return;
    await supabase
      .from('registrations')
      .update({ status: 'cancelled' })
      .eq('id', regId);
    loadMyRegistrations();
  };

  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">My Race Registrations</h1>
          <p className="mt-1 text-sm text-slate-400">
            View your assigned bib numbers, event passes, and participation status.
          </p>
        </div>
        <Link
          to="/"
          className="rounded-xl bg-lime-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-lime-400"
        >
          + Join Another Race
        </Link>
      </div>

      {loading ? (
        <div className="mt-10 text-sm text-slate-400">Loading your registrations...</div>
      ) : registrations.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-3 text-lg font-bold text-white">No races joined yet</h3>
          <p className="mt-1 text-sm text-slate-400">
            Browse upcoming events and claim your first bib number.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-xl bg-lime-500 px-5 py-2.5 text-xs font-extrabold text-slate-950"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                        reg.status === 'confirmed'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : reg.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      {reg.status}
                    </span>
                    <h3 className="mt-2 text-lg font-extrabold text-white">
                      {reg.events?.title || 'Race Event'}
                    </h3>
                  </div>

                  <div className="rounded-xl border border-lime-500/30 bg-lime-500/10 px-3.5 py-2 text-center">
                    <div className="text-[10px] font-bold uppercase text-lime-300">BIB</div>
                    <div className="text-lg font-black text-lime-400">{reg.bib_number}</div>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                  {reg.events?.event_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-lime-400" />
                      <span>
                        {new Date(reg.events.event_date).toLocaleDateString('en-US', {
                          dateStyle: 'medium',
                        })}
                      </span>
                    </div>
                  )}
                  {reg.events?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-orange-400" />
                      <span>{reg.events.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Ticket className="h-3.5 w-3.5 text-sky-400" />
                    <span>
                      Category: <strong className="text-slate-200">{reg.category}</strong> •
                      T-Shirt: <strong className="text-slate-200">{reg.tshirt_size}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {reg.status !== 'cancelled' && (
                <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                  <Link
                    to={`/events/${reg.event_id}`}
                    className="text-xs font-bold text-lime-400 hover:underline"
                  >
                    View Event Details
                  </Link>
                  <button
                    onClick={() => handleCancel(reg.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-400"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancel Entry
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
