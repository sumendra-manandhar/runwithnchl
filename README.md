# RacePulse — Race & Event Participation Platform

Full-stack Race Registration & Admin Management web application built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase**, pre-configured for **Vercel** deployment.

## Features
- **Participant Portal:** Browse upcoming races, filter by sport type, live countdown timer, full race details, online registration form with automatic Bib Number generation, printable race pass, and personal registration dashboard (`/my-races`).
- **Admin Dashboard (`/admin`):** Create, edit, and delete races/events; manage participant registrations, edit bib numbers, export CSV check-in sheets, and promote/suspend user accounts.
- **Supabase Backend:** PostgreSQL schema with Row Level Security (RLS), automatic user profile creation triggers, and sample seed races.

---

## Quick Setup Guide

### 1. Set Up Supabase
1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in your Supabase dashboard, paste the contents of `supabase/schema.sql`, and click **Run**.
3. Go to **Project Settings -> API** and copy your **Project URL** and **anon public key**.

### 2. Run Locally
```bash
npm install
cp .env.example .env
# Paste your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY inside .env
npm run dev
```

### 3. Make Yourself Admin
1. Sign up for an account on your running app (`/auth`).
2. In Supabase **SQL Editor**, run:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```
3. Refresh the app — the **Admin Panel** button will appear in the top navbar.

### 4. Push to GitHub & Deploy on Vercel
1. Initialize a GitHub repo and push this folder:
```bash
git init
git add .
git commit -m "Initial RacePulse release"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```
2. Import the repository into [vercel.com](https://vercel.com).
3. Add the two environment variables in Vercel (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) and click **Deploy**.
