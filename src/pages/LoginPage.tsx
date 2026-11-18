import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Compass,
  RefreshCw,
  Atom,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/shared/Button';
import { AuthDiagnostic } from '../services/firebaseAuthService';

export const LoginPage: React.FC = () => {
  const { signIn, signUp, resetPassword, continueAsGuest, user, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Destination after login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [grade, setGrade] = useState('Class 10 Foundation');
  const [schoolName, setSchoolName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<AuthDiagnostic | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already authenticated and not in guest mode, redirect to target or dashboard
  useEffect(() => {
    if (user && !isGuest) {
      navigate(from, { replace: true });
    }
  }, [user, isGuest, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setDiagnostic(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message);
          if ('diagnostic' in error && (error as unknown as { diagnostic?: AuthDiagnostic }).diagnostic) {
            setDiagnostic((error as unknown as { diagnostic: AuthDiagnostic }).diagnostic);
          }
        } else {
          navigate(from, { replace: true });
        }
      } else if (mode === 'signup') {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }

        const { error } = await signUp({
          email,
          password,
          fullName,
          grade,
          schoolName: schoolName.trim() || 'Prayoga STEM Academy',
          region: 'Karnataka, India',
        });

        if (error) {
          setErrorMsg(error.message);
          if ('diagnostic' in error && (error as unknown as { diagnostic?: AuthDiagnostic }).diagnostic) {
            setDiagnostic((error as unknown as { diagnostic: AuthDiagnostic }).diagnostic);
          }
        } else {
          setSuccessMsg('Account created successfully! Redirecting to laboratory dashboard...');
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 800);
        }
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          setErrorMsg('Please enter your account email address.');
          setLoading(false);
          return;
        }

        const { error } = await resetPassword(email);
        if (error) {
          setErrorMsg(error.message);
          if ('diagnostic' in error && (error as unknown as { diagnostic?: AuthDiagnostic }).diagnostic) {
            setDiagnostic((error as unknown as { diagnostic: AuthDiagnostic }).diagnostic);
          }
        } else {
          setSuccessMsg('Password recovery link sent! Please check your email inbox.');
        }
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || 'An unexpected error occurred. Please try again.');
      if ('diagnostic' in e && (e as unknown as { diagnostic?: AuthDiagnostic }).diagnostic) {
        setDiagnostic((e as unknown as { diagnostic: AuthDiagnostic }).diagnostic);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    continueAsGuest();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      {/* Header bar */}
      <header className="relative z-10 px-4 sm:px-8 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <Link to="/welcome" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Atom className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-lg tracking-tight">
                Prayoga<span className="text-blue-400">Proof</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                STEM Lab
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Virtual Science & Mathematics Laboratory</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/welcome"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Explore Showcase</span>
          </Link>
          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <FlaskConical className="w-4 h-4 text-emerald-400" />
            <span>Guest Mode</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Card Frame */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 space-y-6">
            {/* Header Titles */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Multi-User Firebase Authentication</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {mode === 'signin' && 'Sign in to Laboratory'}
                {mode === 'signup' && 'Create Student Account'}
                {mode === 'forgot' && 'Reset Password'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                {mode === 'signin' && 'Access your personalized workspaces, grades, XP, and experiment sync.'}
                {mode === 'signup' && 'Start your cross-platform virtual STEM journey with Cloud Firestore.'}
                {mode === 'forgot' && 'Enter your email address to receive password recovery instructions.'}
              </p>
            </div>

            {/* Mode Switcher Tabs (Sign In / Create Account) */}
            {mode !== 'forgot' && (
              <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 rounded-xl transition-all ${
                    mode === 'signin'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 rounded-xl transition-all ${
                    mode === 'signup'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Error & Success Feedback Banners */}
            {errorMsg && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex flex-col gap-2 animate-in fade-in"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{errorMsg}</span>
                </div>

                {/* Developer Diagnostic Panel */}
                {diagnostic && (
                  <div className="mt-1 pt-2 border-t border-rose-800/40 text-[11px] space-y-1.5 font-mono text-rose-300">
                    <div className="flex items-center justify-between text-slate-400 font-sans">
                      <span className="font-semibold text-rose-300">Diagnostic Details</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{diagnostic.platform}</span>
                    </div>
                    <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 text-slate-300 space-y-1">
                      <div><span className="text-slate-500">Error Code:</span> <span className="text-amber-400">{diagnostic.code}</span></div>
                      <div className="text-[11px] text-slate-400 font-sans leading-snug">{diagnostic.hint}</div>
                    </div>
                    {(diagnostic.code === 'auth/configuration-not-found' || diagnostic.code === 'auth/operation-not-allowed') && (
                      <button
                        type="button"
                        onClick={handleContinueAsGuest}
                        className="w-full mt-2 py-1.5 px-3 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-200 font-sans font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Continue Immediately in Offline Laboratory Mode</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {successMsg && (
              <div
                role="status"
                className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Sign Up only) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="full-name-input"
                    className="block text-xs font-semibold text-slate-300"
                  >
                    Student / Teacher Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="full-name-input"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Class Selection (Sign Up only) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="grade-level-select"
                    className="block text-xs font-semibold text-slate-300"
                  >
                    Curriculum Level
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="grade-level-select"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors appearance-none"
                    >
                      <option value="Class 10 Foundation">CBSE Class 10 Foundation</option>
                      <option value="Class 11 Science">CBSE Class 11 Science (PCMB)</option>
                      <option value="Class 12 Science">CBSE Class 12 Science (Board Exams)</option>
                      <option value="NEET Biology Focus">NEET Biology Aspirant</option>
                      <option value="Teacher Portal">Teacher / Laboratory Educator</option>
                    </select>
                  </div>
                </div>
              )}

              {/* School / Institution Name (Sign Up optional) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="school-name-input"
                    className="block text-xs font-semibold text-slate-300"
                  >
                    School or Institution (Optional)
                  </label>
                  <input
                    id="school-name-input"
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Kendriya Vidyalaya / Prayoga Partner School"
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email-address-input"
                  className="block text-xs font-semibold text-slate-300"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="email-address-input"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@school.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password Input (Sign In / Sign Up) */}
              {mode !== 'forgot' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password-input"
                      className="block text-xs font-semibold text-slate-300"
                    >
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Laboratory Request...</span>
                  </>
                ) : mode === 'signin' ? (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : mode === 'signup' ? (
                  <>
                    <span>Create Account & Start Learning</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <Mail className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Forgot Mode Return Button */}
            {mode === 'forgot' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  ← Back to Sign In
                </button>
              </div>
            )}

            {/* Offline & Guest Divider */}
            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-slate-900 text-slate-500 font-medium uppercase tracking-wider text-[10px]">
                  Or explore instantly
                </span>
              </div>
            </div>

            {/* Frictionless Secondary Actions */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleContinueAsGuest}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                <FlaskConical className="w-4 h-4 text-emerald-400" />
                <span>Guest Mode</span>
              </button>

              <Link
                to="/welcome"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Public Tour</span>
              </Link>
            </div>
          </div>

          {/* Footer security badges */}
          <div className="mt-6 text-center space-y-1">
            <p className="text-[11px] text-slate-500">
              PrayogaProof Virtual STEM Laboratory • CBSE & NEET Aligned
            </p>
            <p className="text-[10px] text-slate-600">
              Offline-ready PWA with Cloud Firestore data isolation
            </p>
          </div>
        </div>
      </main>

      {/* Footer minimal info */}
      <footer className="relative z-10 py-3 text-center text-xs text-slate-600 border-t border-slate-900">
        <span>© 2026 PrayogaProof. All scientific simulations & laboratories secured.</span>
      </footer>
    </div>
  );
};

export default LoginPage;
