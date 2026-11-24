import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Flame, Menu, X, ShieldCheck, User, LogOut, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    setMobileOpen(false);
    navigate('/');
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-lime-400 font-semibold'
      : 'text-slate-300 hover:text-white';

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md no-print">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-lime-500 text-slate-950 shadow-lg shadow-lime-500/20">
            <Flame className="h-5 w-5 fill-current" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            RACE<span className="text-lime-400">PULSE</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-7 md:flex">
          <Link to="/" className={`text-sm transition ${isActive('/')}`}>
            Races & Events
          </Link>
          {user && (
            <Link to="/my-races" className={`flex items-center gap-1.5 text-sm transition ${isActive('/my-races')}`}>
              <Trophy className="h-4 w-4" />
              My Registrations
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400 transition hover:bg-orange-500/20`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Panel
            </Link>
          )}
        </div>

        {/* Auth Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
                <User className="h-3.5 w-3.5 text-lime-400" />
                <span>{profile?.full_name || user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-red-500/50 hover:text-red-400"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/auth"
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=signup"
                className="rounded-lg bg-lime-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-lime-400"
              >
                Join Race
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white md:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="border-t border-slate-800 bg-slate-950 px-4 py-4 md:hidden">
          <div className="flex flex-col space-y-3">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
            >
              Races & Events
            </Link>
            {user && (
              <Link
                to="/my-races"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
              >
                My Registrations
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-orange-500/10 px-3 py-2 text-sm font-semibold text-orange-400"
              >
                Admin Dashboard
              </Link>
            )}
            <div className="border-t border-slate-800 pt-3">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg bg-slate-900 px-3 py-2 text-left text-sm text-red-400"
                >
                  Sign Out ({profile?.full_name || user.email})
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg bg-lime-500 px-4 py-2 text-center text-sm font-bold text-slate-950"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
