import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Timer,
  Award,
  Sparkles,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { RaceEvent } from '../types';
import { CountdownTimer } from '../components/CountdownTimer';

const DEMO_EVENTS: RaceEvent[] = [
  {
    id: 'demo-1',
    title: 'Kathmandu Valley Trail Half Marathon 2026',
    description:
      'Conquer rugged forest singletracks, ridge climbs, and panoramic Himalayan viewpoints in our flagship trail running challenge.',
    event_date: new Date(Date.now() + 24 * 86400000).toISOString(),
    location: 'Shivapuri Nagarjun National Park, Kathmandu',
    sport_type: 'Trail Running',
    categories: ['10K Trail', '21K Half Marathon', '42K Ultra'],
    capacity: 300,
    price: 1500,
    currency: 'NPR',
    status: 'open',
    banner_url:
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1400&q=80',
    schedule_info: '06:30 AM Start',
    route_info: '920m elevation gain',
    created_at: new Date().toISOString(),
    registration_count: 142,
  },
  {
    id: 'demo-2',
    title: 'City Night Sprint 5K & 10K',
    description:
      'Fast, flat, neon-lit urban road race with live DJ pacing zones, chip timing, and finisher medals for all participants.',
    event_date: new Date(Date.now() + 45 * 86400000).toISOString(),
    location: 'Dasharath Stadium & Ring Road Circuit',
    sport_type: 'Road Running',
    categories: ['5K Fun Run', '10K Timed Race'],
    capacity: 500,
    price: 1000,
    currency: 'NPR',
    status: 'open',
    banner_url:
      'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1400&q=80',
    schedule_info: '07:00 PM Night Start',
    route_info: 'Flat asphalt loop',
    created_at: new Date().toISOString(),
    registration_count: 318,
  },
  {
    id: 'demo-3',
    title: 'Himalayan Gravel & MTB Enduro',
    description:
      'High-adrenaline cross-country mountain bike race combining fast gravel descents and technical climbs.',
    event_date: new Date(Date.now() + 68 * 86400000).toISOString(),
    location: 'Nagarkot to Dhulikhel Ridge',
    sport_type: 'Cycling',
    categories: ['25K Sport', '50K Pro Enduro'],
    capacity: 180,
    price: 2000,
    currency: 'NPR',
    status: 'open',
    banner_url:
      'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?auto=format&fit=crop&w=1400&q=80',
    schedule_info: '07:30 AM Flag Off',
    route_info: 'Mixed gravel & singletrack',
    created_at: new Date().toISOString(),
    registration_count: 95,
  },
];

export const LandingPage: React.FC = () => {
  const [events, setEvents] = useState<RaceEvent[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      if (!isSupabaseConfigured) {
        setEvents(DEMO_EVENTS);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .neq('status', 'draft')
        .order('event_date', { ascending: true });

      if (!error && data) {
        setEvents(data as RaceEvent[]);
      }
      setLoading(false);
    };

    loadEvents();
  }, []);

  const sportTypes = ['All', ...Array.from(new Set(events.map((e) => e.sport_type)))];

  const filteredEvents =
    selectedSport === 'All'
      ? events
      : events.filter((e) => e.sport_type === selectedSport);

  const featuredEvent = events.find((e) => e.status === 'open') || events[0];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800/80">
        {featuredEvent && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${featuredEvent.banner_url})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/70" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-lime-400">
                <Sparkles className="h-3.5 w-3.5" />
                2026 Race Season Registration Open
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
                PUSH YOUR LIMITS.{' '}
                <span className="bg-gradient-to-r from-lime-400 to-orange-400 bg-clip-text text-transparent">
                  OWN THE FINISH LINE.
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Discover sanctioned trail runs, city marathons, and mountain bike enduros.
                Claim your digital race bib in seconds and track your upcoming start lines.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#events-grid"
                  className="inline-flex items-center gap-2 rounded-xl bg-lime-500 px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-lime-500/25 transition hover:bg-lime-400"
                >
                  Browse All Races
                  <ArrowRight className="h-4 w-4" />
                </a>
                {featuredEvent && (
                  <Link
                    to={`/events/${featuredEvent.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-bold text-white transition hover:border-slate-500"
                  >
                    Register for Next Race
                  </Link>
                )}
              </div>
            </div>

            {/* Featured Race Countdown Card */}
            {featuredEvent && (
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-orange-400">
                    <span className="flex items-center gap-1.5">
                      <Timer className="h-4 w-4" />
                      Next Flag-Off
                    </span>
                    <span className="rounded-full bg-lime-500/15 px-2.5 py-0.5 text-lime-400">
                      {featuredEvent.sport_type}
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-extrabold text-white">
                    {featuredEvent.title}
                  </h2>
                  <div className="mt-3 space-y-1.5 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-lime-400" />
                      <span>
                        {new Date(featuredEvent.event_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-400" />
                      <span>{featuredEvent.location}</span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <CountdownTimer targetDate={featuredEvent.event_date} />
                  </div>

                  <Link
                    to={`/events/${featuredEvent.id}`}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-orange-400"
                  >
                    Claim Your Bib Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Events Listing Section */}
      <section id="events-grid" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              Upcoming Race Events
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Select an event to view course details, race categories, and register online.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {sportTypes.map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  selectedSport === sport
                    ? 'bg-lime-500 text-slate-950'
                    : 'border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-96 animate-pulse rounded-2xl border border-slate-800 bg-slate-900"
              />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <Award className="mx-auto h-12 w-12 text-slate-600" />
            <h3 className="mt-3 text-lg font-bold text-white">No events found</h3>
            <p className="mt-1 text-sm text-slate-400">
              Check back soon or switch category filters.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const categories = Array.isArray(event.categories) ? event.categories : [];
              return (
                <div
                  key={event.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 transition hover:border-lime-500/50 hover:shadow-xl hover:shadow-lime-500/5"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.banner_url}
                      alt={event.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    <span className="absolute left-3.5 top-3.5 rounded-full bg-slate-950/85 px-3 py-1 text-xs font-bold text-lime-400 backdrop-blur">
                      {event.sport_type}
                    </span>
                    <span
                      className={`absolute right-3.5 top-3.5 rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        event.status === 'open'
                          ? 'bg-emerald-500/90 text-slate-950'
                          : 'bg-red-500/90 text-white'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-orange-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>

                    <h3 className="mt-2 text-lg font-extrabold text-white group-hover:text-lime-400">
                      {event.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
                      {event.description}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                      <span className="truncate">{event.location}</span>
                    </div>

                    {/* Distance / Category Badges */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {categories.map((cat) => (
                        <span
                          key={cat}
                          className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[11px] font-semibold text-slate-200"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-5">
                      <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                        <div>
                          <span className="text-[11px] uppercase text-slate-500">
                            Entry Fee
                          </span>
                          <div className="text-base font-black text-white">
                            {event.price === 0
                              ? 'FREE'
                              : `${event.currency} ${event.price.toLocaleString()}`}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Users className="h-3.5 w-3.5 text-lime-400" />
                            {event.capacity} cap
                          </span>
                          <Link
                            to={`/events/${event.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-lime-500 px-3.5 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-lime-400"
                          >
                            Details
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
