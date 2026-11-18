-- =============================================================================
-- Migration: 20261118000001_create_schema.sql
-- Description: Core Schema for PrayogaProof Multi-User STEM Laboratory Platform
-- Tables: profiles, student_progress, experiment_attempts, experiment_observations,
--         viva_attempts, grades, xp_transactions, user_achievements, bookmarks,
--         saved_workspaces, classrooms, classroom_memberships
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. PROFILES TABLE (Mirrors auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL DEFAULT 'Curious Learner',
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    grade TEXT NOT NULL DEFAULT 'Grade 10',
    school_name TEXT NOT NULL DEFAULT 'Prayoga Partner School',
    region TEXT NOT NULL DEFAULT 'Karnataka, India',
    avatar_seed TEXT NOT NULL DEFAULT 'scientist-1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 2. CLASSROOMS TABLE (Managed by teachers)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL CHECK (subject IN ('physics', 'chemistry', 'biology', 'mathematics', 'general_stem')),
    grade_level TEXT NOT NULL,
    school_name TEXT NOT NULL,
    join_code TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 3. CLASSROOM MEMBERSHIPS TABLE (Student-to-Classroom mapping)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.classroom_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'archived')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_classroom_student UNIQUE (classroom_id, student_id)
);

-- =============================================================================
-- 4. STUDENT PROGRESS TABLE (Per-experiment high-level progress)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    experiment_id TEXT NOT NULL,
    subject_id TEXT NOT NULL CHECK (subject_id IN ('physics', 'chemistry', 'biology', 'mathematics')),
    status TEXT NOT NULL DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed')),
    guided_completed BOOLEAN NOT NULL DEFAULT false,
    guided_step_index INTEGER NOT NULL DEFAULT 0,
    free_lab_workspaces_count INTEGER NOT NULL DEFAULT 0,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
    notes TEXT NOT NULL DEFAULT '',
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_student_experiment UNIQUE (student_id, experiment_id)
);

-- =============================================================================
-- 5. EXPERIMENT ATTEMPTS TABLE (Detailed session logging)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.experiment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    experiment_id TEXT NOT NULL,
    subject_id TEXT NOT NULL CHECK (subject_id IN ('physics', 'chemistry', 'biology', 'mathematics')),
    mode TEXT NOT NULL DEFAULT 'guided' CHECK (mode IN ('guided', 'freelab', 'simulation')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    platform TEXT NOT NULL DEFAULT 'web' CHECK (platform IN ('web', 'android', 'ios')),
    device_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 6. EXPERIMENT OBSERVATIONS TABLE (Tabular student lab data trials)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.experiment_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES public.experiment_attempts(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    experiment_id TEXT NOT NULL,
    trial_number INTEGER NOT NULL CHECK (trial_number > 0),
    input_parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    measured_parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    calculated_parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 7. VIVA ATTEMPTS TABLE (5 viva questions submitted by student)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.viva_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    experiment_id TEXT NOT NULL,
    attempt_id UUID REFERENCES public.experiment_attempts(id) ON DELETE SET NULL,
    total_questions INTEGER NOT NULL DEFAULT 5,
    correct_answers INTEGER NOT NULL DEFAULT 0 CHECK (correct_answers >= 0 AND correct_answers <= total_questions),
    score NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (score >= 0.00 AND score <= 40.00),
    max_score NUMERIC(5, 2) NOT NULL DEFAULT 40.00,
    answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 8. GRADES TABLE (Authoritative 100-mark rubric breakdown)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    experiment_id TEXT NOT NULL,
    attempt_id UUID REFERENCES public.experiment_attempts(id) ON DELETE SET NULL,
    viva_attempt_id UUID REFERENCES public.viva_attempts(id) ON DELETE SET NULL,
    lab_marks NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (lab_marks >= 0.00 AND lab_marks <= 60.00),
    viva_marks NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (viva_marks >= 0.00 AND viva_marks <= 40.00),
    total_marks NUMERIC(5, 2) GENERATED ALWAYS AS (lab_marks + viva_marks) STORED,
    letter_grade TEXT NOT NULL CHECK (letter_grade IN ('A+', 'A', 'B', 'C', 'D')),
    xp_awarded INTEGER NOT NULL DEFAULT 0 CHECK (xp_awarded >= 0),
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_student_experiment_grade UNIQUE (student_id, experiment_id)
);

-- =============================================================================
-- 9. XP TRANSACTIONS TABLE (Append-only XP ledger with idempotency)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('experiment_completion', 'viva_score', 'achievement', 'daily_streak', 'teacher_bonus')),
    source_id TEXT NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 10. USER ACHIEVEMENTS TABLE (Badges earned)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    badge_icon TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'mastery',
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT uq_student_achievement UNIQUE (student_id, achievement_id)
);

-- =============================================================================
-- 11. BOOKMARKS TABLE (Saved favorites/starred experiments)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    experiment_id TEXT NOT NULL,
    subject_id TEXT NOT NULL CHECK (subject_id IN ('physics', 'chemistry', 'biology', 'mathematics')),
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_student_bookmark UNIQUE (student_id, experiment_id)
);

-- =============================================================================
-- 12. SAVED WORKSPACES TABLE (Digital lab bench setups)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.saved_workspaces (
    id TEXT PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    experiment_id TEXT NOT NULL,
    subject_id TEXT NOT NULL CHECK (subject_id IN ('physics', 'chemistry', 'biology', 'mathematics')),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    component_count INTEGER NOT NULL DEFAULT 0,
    canvas_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON public.classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_code ON public.classrooms(join_code);
CREATE INDEX IF NOT EXISTS idx_memberships_classroom ON public.classroom_memberships(classroom_id);
CREATE INDEX IF NOT EXISTS idx_memberships_student ON public.classroom_memberships(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_student ON public.student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_subject ON public.student_progress(student_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_progress_status ON public.student_progress(student_id, status);
CREATE INDEX IF NOT EXISTS idx_attempts_student_exp ON public.experiment_attempts(student_id, experiment_id);
CREATE INDEX IF NOT EXISTS idx_observations_attempt ON public.experiment_observations(attempt_id);
CREATE INDEX IF NOT EXISTS idx_observations_student ON public.experiment_observations(student_id, experiment_id);
CREATE INDEX IF NOT EXISTS idx_viva_student ON public.viva_attempts(student_id, experiment_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_experiment ON public.grades(experiment_id);
CREATE INDEX IF NOT EXISTS idx_xp_student ON public.xp_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_xp_idempotency ON public.xp_transactions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_achievements_student ON public.user_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_student ON public.bookmarks(student_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_student ON public.saved_workspaces(student_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_experiment ON public.saved_workspaces(experiment_id);

-- =============================================================================
-- AUTOMATIC TIMESTAMP & PROFILE TRIGGER FUNCTIONS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach timestamp triggers
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS tr_classrooms_updated_at ON public.classrooms;
CREATE TRIGGER tr_classrooms_updated_at BEFORE UPDATE ON public.classrooms
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS tr_student_progress_updated_at ON public.student_progress;
CREATE TRIGGER tr_student_progress_updated_at BEFORE UPDATE ON public.student_progress
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS tr_experiment_observations_updated_at ON public.experiment_observations;
CREATE TRIGGER tr_experiment_observations_updated_at BEFORE UPDATE ON public.experiment_observations
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS tr_saved_workspaces_updated_at ON public.saved_workspaces;
CREATE TRIGGER tr_saved_workspaces_updated_at BEFORE UPDATE ON public.saved_workspaces
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Auto-create profile upon auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role TEXT := 'student';
    assigned_name TEXT := 'Curious Learner';
    assigned_grade TEXT := 'Grade 10';
    assigned_school TEXT := 'Prayoga Partner School';
BEGIN
    -- Only allow teacher role if explicitly provided in trusted metadata during invite/admin creation
    IF (NEW.raw_user_meta_data->>'role') = 'teacher' THEN
        -- Standard signups default to student; teacher verification can be promoted by admin
        assigned_role := 'student';
    END IF;

    IF NEW.raw_user_meta_data->>'full_name' IS NOT NULL AND NEW.raw_user_meta_data->>'full_name' <> '' THEN
        assigned_name := NEW.raw_user_meta_data->>'full_name';
    END IF;

    IF NEW.raw_user_meta_data->>'grade' IS NOT NULL AND NEW.raw_user_meta_data->>'grade' <> '' THEN
        assigned_grade := NEW.raw_user_meta_data->>'grade';
    END IF;

    IF NEW.raw_user_meta_data->>'school_name' IS NOT NULL AND NEW.raw_user_meta_data->>'school_name' <> '' THEN
        assigned_school := NEW.raw_user_meta_data->>'school_name';
    END IF;

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        grade,
        school_name,
        region,
        avatar_seed
    ) VALUES (
        NEW.id,
        NEW.email,
        assigned_name,
        assigned_role,
        assigned_grade,
        assigned_school,
        COALESCE(NEW.raw_user_meta_data->>'region', 'Karnataka, India'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_seed', 'scientist-1')
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Prevent self-escalation of roles by non-service-role users
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        -- Only service-role or database administrator can modify roles
        IF auth.role() <> 'service_role' THEN
            RAISE EXCEPTION 'Unauthorized: Users cannot modify their assigned role';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_prevent_role_escalation ON public.profiles;
CREATE TRIGGER tr_prevent_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();
