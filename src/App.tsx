import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { SetupBanner } from './components/SetupBanner';
import { LandingPage } from './pages/LandingPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { AuthPage } from './pages/AuthPage';
import { MyRacesPage } from './pages/MyRacesPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
          <SetupBanner />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/my-races" element={<MyRacesPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Routes>
          </main>
          <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500 no-print">
            © {new Date().getFullYear()} RacePulse Event Platform. Built with React, Tailwind CSS & Supabase.
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
