import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Award,
  Download,
  Plus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { Classroom, SubjectId } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';

interface StudentRosterItem {
  id: string;
  fullName: string;
  grade: string;
  schoolName: string;
  completedExperiments: number;
  averageGrade: string;
  totalXP: number;
  joinedAt: string;
}

export const TeacherDashboardPage: React.FC = () => {
  const { user, profile } = useAuth();

  const [classrooms, setClassrooms] = useState<Classroom[]>([
    {
      id: 'demo-class-1',
      teacherId: profile?.id || 'teacher-1',
      name: 'Class 10 - Section A (Physics & Chemistry)',
      subject: 'general_stem',
      gradeLevel: 'Grade 10',
      schoolName: 'Prayoga Partner School',
      joinCode: 'PRY-10A',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('demo-class-1');
  const [roster] = useState<StudentRosterItem[]>([
    {
      id: 'student-mock-1',
      fullName: 'Aarav Sharma',
      grade: 'Grade 10',
      schoolName: 'Prayoga Partner School',
      completedExperiments: 8,
      averageGrade: 'A',
      totalXP: 320,
      joinedAt: '2026-11-10T10:00:00Z',
    },
    {
      id: 'student-mock-2',
      fullName: 'Ananya Rao',
      grade: 'Grade 10',
      schoolName: 'Prayoga Partner School',
      completedExperiments: 10,
      averageGrade: 'A+',
      totalXP: 450,
      joinedAt: '2026-11-12T14:30:00Z',
    },
    {
      id: 'student-mock-3',
      fullName: 'Rohan Deshmukh',
      grade: 'Grade 10',
      schoolName: 'Prayoga Partner School',
      completedExperiments: 5,
      averageGrade: 'B',
      totalXP: 190,
      joinedAt: '2026-11-14T09:15:00Z',
    },
    {
      id: 'student-mock-4',
      fullName: 'Diya Patel',
      grade: 'Grade 10',
      schoolName: 'Prayoga Partner School',
      completedExperiments: 3,
      averageGrade: 'C',
      totalXP: 110,
      joinedAt: '2026-11-15T11:45:00Z',
    },
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newSubject, setNewSubject] = useState<SubjectId | 'general_stem'>('physics');
  const [newGradeLevel, setNewGradeLevel] = useState('Grade 10');
  const [newSchoolName, setNewSchoolName] = useState('Prayoga Partner School');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const selectedClass = classrooms.find((c) => c.id === selectedClassroomId) || classrooms[0];

  // Fetch real classrooms if configured
  useEffect(() => {
    if (!isSupabaseConfigured() || !user) return;

    async function loadTeacherData() {
      try {
        const teacherUid = user?.uid || '';
        const { data: dbClasses } = await supabase
          .from('classrooms')
          .select('*')
          .eq('teacher_id', teacherUid);

        if (dbClasses && dbClasses.length > 0) {
          setClassrooms(
            dbClasses.map((c) => ({
              id: c.id,
              teacherId: c.teacher_id,
              name: c.name,
              subject: c.subject,
              gradeLevel: c.grade_level,
              schoolName: c.school_name,
              joinCode: c.join_code,
              isActive: c.is_active,
              createdAt: c.created_at,
              updatedAt: c.updated_at,
            }))
          );
        }
      } catch (err) {
        console.warn('Error loading teacher classrooms:', err);
      }
    }

    loadTeacherData();
  }, [user]);

  const handleCreateClassroom = async () => {
    if (!newClassName.trim()) return;

    const generatedCode = `PRY-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newClass: Classroom = {
      id: `class-${Date.now()}`,
      teacherId: user?.uid || 'current-teacher',
      name: newClassName.trim(),
      subject: newSubject,
      gradeLevel: newGradeLevel,
      schoolName: newSchoolName.trim(),
      joinCode: generatedCode,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && user) {
      try {
        await supabase.from('classrooms').insert({
          teacher_id: user.uid,
          name: newClass.name,
          subject: newClass.subject,
          grade_level: newClass.gradeLevel,
          school_name: newClass.schoolName,
          join_code: newClass.joinCode,
        });
      } catch (err) {
        console.warn('Error persisting classroom:', err);
      }
    }

    setClassrooms((prev) => [newClass, ...prev]);
    setSelectedClassroomId(newClass.id);
    setIsCreateModalOpen(false);
    setNewClassName('');
  };

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const exportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Student Name,Grade,School,Experiments Completed,Average Grade,Total XP,Enrolled Date']
        .concat(
          roster.map(
            (s) =>
              `"${s.fullName}","${s.grade}","${s.schoolName}",${s.completedExperiments},"${s.averageGrade}",${s.totalXP},"${s.joinedAt}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `prayogaproof-classroom-report-${selectedClass?.name || 'class'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                Verified Educator Portal
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>FERPA / Student Privacy Protected</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Teacher Instruction &amp; Assessment Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Monitor enrolled students, track curriculum laboratory completion, inspect viva voce competencies, and identify learning difficulties with student data protection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold shadow-md"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Create Classroom</span>
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={exportReport}
              className="text-white border-white/40 hover:bg-white/10 font-bold"
            >
              <Download className="w-4 h-4 mr-1.5" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Classroom Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Selected Classroom</div>
            <select
              value={selectedClassroomId}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
              className="font-bold text-sm bg-transparent text-slate-900 dark:text-white border-none focus:outline-none cursor-pointer"
            >
              {classrooms.map((c) => (
                <option key={c.id} value={c.id} className="dark:bg-slate-900">
                  {c.name} ({c.gradeLevel})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Join Code Copy Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase font-bold text-slate-400">Student Join Code</div>
            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              Share with your students
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyJoinCode(selectedClass?.joinCode || '')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all min-h-[40px]"
          >
            <span>{selectedClass?.joinCode}</span>
            {copiedCode === selectedClass?.joinCode ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Classroom Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Enrolled Students</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {roster.length} Learners
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                Active in this section
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Class Lab Completion</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                65% Average
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Across Foundation &amp; Class 10</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Viva Voce Mastery</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                82.4% Score
              </h3>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                Grade A Cohort Average
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Total Class XP</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                1,070 XP
              </h3>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                Earned via Authoritative Rubrics
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Award className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Difficulties Radar & Diagnostic Insights */}
      <Card className="border-amber-200/60 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Curriculum Learning Difficulties Detected</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Ohm&apos;s Law (V-I Slope Interpretation)
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                3 students required voice simulation remediation for calculating resistance $R = \Delta V / \Delta I$ from linear scatter points.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                pH Testing &amp; Indicator Colors
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Strong conceptual retention on litmus, but 2 students struggled with universal indicator color scale near neutral pH 7.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Concave Mirror Real vs Virtual Images
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                High accuracy on real inverted images; remediation recommended for needle position inside focal distance $u &lt; f$.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Students Roster Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Student Roster &amp; Competency Records ({roster.length})</span>
            </CardTitle>
            <span className="text-xs text-slate-400">
              Privacy Rules Active: Direct contact info shielded
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500">
                <th className="py-3 px-4 font-bold uppercase text-[10px]">Student Name</th>
                <th className="py-3 px-4 font-bold uppercase text-[10px]">Grade</th>
                <th className="py-3 px-4 font-bold uppercase text-[10px]">School</th>
                <th className="py-3 px-4 font-bold uppercase text-[10px] text-center">Labs Done</th>
                <th className="py-3 px-4 font-bold uppercase text-[10px] text-center">Grade</th>
                <th className="py-3 px-4 font-bold uppercase text-[10px] text-center">XP</th>
                <th className="py-3 px-4 font-bold uppercase text-[10px]">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {roster.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {s.fullName}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{s.grade}</td>
                  <td className="py-3 px-4 text-slate-500">{s.schoolName}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                    {s.completedExperiments}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        s.averageGrade === 'A+'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : s.averageGrade === 'A'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : s.averageGrade === 'B'
                          ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {s.averageGrade}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-700 dark:text-slate-300">
                    +{s.totalXP}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(s.joinedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create Classroom Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Classroom"
        description="Establish an authorized laboratory section and generate a unique student join code."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateClassroom}>
              Create Classroom
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Classroom Name
            </label>
            <input
              type="text"
              required
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="e.g. Class 11 - Section B (Physics Practical)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value as SubjectId | 'general_stem')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="biology">Biology</option>
                <option value="mathematics">Mathematics</option>
                <option value="general_stem">General STEM</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Grade Level
              </label>
              <select
                value={newGradeLevel}
                onChange={(e) => setNewGradeLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              School Name
            </label>
            <input
              type="text"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
