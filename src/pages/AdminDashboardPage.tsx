import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  Search,
  Shield,
  Users,
  Calendar,
  CheckCircle,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { RaceEvent, Registration, Profile, EventStatus } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'events' | 'participants' | 'users'>('events');

  const [events, setEvents] = useState<RaceEvent[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEventId, setFilterEventId] = useState('all');

  // Event Modal Form State
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<RaceEvent | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [sportType, setSportType] = useState('Trail Running');
  const [categoriesInput, setCategoriesInput] = useState('5K, 10K, 21K');
  const [capacity, setCapacity] = useState('250');
  const [price, setPrice] = useState('1500');
  const [currency, setCurrency] = useState('NPR');
  const [status, setStatus] = useState<EventStatus>('open');
  const [bannerUrl, setBannerUrl] = useState(
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1400&q=80'
  );
  const [scheduleInfo, setScheduleInfo] = useState(
    '06:00 AM Check-in | 07:00 AM Race Start | 11:00 AM Podium Ceremony'
  );
  const [routeInfo, setRouteInfo] = useState(
    'Marked course with hydration stations every 3km and medical crew.'
  );

  const fetchAllAdminData = async () => {
    setLoading(true);
    const [evRes, regRes, usrRes] = await Promise.all([
      supabase.from('events').select('*').order('event_date', { ascending: true }),
      supabase
        .from('registrations')
        .select('*, events(title)')
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    ]);

    if (evRes.data) setEvents(evRes.data as RaceEvent[]);
    if (regRes.data) setRegistrations(regRes.data as Registration[]);
    if (usrRes.data) setUsers(usrRes.data as Profile[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllAdminData();
    }
  }, [isAdmin]);

  if (!authLoading && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setEventDate('');
    setLocation('');
    setSportType('Trail Running');
    setCategoriesInput('5K, 10K, 21K');
    setCapacity('250');
    setPrice('1500');
    setCurrency('NPR');
    setStatus('open');
    setBannerUrl(
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1400&q=80'
    );
    setShowEventModal(true);
  };

  const openEditModal = (ev: RaceEvent) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setDescription(ev.description);
    setEventDate(new Date(ev.event_date).toISOString().slice(0, 16));
    setLocation(ev.location);
    setSportType(ev.sport_type);
    setCategoriesInput((ev.categories || []).join(', '));
    setCapacity(String(ev.capacity));
    setPrice(String(ev.price));
    setCurrency(ev.currency || 'NPR');
    setStatus(ev.status);
    setBannerUrl(ev.banner_url);
    setScheduleInfo(ev.schedule_info || '');
    setRouteInfo(ev.route_info || '');
    setShowEventModal(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoriesArray = categoriesInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const payload = {
      title,
      description,
      event_date: new Date(eventDate).toISOString(),
      location,
      sport_type: sportType,
      categories: categoriesArray,
      capacity: parseInt(capacity, 10) || 100,
      price: parseFloat(price) || 0,
      currency,
      status,
      banner_url: bannerUrl,
      schedule_info: scheduleInfo,
      route_info: routeInfo,
    };

    if (editingEvent) {
      await supabase.from('events').update(payload).eq('id', editingEvent.id);
    } else {
      await supabase.from('events').insert(payload);
    }

    setShowEventModal(false);
    fetchAllAdminData();
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Delete this event and all associated registrations?')) return;
    await supabase.from('events').delete().eq('id', id);
    fetchAllAdminData();
  };

  const handleUpdateRegistrationStatus = async (
    regId: string,
    newStatus: 'confirmed' | 'pending' | 'cancelled'
  ) => {
    await supabase.from('registrations').update({ status: newStatus }).eq('id', regId);
    fetchAllAdminData();
  };

  const handleEditBib = async (reg: Registration) => {
    const newBib = prompt('Enter new Bib Number:', reg.bib_number);
    if (!newBib || newBib === reg.bib_number) return;
    await supabase.from('registrations').update({ bib_number: newBib }).eq('id', reg.id);
    fetchAllAdminData();
  };

  const handleToggleUserRole = async (u: Profile) => {
    const nextRole = u.role === 'admin' ? 'participant' : 'admin';
    if (!confirm(`Change ${u.full_name}'s role to ${nextRole.toUpperCase()}?`)) return;
    await supabase.from('profiles').update({ role: nextRole }).eq('id', u.id);
    fetchAllAdminData();
  };

  const handleToggleUserActive = async (u: Profile) => {
    await supabase.from('profiles').update({ is_active: !u.is_active }).eq('id', u.id);
    fetchAllAdminData();
  };

  const filteredRegistrations = registrations.filter((r) => {
    const matchesEvent = filterEventId === 'all' || r.event_id === filterEventId;
    const q = searchTerm.toLowerCase();
    const matchesQuery =
      r.participant_name.toLowerCase().includes(q) ||
      r.participant_email.toLowerCase().includes(q) ||
      r.bib_number.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q);
    return matchesEvent && matchesQuery;
  });

  const exportCsv = () => {
    const headers = [
      'Bib Number',
      'Event',
      'Category',
      'Participant Name',
      'Email',
      'Phone',
      'Age',
      'Gender',
      'T-Shirt',
      'Emergency Contact',
      'Emergency Phone',
      'Medical Notes',
      'Status',
    ];
    const rows = filteredRegistrations.map((r) => [
      r.bib_number,
      r.events?.title || '',
      r.category,
      r.participant_name,
      r.participant_email,
      r.participant_phone,
      r.age ?? '',
      r.gender ?? '',
      r.tshirt_size,
      r.emergency_contact_name,
      r.emergency_contact_phone,
      r.medical_notes,
      r.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `racepulse-participants-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black text-white">Race Director Admin Panel</h1>
          <p className="mt-1 text-sm text-slate-400">
            Create & manage race events, assign bibs, export check-in sheets, and manage users.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-lime-500 px-4 py-2.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-lime-500/20 hover:bg-lime-400"
        >
          <Plus className="h-4 w-4" />
          Add New Race / Event
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400">
            <span>Total Events</span>
            <Calendar className="h-4 w-4 text-lime-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">{events.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400">
            <span>Total Registrations</span>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">{registrations.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400">
            <span>Confirmed Athletes</span>
            <Users className="h-4 w-4 text-orange-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">
            {registrations.filter((r) => r.status === 'confirmed').length}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400">
            <span>Registered Accounts</span>
            <Shield className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">{users.length}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-8 flex gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'events', label: `Races & Events (${events.length})` },
          { id: 'participants', label: `Participants (${registrations.length})` },
          { id: 'users', label: `User Accounts (${users.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === t.id
                ? 'bg-lime-500 text-slate-950'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-sm text-slate-400">Loading admin records...</div>
      ) : activeTab === 'events' ? (
        /* EVENTS MANAGEMENT TAB */
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3.5">Event</th>
                <th className="px-4 py-3.5">Date & Location</th>
                <th className="px-4 py-3.5">Categories</th>
                <th className="px-4 py-3.5">Fee / Cap</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-4">
                    <div className="font-bold text-white">{ev.title}</div>
                    <div className="text-xs text-slate-400">{ev.sport_type}</div>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-300">
                    <div>{new Date(ev.event_date).toLocaleDateString()}</div>
                    <div className="text-slate-400">{ev.location}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(ev.categories || []).map((c) => (
                        <span
                          key={c}
                          className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-200"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-300">
                    <div className="font-bold">
                      {ev.currency} {ev.price}
                    </div>
                    <div className="text-slate-400">{ev.capacity} max</div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                        ev.status === 'open'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : ev.status === 'closed'
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {ev.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(ev)}
                        className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-lime-500 hover:text-lime-400"
                        title="Edit Event"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-red-500 hover:text-red-400"
                        title="Delete Event"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'participants' ? (
        /* PARTICIPANTS MANAGEMENT TAB */
        <div className="mt-6 space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row">
            <div className="flex flex-1 flex-wrap gap-3">
              <div className="relative min-w-[240px] flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search athlete, email, bib, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-xs text-white focus:border-lime-500 focus:outline-none"
                />
              </div>

              <select
                value={filterEventId}
                onChange={(e) => setFilterEventId(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-lime-500 focus:outline-none"
              >
                <option value="all">All Races</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-lime-400 hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              Export CSV Check-in Sheet
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3.5">Bib #</th>
                  <th className="px-4 py-3.5">Athlete</th>
                  <th className="px-4 py-3.5">Race & Category</th>
                  <th className="px-4 py-3.5">Emergency & Medical</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleEditBib(reg)}
                        className="rounded-md bg-lime-500/15 px-2.5 py-1 font-black text-lime-400 hover:bg-lime-500/25"
                        title="Click to edit Bib Number"
                      >
                        {reg.bib_number}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white">{reg.participant_name}</div>
                      <div className="text-slate-400">
                        {reg.participant_email} • {reg.participant_phone}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Age: {reg.age || '-'} | {reg.gender} | Tee: {reg.tshirt_size}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-200">
                        {reg.events?.title}
                      </div>
                      <div className="text-orange-400">{reg.category}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      <div>
                        SOS: {reg.emergency_contact_name} ({reg.emergency_contact_phone})
                      </div>
                      {reg.medical_notes && (
                        <div className="text-amber-400">Med: {reg.medical_notes}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={reg.status}
                        onChange={(e) =>
                          handleUpdateRegistrationStatus(reg.id, e.target.value as any)
                        }
                        className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-bold text-white"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleEditBib(reg)}
                        className="text-xs font-semibold text-slate-400 hover:text-lime-400"
                      >
                        Edit Bib
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* USERS MANAGEMENT TAB */
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3.5">User</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Account Status</th>
                <th className="px-4 py-3.5">Joined</th>
                <th className="px-4 py-3.5 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white">{u.full_name || 'Unnamed User'}</div>
                    <div className="text-slate-400">{u.email}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`font-semibold ${
                        u.is_active ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => handleToggleUserRole(u)}
                        className="rounded-lg border border-slate-700 px-2.5 py-1 font-semibold text-slate-200 hover:border-orange-400 hover:text-orange-400"
                      >
                        {u.role === 'admin' ? 'Demote to User' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => handleToggleUserActive(u)}
                        className="rounded-lg border border-slate-700 px-2.5 py-1 font-semibold text-slate-200 hover:border-red-400 hover:text-red-400"
                      >
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-black text-white">
                {editingEvent ? 'Edit Race Event' : 'Create New Race Event'}
              </h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300">Event Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pokhara Lakeside Marathon 2026"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    Date & Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">Sport Type *</label>
                  <input
                    type="text"
                    required
                    value={sportType}
                    onChange={(e) => setSportType(e.target.value)}
                    placeholder="Trail Running, Road Running, Cycling"
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Venue / Location *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Race Categories (comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={categoriesInput}
                  onChange={(e) => setCategoriesInput(e.target.value)}
                  placeholder="5K Fun Run, 10K Open, 21K Half Marathon"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300">Capacity</label>
                  <input
                    type="number"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300">Entry Fee</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EventStatus)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Banner Image URL</label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    Schedule Info
                  </label>
                  <input
                    type="text"
                    value={scheduleInfo}
                    onChange={(e) => setScheduleInfo(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300">Route Info</label>
                  <input
                    type="text"
                    value={routeInfo}
                    onChange={(e) => setRouteInfo(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-lime-500 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-lime-400"
                >
                  {editingEvent ? 'Save Changes' : 'Publish Race Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
