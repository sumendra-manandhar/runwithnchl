import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const SetupBanner: React.FC = () => {
  if (isSupabaseConfigured) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200">
      <div className="mx-auto flex max-w-7xl items-center gap-3 text-xs sm:text-sm">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
        <p>
          <strong>Supabase Not Connected Yet:</strong> Add{' '}
          <code className="rounded bg-slate-900 px-1.5 py-0.5 text-amber-300">
            VITE_SUPABASE_URL
          </code>{' '}
          and{' '}
          <code className="rounded bg-slate-900 px-1.5 py-0.5 text-amber-300">
            VITE_SUPABASE_ANON_KEY
          </code>{' '}
          to your <code className="rounded bg-slate-900 px-1.5 py-0.5">.env</code> file (or
          Vercel Environment Variables) and run{' '}
          <code className="rounded bg-slate-900 px-1.5 py-0.5">supabase/schema.sql</code>.
        </p>
      </div>
    </div>
  );
};
