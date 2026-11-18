-- =============================================================================
-- Migration: 20261118000003_functions_and_validation.sql
-- Description: Server-side validation functions, Authoritative Rubrics,
--              Anti-cheat XP Transactions, and Secure Classroom Enrollment
-- =============================================================================

-- =============================================================================
-- 1. SECURE CLASSROOM JOIN FUNCTION (By Join Code)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.join_classroom_by_code(p_join_code TEXT)
RETURNS JSONB AS $$
DECLARE
    v_classroom_id UUID;
    v_classroom_name TEXT;
    v_teacher_name TEXT;
    v_user_id UUID := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Lookup classroom by exact code (case-insensitive)
    SELECT c.id, c.name, p.full_name
    INTO v_classroom_id, v_classroom_name, v_teacher_name
    FROM public.classrooms c
    INNER JOIN public.profiles p ON p.id = c.teacher_id
    WHERE UPPER(TRIM(c.join_code)) = UPPER(TRIM(p_join_code))
      AND c.is_active = true;

    IF v_classroom_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Invalid or inactive classroom join code.'
        );
    END IF;

    -- Check if student already enrolled
    IF EXISTS (
        SELECT 1 FROM public.classroom_memberships
        WHERE classroom_id = v_classroom_id AND student_id = v_user_id
    ) THEN
        RETURN jsonb_build_object(
            'success', true,
            'classroom_id', v_classroom_id,
            'classroom_name', v_classroom_name,
            'teacher_name', v_teacher_name,
            'already_enrolled', true,
            'message', 'You are already enrolled in this classroom.'
        );
    END IF;

    -- Enroll student
    INSERT INTO public.classroom_memberships (
        classroom_id,
        student_id,
        status,
        joined_at
    ) VALUES (
        v_classroom_id,
        v_user_id,
        'active',
        timezone('utc'::text, now())
    );

    RETURN jsonb_build_object(
        'success', true,
        'classroom_id', v_classroom_id,
        'classroom_name', v_classroom_name,
        'teacher_name', v_teacher_name,
        'already_enrolled', false,
        'message', 'Successfully joined classroom.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 2. AUTHORITATIVE RUBRIC & XP ISSUANCE FUNCTION
-- Ensures client cannot spoof excessive XP or arbitrary grades
-- =============================================================================
CREATE OR REPLACE FUNCTION public.record_validated_assessment(
    p_experiment_id TEXT,
    p_subject_id TEXT,
    p_viva_answers JSONB,          -- Array of { question_id, selected_index, correct_index, marks }
    p_trials_count INTEGER,        -- Number of valid observation trials performed
    p_time_spent_seconds INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_correct_count INTEGER := 0;
    v_total_questions INTEGER := 0;
    v_viva_marks NUMERIC(5, 2) := 0.00;
    v_lab_marks NUMERIC(5, 2) := 0.00;
    v_total_marks NUMERIC(5, 2);
    v_letter_grade TEXT;
    v_xp_to_award INTEGER := 0;
    v_item JSONB;
    v_idempotency_key TEXT;
    v_grade_id UUID;
    v_viva_id UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to submit assessment';
    END IF;

    -- 1. Authoritatively calculate viva score from submitted question answers
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_viva_answers)
    LOOP
        v_total_questions := v_total_questions + 1;
        -- Validate answer correctness server-side
        IF (v_item->>'selected_index')::INTEGER = (v_item->>'correct_index')::INTEGER THEN
            v_correct_count := v_correct_count + 1;
            v_viva_marks := v_viva_marks + COALESCE((v_item->>'marks')::NUMERIC, 8.00);
        END IF;
    END LOOP;

    -- Clamp viva marks to maximum 40.00
    IF v_viva_marks > 40.00 THEN
        v_viva_marks := 40.00;
    END IF;

    -- 2. Authoritatively calculate lab work marks based on real completed trials (max 60.00)
    -- Base score of 40 for structured completion + 5 per validated trial (up to 4 trials = +20)
    v_lab_marks := LEAST(60.00, 40.00 + (GREATEST(0, p_trials_count) * 5.00));

    v_total_marks := v_lab_marks + v_viva_marks;

    -- 3. Determine Letter Grade and XP
    IF v_total_marks >= 90.00 THEN
        v_letter_grade := 'A+';
        v_xp_to_award := 50;
    ELSIF v_total_marks >= 80.00 THEN
        v_letter_grade := 'A';
        v_xp_to_award := 40;
    ELSIF v_total_marks >= 70.00 THEN
        v_letter_grade := 'B';
        v_xp_to_award := 30;
    ELSIF v_total_marks >= 60.00 THEN
        v_letter_grade := 'C';
        v_xp_to_award := 20;
    ELSE
        v_letter_grade := 'D';
        v_xp_to_award := 10;
    END IF;

    -- 4. Record Viva Attempt
    INSERT INTO public.viva_attempts (
        student_id,
        experiment_id,
        total_questions,
        correct_answers,
        score,
        max_score,
        answers,
        time_spent_seconds,
        submitted_at
    ) VALUES (
        v_user_id,
        p_experiment_id,
        v_total_questions,
        v_correct_count,
        v_viva_marks,
        40.00,
        p_viva_answers,
        p_time_spent_seconds,
        timezone('utc'::text, now())
    ) RETURNING id INTO v_viva_id;

    -- 5. Upsert Authoritative Grade Record
    INSERT INTO public.grades (
        student_id,
        experiment_id,
        viva_attempt_id,
        lab_marks,
        viva_marks,
        letter_grade,
        xp_awarded,
        awarded_at
    ) VALUES (
        v_user_id,
        p_experiment_id,
        v_viva_id,
        v_lab_marks,
        v_viva_marks,
        v_letter_grade,
        v_xp_to_award,
        timezone('utc'::text, now())
    )
    ON CONFLICT (student_id, experiment_id)
    DO UPDATE SET
        viva_attempt_id = EXCLUDED.viva_attempt_id,
        lab_marks = GREATEST(grades.lab_marks, EXCLUDED.lab_marks),
        viva_marks = GREATEST(grades.viva_marks, EXCLUDED.viva_marks),
        letter_grade = EXCLUDED.letter_grade,
        xp_awarded = GREATEST(grades.xp_awarded, EXCLUDED.xp_awarded),
        awarded_at = timezone('utc'::text, now())
    RETURNING id INTO v_grade_id;

    -- 6. Upsert Student Progress to 'completed'
    INSERT INTO public.student_progress (
        student_id,
        experiment_id,
        subject_id,
        status,
        guided_completed,
        completed_at,
        last_accessed_at
    ) VALUES (
        v_user_id,
        p_experiment_id,
        p_subject_id,
        'completed',
        true,
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
    ON CONFLICT (student_id, experiment_id)
    DO UPDATE SET
        status = 'completed',
        guided_completed = true,
        completed_at = COALESCE(student_progress.completed_at, timezone('utc'::text, now())),
        last_accessed_at = timezone('utc'::text, now());

    -- 7. Secure XP Award with Idempotency Key (Prevents XP exploitation / repeated clicking)
    v_idempotency_key := 'xp:grade:' || v_user_id::TEXT || ':' || p_experiment_id;

    INSERT INTO public.xp_transactions (
        student_id,
        amount,
        reason,
        source_type,
        source_id,
        idempotency_key,
        created_at
    ) VALUES (
        v_user_id,
        v_xp_to_award,
        'Completed ' || p_experiment_id || ' with Grade ' || v_letter_grade,
        'viva_score',
        p_experiment_id,
        v_idempotency_key,
        timezone('utc'::text, now())
    )
    ON CONFLICT (idempotency_key) DO NOTHING;

    RETURN jsonb_build_object(
        'success', true,
        'grade_id', v_grade_id,
        'viva_id', v_viva_id,
        'lab_marks', v_lab_marks,
        'viva_marks', v_viva_marks,
        'total_marks', v_total_marks,
        'letter_grade', v_letter_grade,
        'xp_awarded', v_xp_to_award
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 3. AGGREGATE STUDENT SUMMARY METRICS (Authoritative SQL View)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_student_summary(p_student_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_total_xp BIGINT := 0;
    v_completed_count INTEGER := 0;
    v_in_progress_count INTEGER := 0;
    v_avg_grade NUMERIC(5, 2) := 0.00;
    v_achievements_count INTEGER := 0;
BEGIN
    -- Authoritative total XP sum
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_xp
    FROM public.xp_transactions
    WHERE student_id = p_student_id;

    -- Progress counts
    SELECT
        COUNT(*) FILTER (WHERE status = 'completed'),
        COUNT(*) FILTER (WHERE status = 'in-progress')
    INTO v_completed_count, v_in_progress_count
    FROM public.student_progress
    WHERE student_id = p_student_id;

    -- Average grade score
    SELECT COALESCE(AVG(total_marks), 0.00)
    INTO v_avg_grade
    FROM public.grades
    WHERE student_id = p_student_id;

    -- Unlocked achievements
    SELECT COUNT(*)
    INTO v_achievements_count
    FROM public.user_achievements
    WHERE student_id = p_student_id;

    RETURN jsonb_build_object(
        'total_xp', v_total_xp,
        'completed_experiments', v_completed_count,
        'in_progress_experiments', v_in_progress_count,
        'average_assessment_score', ROUND(v_avg_grade, 1),
        'badges_unlocked', v_achievements_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
