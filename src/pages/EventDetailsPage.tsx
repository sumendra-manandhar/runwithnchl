import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Route,
  Users,
  CheckCircle2,
  ArrowLeft,
  Ticket,
  AlertCircle,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { RaceEvent, Registration } from '../types';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<RaceEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedReg, setConfirmedReg] = useState<Registration | null>(null);

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('28');
  const [gender, setGender] = useState('Male');
  const [category, setCategory] = useState('');
  const [tshirtSize, setTshirtSize] = useState('M');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [waiverAccepted, setWaiverAccepted] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || user?.email || '');
      setPhone(profile.phone || '');
      setEmergencyName(profile.emergency_contact_name || '');
      setEmergencyPhone(profile.emergency_contact_phone || '');
    } else if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        const ev = data as RaceEvent;
        setEvent(ev);
        if (Array.isArray(ev.categories) && ev.categories.length > 0) {
          setCategory(ev.categories[0]);
        }
      }
      setLoading(false);
    };

    fetchEvent();
  }, [id]);

  const generateBibNumber = () => {
    const prefix = (event?.sport_type || 'RP').slice(0, 2).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomNum}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      navigate(`/auth?redirect=/events/${id}`);
      return;
    }

    if (!waiverAccepted) {
      setErrorMsg('You must accept the race safety waiver to participate.');
      return;
    }

    if (!event) return;

    setSubmitting(true);
    const bibNumber = generateBibNumber();

    const { data, error } = await supabase
      .from('registrations')
      .insert({
        user_id: user.id,
        event_id: event.id,
        participant_name: fullName,
        participant_email: email,
        participant_phone: phone,
        age: age ? parseInt(age, 10) : null,
        gender,
        category,
        tshirt_size: tshirtSize,
        bib_number: bibNumber,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        medical_notes: medicalNotes,
        status: 'confirmed',
      })
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      if (error.code === '23505') {
        setErrorMsg('You are already registered in this race category.');
      } else {
        setErrorMsg(error.message);
      }
      return;
    }

    setConfirmedReg(data as Registration);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        Loading race brief...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white">Event Not Found</h2>
        <p className="mt-2 text-sm text-slate-400">
          Make sure Supabase is connected and the event exists.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-lime-500 px-4 py-2 text-sm font-bold text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Races
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Banner Header */}
      <div className="relative h-72 sm:h-96">
        <img
          src={event.banner_url}
          alt={event.title}
          className="h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-lime-400"
          >
            <ArrowLeft className="h-4 w-4" />
            All Events
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-lime-500 px-3 py-1 text-xs font-extrabold text-slate-950">
              {event.sport_type}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1 text-xs font-semibold uppercase text-slate-200">
              Status: {event.status}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mx-auto mt-8 grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Left: Event Info */}
        <div className="space-y-8 lg:col-span-7">
          <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-lime-400" />
              <div>
                <div className="text-xs font-bold uppercase text-slate-500">Date & Time</div>
                <div className="text-sm font-semibold text-white">
                  {new Date(event.event_date).toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-orange-400" />
              <div>
                <div className="text-xs font-bold uppercase text-slate-500">Venue</div>
                <div className="text-sm font-semibold text-white">{event.location}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 text-sky-400" />
              <div>
                <div className="text-xs font-bold uppercase text-slate-500">Capacity</div>
                <div className="text-sm font-semibold text-white">
                  {event.capacity} Athletes Max
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Ticket className="mt-0.5 h-5 w-5 text-emerald-400" />
              <div>
                <div className="text-xs font-bold uppercase text-slate-500">Entry Fee</div>
                <div className="text-sm font-semibold text-white">
                  {event.price === 0
                    ? 'Free Entry'
                    : `${event.currency} ${event.price.toLocaleString()}`}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-lg font-extrabold text-white">Race Overview</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300">
              {event.description}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center gap-2 text-lime-400">
                <Clock className="h-5 w-5" />
                <h3 className="font-extrabold text-white">Race Day Schedule</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {event.schedule_info}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center gap-2 text-orange-400">
                <Route className="h-5 w-5" />
                <h3 className="font-extrabold text-white">Course & Support</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {event.route_info}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Registration Form / Digital Pass */}
        <div className="lg:col-span-5">
          {confirmedReg ? (
            <div className="rounded-2xl border-2 border-lime-500 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center gap-2 text-lime-400">
                <CheckCircle2 className="h-6 w-6" />
                <span className="text-sm font-black uppercase tracking-wider">
                  Registration Confirmed
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-black text-white">
                You're on the Start List!
              </h3>

              <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-5 text-center">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Official Race Bib
                </div>
                <div className="mt-1 text-4xl font-black tracking-wider text-lime-400">
                  {confirmedReg.bib_number}
                </div>
                <div className="mt-3 text-sm font-bold text-white">
                  {confirmedReg.participant_name}
                </div>
                <div className="text-xs text-orange-400">
                  Category: {confirmedReg.category} • Tee: {confirmedReg.tshirt_size}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => window.print()}
                  className="w-full rounded-xl bg-lime-500 py-3 text-sm font-extrabold text-slate-950 hover:bg-lime-400"
                >
                  Print / Save Race Pass
                </button>
                <Link
                  to="/my-races"
                  className="w-full rounded-xl border border-slate-700 py-3 text-center text-sm font-bold text-white hover:bg-slate-800"
                >
                  Go to My Registrations
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h2 className="text-xl font-black text-white">Participant Registration</h2>
              <p className="mt-1 text-xs text-slate-400">
                Complete your athlete details below to secure your bib number.
              </p>

              {!user ? (
                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-6 text-center">
                  <p className="text-sm text-slate-300">
                    Sign in or create a free athlete account to register for this event.
                  </p>
                  <Link
                    to={`/auth?redirect=/events/${event.id}`}
                    className="mt-4 inline-block w-full rounded-xl bg-lime-500 px-4 py-3 text-sm font-extrabold text-slate-950 hover:bg-lime-400"
                  >
                    Sign In to Participate
                  </Link>
                </div>
              ) : event.status !== 'open' ? (
                <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  Registration for this race is currently closed.
                </div>
              ) : (
                <form onSubmit={handleRegister} className="mt-5 space-y-4">
                  {errorMsg && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-300">
                      Race Category / Distance *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-lime-500 focus:outline-none"
                    >
                      {(event.categories || []).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300">
                      Full Name (as on ID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-lime-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300">Email *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-lime-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300">Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+977 98..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-lime-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300">Age *</label>
                      <input
                        type="number"
                        min={10}
                        max={99}
                        required
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-lime-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-lime-500 focus:outline-none"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Non-binary</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300">Tee Size</label>
                      <select
                        value={tshirtSize}
                        onChange={(e) => setTshirtSize(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-lime-500 focus:outline-none"
                      >
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                          <option key={sz}>{sz}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300">
                        Emergency Contact *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contact Name"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-lime-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300">
                        Emergency Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+977 98..."
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-lime-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300">
                      Medical Conditions / Allergies (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. None, Asthma, Penicillin allergy"
                      value={medicalNotes}
                      onChange={(e) => setMedicalNotes(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-lime-500 focus:outline-none"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 pt-1 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={waiverAccepted}
                      onChange={(e) => setWaiverAccepted(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-lime-500"
                    />
                    <span>
                      I confirm I am physically fit to compete and agree to the official race
                      safety rules and liability waiver.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-lime-500 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-lime-500/20 transition hover:bg-lime-400 disabled:opacity-50"
                  >
                    {submitting ? 'Generating Bib...' : 'Confirm Race Registration'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
