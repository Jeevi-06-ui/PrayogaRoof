-- =============================================================================
-- Migration: 20261118000002_row_level_security.sql
-- Description: Row Level Security (RLS) Policies and Helper Authorization Functions
-- Security: Strict Student Isolation & Authorized Classroom Teacher Privacy Controls
-- =============================================================================

-- =============================================================================
-- 1. SECURITY HELPER FUNCTIONS (SECURITY DEFINER)
-- =============================================================================

-- Check if current authenticated user is a teacher
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'teacher'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if current user is an authorized teacher of a specific student
CREATE OR REPLACE FUNCTION public.is_teacher_of_student(target_student_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.classroom_memberships cm
        INNER JOIN public.classrooms c ON c.id = cm.classroom_id
        WHERE c.teacher_id = auth.uid()
          AND cm.student_id = target_student_id
          AND cm.status = 'active'
          AND c.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if current user is the owner/teacher of a specific classroom
CREATE OR REPLACE FUNCTION public.is_classroom_teacher(target_classroom_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.classrooms
        WHERE id = target_classroom_id
          AND teacher_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- 2. ENABLE ROW LEVEL SECURITY ON ALL USER TABLES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viva_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_workspaces ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 3. PROFILES POLICIES
-- =============================================================================
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (
        auth.uid() = id
        OR public.is_teacher_of_student(id)
        OR (role = 'teacher' AND EXISTS (
            SELECT 1 FROM public.classroom_memberships cm
            INNER JOIN public.classrooms c ON c.id = cm.classroom_id
            WHERE c.teacher_id = profiles.id AND cm.student_id = auth.uid()
        ))
    );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- =============================================================================
-- 4. CLASSROOMS POLICIES
-- =============================================================================
DROP POLICY IF EXISTS "Teachers and members can read classrooms" ON public.classrooms;
CREATE POLICY "Teachers and members can read classrooms"
    ON public.classrooms FOR SELECT
    USING (
        teacher_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.classroom_memberships
            WHERE classroom_id = classrooms.id AND student_id = auth.uid()
        )
        OR auth.uid() IS NOT NULL -- Allow authenticated students to look up classroom by join code
    );

DROP POLICY IF EXISTS "Teachers can create classrooms" ON public.classrooms;
CREATE POLICY "Teachers can create classrooms"
    ON public.classrooms FOR INSERT
    WITH CHECK (teacher_id = auth.uid() AND public.is_teacher());

DROP POLICY IF EXISTS "Teachers can update their own classrooms" ON public.classrooms;
CREATE POLICY "Teachers can update their own classrooms"
    ON public.classrooms FOR UPDATE
    USING (teacher_id = auth.uid())
    WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can delete their own classrooms" ON public.classrooms;
CREATE POLICY "Teachers can delete their own classrooms"
    ON public.classrooms FOR DELETE
    USING (teacher_id = auth.uid());

-- =============================================================================
-- 5. CLASSROOM MEMBERSHIPS POLICIES
-- =============================================================================
DROP POLICY IF EXISTS "Members and teachers can read memberships" ON public.classroom_memberships;
CREATE POLICY "Members and teachers can read memberships"
    ON public.classroom_memberships FOR SELECT
    USING (
        student_id = auth.uid()
        OR public.is_classroom_teacher(classroom_id)
    );

DROP POLICY IF EXISTS "Students can enroll in classrooms" ON public.classroom_memberships;
CREATE POLICY "Students can enroll in classrooms"
    ON public.classroom_memberships FOR INSERT
    WITH CHECK (
        student_id = auth.uid()
        OR public.is_classroom_teacher(classroom_id)
    );

DROP POLICY IF EXISTS "Teachers or students can remove memberships" ON public.classroom_memberships;
CREATE POLICY "Teachers or students can remove memberships"
    ON public.classroom_memberships FOR DELETE
    USING (
        student_id = auth.uid()
        OR public.is_classroom_teacher(classroom_id)
    );

-- =============================================================================
-- 6. STUDENT PROGRESS POLICIES
-- =============================================================================
DROP POLICY IF EXISTS "Students and teachers can read progress" ON public.student_progress;
CREATE POLICY "Students and teachers can read progress"
    ON public.student_progress FOR SELECT
    USING (
        student_id = auth.uid()
        OR public.is_teacher_of_student(student_id)
    );

DROP POLICY IF EXISTS "Students can insert own progress" ON public.student_progress;
CREATE POLICY "Students can insert own progress"
    ON public.student_progress FOR INSERT
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can update own progress" ON public.student_progress;
CREATE POLICY "Students can update own progress"
    ON public.student_progress FOR UPDATE
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can delete own progress" ON public.student_progress;
CREATE POLICY "Students can delete own progress"
    ON public.student_progress FOR DELETE
    USING (student_id = auth.uid());

-- =============================================================================
-- 7. EXPERIMENT ATTEMPTS POLICIES
-- =============================================================================
DROP POLICY IF EXISTS "Students and teachers can read attempts" ON public.experiment_attempts;
CREATE POLICY "Students and teachers can read attempts"
    ON public.experiment_attempts FOR SELECT
    USING (
        student_id = auth.uid()
        OR public.is_teacher_of_student(student_id)
    );

DROP POLICY IF EXISTS "Students can insert own attempts" ON public.experiment_attempts;
CREATE POLICY "Students can insert own attempts"
    ON public.experiment_attempts FOR INSERT
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can update own attempts" ON public.experiment_attempts;
CREATE POLICY "Students can update own attempts"
    ON public.experiment_attempts FOR UPDATE
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- =============================================================================
-- 8. EXPERIMENT OBSERVATIONS POLICIES
-- =============================================================================
DROP POLICY IF EXISTS "Students and teachers can read observations" ON public.experiment_observations;
CREATE POLICY "Students and teachers can read observations"
    ON public.experiment_observations FOR SELECT
    USING (
        student_id = auth.uid()
        OR public.is_teacher_of_student(student_id)
    );

DROP POLICY IF EXISTS "Students can insert own observations" ON public.experiment_observations;
CREATE POLICY "Students can insert own observations"
    ON public.experiment_observations FOR INSERT
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can update own observations" ON public.experiment_observations;
CREATE POLICY "Students can update own observations"
    ON public.experiment_observations FOR UPDATE
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can delete own observations" ON public.experiment_observations;
CREATE POLICY "Students can delete own observations"
    ON public.experiment_observations FOR DELETE
    USING (student_id = auth.uid());

-- =============================================================================
-- 9. VIVA ATTEMPTS POLICIES
-- =============================================================================
DROP POLICY IF EXISTS "Students and teachers can read viva attempts" ON public.viva_attempts;
CREATE POLICY "Students and teachers can read viva attempts"
    ON public.viva_attempts FOR SELECT
    USING (
        student_id = auth.uid()
        OR public.is_teacher_of_student(student_id)
    );

DROP POLICY IF EXISTS "Students can insert own viva attempts" ON public.viva_attempts;
CREATE POLICY "Students can insert own viva attempts"
    ON public.viva_attempts FOR INSERT
    WITH CHECK (student_id = auth.uid());

-- =============================================================================
-- 10. GRADES POLICIES
-- =============================================================================
DROP POLICY IF EXISTS "Students and teachers can read grades" ON public.grades;
CREATE POLICY "Students and teachers can read grades"
    ON public.grades FOR SELECT
    USING (
        student_id = auth.uid()
        OR public.is_teacher_of_student(student_id)
    );

DROP POLICY IF EXISTS "Students can insert own grade records" ON public.grades;
CREATE POLICY "Students can insert own grade records"
    ON public.grades FOR INSERT
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can update own grade records" ON public.grades;
CREATE POLICY "Students can update own grade records"
    ON public.grades FOR UPDATE
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- =============================================================================
-- 11. XP TRANSACTIONS POLICIES
-- =============================================================================
DROP POLICY IF EXISTS "Students and teachers can read xp transactions" ON public.xp_transactions;
CREATE POLICY "Students and teachers can read xp transactions"
    ON public.xp_transactions FOR SELECT
    USING (
        student_id = auth.uid()
        OR public.is_teacher_of_student(student_id)
    );

DROP POLICY IF EXISTS "Students can insert xp transactions" ON public.xp_transactions;
CREATE POLICY "Students can insert xp transactions"
    ON public.xp_transactions FOR INSERT
    WITH CHECK (student_id = auth.uid());

-- =============================================================================
-- 12. USER ACHIEVEMENTS POLICIES
-- =============================================================================
DROP POLICY IF EXISTS "Students and teachers can read achievements" ON public.user_achievements;
CREATE POLICY "Students and teachers can read achievements"
    ON public.user_achievements FOR SELECT
    USING (
        student_id = auth.uid()
        OR public.is_teacher_of_student(student_id)
    );

DROP POLICY IF EXISTS "Students can unlock achievements" ON public.user_achievements;
CREATE POLICY "Students can unlock achievements"
    ON public.user_achievements FOR INSERT
    WITH CHECK (student_id = auth.uid());

-- =============================================================================
-- 13. BOOKMARKS POLICIES
-- =============================================================================
DROP POLICY IF EXISTS "Students can read own bookmarks" ON public.bookmarks;
CREATE POLICY "Students can read own bookmarks"
    ON public.bookmarks FOR SELECT
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can create own bookmarks" ON public.bookmarks;
CREATE POLICY "Students can create own bookmarks"
    ON public.bookmarks FOR INSERT
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can delete own bookmarks" ON public.bookmarks;
CREATE POLICY "Students can delete own bookmarks"
    ON public.bookmarks FOR DELETE
    USING (student_id = auth.uid());

-- =============================================================================
-- 14. SAVED WORKSPACES POLICIES
-- =============================================================================
DROP POLICY IF EXISTS "Students and teachers can read workspaces" ON public.saved_workspaces;
CREATE POLICY "Students and teachers can read workspaces"
    ON public.saved_workspaces FOR SELECT
    USING (
        student_id = auth.uid()
        OR public.is_teacher_of_student(student_id)
    );

DROP POLICY IF EXISTS "Students can create workspaces" ON public.saved_workspaces;
CREATE POLICY "Students can create workspaces"
    ON public.saved_workspaces FOR INSERT
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can update own workspaces" ON public.saved_workspaces;
CREATE POLICY "Students can update own workspaces"
    ON public.saved_workspaces FOR UPDATE
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can delete own workspaces" ON public.saved_workspaces;
CREATE POLICY "Students can delete own workspaces"
    ON public.saved_workspaces FOR DELETE
    USING (student_id = auth.uid());
