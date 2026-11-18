# PrayogaProof — Supabase Database & Security Setup Guide

This guide details the procedure for deploying and verifying the multi-user PostgreSQL database, Row Level Security (RLS) policies, and Supabase Auth configuration for PrayogaProof.

---

## 1. Environment Variable Architecture

PrayogaProof enforces strict security separation between client-safe public keys and privileged service-role credentials:

| Variable | Environment | Security Classification | Purpose |
|----------|-------------|-------------------------|---------|
| `VITE_SUPABASE_URL` | Frontend & Mobile (`.env`) | **Public** | Supabase Project REST / Auth API URL (e.g. `https://xyzcompany.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Frontend & Mobile (`.env`) | **Public Safe** | Supabase Anonymous Client Key (subject to Row Level Security) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel Serverless Only (`.env.local`) | **STRICTLY CONFIDENTIAL** | Service-role administrative key. **NEVER expose in client-side code, git, or mobile APK/IPA!** |

### Create Local `.env` (Frontend Client)
Create a `.env` file at the root of `PrayogaRoof-Final`:
```env
# PrayogaProof Public Client Keys
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. Applying Database Migrations

The migration scripts are located in `supabase/migrations/`:
1. `20261118000001_create_schema.sql` (Creates 12 tables, constraints, foreign keys, indexes, triggers)
2. `20261118000002_row_level_security.sql` (Enables RLS on all tables and creates student & teacher policies)
3. `20261118000003_functions_and_validation.sql` (Server-side validation for grades, anti-cheat XP, and join codes)

### Option A: Via Supabase Web Dashboard (Recommended for quick deployment)
1. Log in to [Supabase Management Console](https://app.supabase.com).
2. Select your PrayogaProof project.
3. Open the **SQL Editor** from the left navigation.
4. Click **New Query**.
5. Copy and paste the contents of `20261118000001_create_schema.sql` and click **Run**.
6. Repeat for `20261118000002_row_level_security.sql`.
7. Repeat for `20261118000003_functions_and_validation.sql`.

### Option B: Via Supabase CLI
```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```

---

## 3. Configuring Supabase Authentication Settings

In the Supabase Dashboard under **Authentication -> URL Configuration**:
1. **Site URL:**
   - Production: `https://your-app-name.vercel.app`
   - Local Development: `http://localhost:5173`
2. **Redirect URLs:**
   Add each of the following URLs to the whitelist:
   - `http://localhost:5173/**`
   - `https://your-app-name.vercel.app/**`
   - `com.prayogaproof.mobile://auth/callback` (for native Android & iOS mobile app redirects)

---

## 4. Verification Checklist

- [x] All 12 tables created with proper primary and foreign keys.
- [x] RLS enabled on all 12 tables.
- [x] Trigger `on_auth_user_created` creates default student profile on sign-up.
- [x] Trigger `tr_prevent_role_escalation` forbids non-admin users from escalating to `'teacher'` or `'admin'`.
- [x] Teacher access restricted strictly to students with active memberships in teacher's classrooms.
- [x] XP transactions enforce idempotency keys to prevent duplicate rewards.
