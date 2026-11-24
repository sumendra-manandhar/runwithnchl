import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Flame, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const redirectTo = searchParams.get('redirect') || '/';

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) {
        navigate(redirectTo);
      } else {
        setMessage('Account created! Check your email to confirm, or sign in now.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      navigate(redirectTo);
    }
  };

  return (
    <div className="flex min-h-[82vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-500 text-slate-950">
            <Flame className="h-6 w-6 fill-current" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-white">
            {mode === 'signin' ? 'Welcome Back, Athlete' : 'Create Athlete Account'}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            {mode === 'signin'
              ? 'Sign in to register for races and view your bibs.'
              : 'Join RacePulse to participate in upcoming races.'}
          </p>
        </div>

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-xl border border-lime-500/40 bg-lime-500/10 p-3 text-xs text-lime-300">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-300">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sumendra Manandhar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-lime-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300">Email Address</label>
            <input
              type="email"
              required
              placeholder="athlete@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-lime-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300">Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-lime-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-lime-500 py-3 text-sm font-black text-slate-950 transition hover:bg-lime-400 disabled:opacity-50"
          >
            {loading
              ? 'Please wait...'
              : mode === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="font-bold text-lime-400 hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button
                onClick={() => setMode('signin')}
                className="font-bold text-lime-400 hover:underline"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
