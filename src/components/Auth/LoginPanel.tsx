import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Mountain,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  User,
  Phone,
  Building,
  ChevronDown
} from 'lucide-react';
import { BhuShaktiLogo } from './BhuShaktiLogo';
import { UserRole } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/apiClient';
import { GoogleAccountChooserModal } from './GoogleAccountChooserModal';

interface LoginPanelProps {
  onSuccess?: () => void;
  className?: string;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'Disaster Management Officer', label: 'Disaster Management Officer' },
  { value: 'Administrator', label: 'Administrator' },
  { value: 'Emergency Responder', label: 'Emergency Responder' },
  { value: 'Field Officer', label: 'Field Officer' },
  { value: 'Researcher', label: 'Researcher' },
  { value: 'Viewer', label: 'Viewer' }
];

export const LoginPanel: React.FC<LoginPanelProps> = ({
  onSuccess,
  className = ''
}) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');

  // Sign In fields (Must start empty as per Section 14 & 19)
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regOrg, setRegOrg] = useState('NER Disaster Management Authority');
  const [regRole, setRegRole] = useState<UserRole>('Disaster Management Officer');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot password modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [previewCode, setPreviewCode] = useState<string | null>(null);

  // Google Account Chooser Modal state
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sign in submit
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!signInEmail.trim() || !signInPassword) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(signInEmail.trim(), signInPassword, rememberMe);
      setSuccessMsg('Authenticated successfully. Redirecting to Command Center...');
      setTimeout(() => {
        onSuccess?.();
      }, 650);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regFullName.trim()) {
      setErrorMsg('Full legal name is required.');
      return;
    }
    if (!regEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setErrorMsg('A valid official email is required.');
      return;
    }
    if (!regPhone.trim() || regPhone.trim().length < 8) {
      setErrorMsg('A valid emergency contact number is required.');
      return;
    }
    if (regPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        full_name: regFullName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        organization: regOrg.trim(),
        role: regRole,
        password: regPassword,
        confirm_password: regConfirmPassword,
        agree_terms: true
      });
      setSuccessMsg('Account registered successfully! Redirecting...');
      setTimeout(() => {
        onSuccess?.();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password request
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMsg('Please enter your account email.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword(forgotEmail.trim());
      setSuccessMsg(res.message);
      if (res.previewResetCode) {
        setPreviewCode(res.previewResetCode);
        setForgotCode(res.previewResetCode);
      }
      setForgotStep('reset');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password reset
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotCode.trim() || !forgotNewPassword) {
      setErrorMsg('Verification code and new password are required.');
      return;
    }
    if (forgotNewPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.resetPassword({
        email: forgotEmail.trim(),
        token: forgotCode.trim(),
        new_password: forgotNewPassword
      });
      setSuccessMsg(res.message);
      setTimeout(() => {
        setForgotModalOpen(false);
        setForgotStep('request');
        setSignInEmail(forgotEmail);
        setSignInPassword(forgotNewPassword);
        setTab('signin');
      }, 1400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  // SSO Action
  const handleSocialClick = (provider: 'Google' | 'Microsoft') => {
    if (provider === 'Google') {
      setErrorMsg(null);
      setSuccessMsg(null);
      setGoogleModalOpen(true);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      login('admin@bhusakthi.gov.in', 'BhuShakti@2026')
        .then(() => {
          setSuccessMsg(`Authenticated via ${provider} Workspace.`);
          setTimeout(() => onSuccess?.(), 600);
        })
        .catch((e) => {
          setErrorMsg(e.message);
          setIsLoading(false);
        });
    }, 700);
  };

  return (
    <div
      className={`relative w-full max-w-[470px] rounded-[28px] bg-[rgba(4,25,47,0.88)] border border-[rgba(0,210,255,0.45)] backdrop-blur-[24px] p-7 sm:p-9 shadow-[0_0_50px_-10px_rgba(0,210,255,0.25)] flex flex-col justify-between select-none ${className}`}
    >
      {/* Top subtle cyan specular accent */}
      <div className="absolute top-0 inset-x-10 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

      {/* Vertical Watermark on right edge (matching reference image) */}
      <div className="hidden lg:block absolute -right-10 top-1/2 -translate-y-1/2 rotate-90 origin-center text-[9px] tracking-[0.35em] font-mono text-cyan-300/40 select-none whitespace-nowrap pointer-events-none">
        DISASTER INTELLIGENCE FOR A SAFER TOMORROW
      </div>

      <div>
        {/* PANEL HEADER: LOGO & BRANDING */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="flex items-center gap-3 mb-1">
            <BhuShaktiLogo size={38} glow={false} />
            <span className="text-xl font-black tracking-tight text-white font-sans">
              BHUSAKTHI <span className="text-[#00D9FF] font-mono">AI</span>
            </span>
          </div>
          <span className="text-xs font-semibold text-cyan-200/90 tracking-wide">
            Disaster Intelligence Platform
          </span>
        </div>

        {/* TITLE: Welcome Back */}
        <div className="text-center mb-5">
          <h2 className="text-2xl sm:text-[28px] font-black text-white tracking-tight leading-tight">
            {tab === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-cyan-100/80 mt-1 font-medium">
            {tab === 'signin'
              ? 'Sign in to continue to your account'
              : 'Join the National Disaster Early Warning Network'}
          </p>
        </div>

        {/* SEGMENTED TAB CONTROL: [ Sign In ] [ Create Account ] */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#031326]/90 border border-cyan-500/25 mb-5 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'signin'
                ? 'bg-gradient-to-r from-[#00D9FF] to-[#007BFF] text-white shadow-[0_0_18px_rgba(0,217,255,0.45)]'
                : 'text-cyan-200/70 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-gradient-to-r from-[#00D9FF] to-[#007BFF] text-white shadow-[0_0_18px_rgba(0,217,255,0.45)]'
                : 'text-cyan-200/70 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* FEEDBACK BANNERS */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* SIGN IN FORM                                             */}
        {/* ======================================================== */}
        {tab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email or Username Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-cyan-100 tracking-wide">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/80 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="Email or Username"
                  className="w-full h-[54px] sm:h-[58px] pl-11 pr-4 rounded-2xl bg-[#031529]/80 border border-cyan-400/40 text-white text-xs sm:text-sm font-medium placeholder-cyan-300/40 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-cyan-100 tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/80 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-[54px] sm:h-[58px] pl-11 pr-11 rounded-2xl bg-[#031529]/80 border border-cyan-400/40 text-white text-xs sm:text-sm font-medium placeholder-cyan-300/40 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cyan-400/70 hover:text-cyan-200 cursor-pointer p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-cyan-100/90 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-cyan-500/50 text-cyan-500 focus:ring-cyan-400 bg-[#031529] cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotEmail(signInEmail);
                  setForgotModalOpen(true);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Main Action Button: Sign In → */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[54px] sm:h-[58px] rounded-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.65)] hover:-translate-y-0.5 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Divider: ──────── OR ──────── */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cyan-900/60" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-[#04192f] px-3 text-cyan-300/70 font-mono font-bold">OR</span>
              </div>
            </div>

            {/* Social Logins: Continue with Google & Continue with Microsoft */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSocialClick('Google')}
                className="w-full h-11 rounded-2xl bg-[#031529]/90 hover:bg-[#062444] border border-cyan-500/30 hover:border-cyan-400 text-xs font-semibold text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm hover:shadow-cyan-950"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="truncate">Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialClick('Microsoft')}
                className="w-full h-11 rounded-2xl bg-[#031529]/90 hover:bg-[#062444] border border-cyan-500/30 hover:border-cyan-400 text-xs font-semibold text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm hover:shadow-cyan-950"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                <span className="truncate">Continue with Microsoft</span>
              </button>
            </div>
          </form>
        ) : (
          /* ======================================================== */
          /* CREATE ACCOUNT FORM                                      */
          /* ======================================================== */
          <form onSubmit={handleRegister} className="space-y-3">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-cyan-100">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/80" />
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Dr. Rajesh Bordoloi"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#031529]/80 border border-cyan-400/40 text-white text-xs font-medium focus:border-cyan-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-cyan-100">Email</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="rajesh@sdma.gov.in"
                  className="w-full h-11 px-3 rounded-xl bg-[#031529]/80 border border-cyan-400/40 text-white text-xs font-mono focus:border-cyan-300 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-cyan-100">Phone</label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 94350 XXXXX"
                  className="w-full h-11 px-3 rounded-xl bg-[#031529]/80 border border-cyan-400/40 text-white text-xs font-mono focus:border-cyan-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Organization & Role */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-cyan-100">Organization</label>
                <input
                  type="text"
                  required
                  value={regOrg}
                  onChange={(e) => setRegOrg(e.target.value)}
                  placeholder="NDRF / SDMA"
                  className="w-full h-11 px-3 rounded-xl bg-[#031529]/80 border border-cyan-400/40 text-white text-xs focus:border-cyan-300 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-cyan-100">Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full h-11 px-2.5 rounded-xl bg-[#031529]/80 border border-cyan-400/40 text-white text-xs focus:border-cyan-300 focus:outline-none cursor-pointer"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value} className="bg-[#04192f] text-white">
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-cyan-100">Password</label>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 8 chars"
                  className="w-full h-11 px-3 rounded-xl bg-[#031529]/80 border border-cyan-400/40 text-white text-xs font-mono focus:border-cyan-300 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-cyan-100">Confirm</label>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Repeat pwd"
                  className="w-full h-11 px-3 rounded-xl bg-[#031529]/80 border border-cyan-400/40 text-white text-xs font-mono focus:border-cyan-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[52px] rounded-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              {isLoading ? 'Creating Account...' : 'Create BHUSAKTHI Account →'}
            </button>

            {/* Quick Google Sign Up Option */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cyan-800/40" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#04192f] px-2 text-cyan-400/80 font-mono">OR SIGN UP WITH</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSocialClick('Google')}
              className="w-full h-11 rounded-2xl bg-[#031529]/90 hover:bg-[#062444] border border-cyan-500/30 hover:border-cyan-400 text-xs font-semibold text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm hover:shadow-cyan-950"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="truncate">Sign up with Google</span>
            </button>
          </form>
        )}
      </div>

      {/* SECURITY FOOTER */}
      <div className="mt-5 pt-3 border-t border-cyan-900/50 flex items-center justify-center gap-2 text-[11px] text-cyan-300/80 font-mono text-center">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>Secure • Reliable • Built for a Safer Tomorrow</span>
      </div>

      {/* ======================================================== */}
      {/* FORGOT PASSWORD MODAL                                    */}
      {/* ======================================================== */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#04192f] border border-cyan-400/60 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-900/60 mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-200">
                  Password Recovery Protocol
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {forgotStep === 'request' ? (
              <form onSubmit={handleForgotRequest} className="space-y-4">
                <p className="text-xs text-cyan-100/80 leading-relaxed">
                  Enter your registered officer email address to receive an autonomous recovery verification token.
                </p>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-cyan-200">Account Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="officer@bhusakthi.gov.in"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#031529] border border-cyan-500/40 text-white text-xs font-mono focus:border-cyan-300 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#031529] hover:bg-slate-800 text-xs font-semibold text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
                  >
                    {isLoading ? 'Sending...' : 'Generate Reset Token →'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotReset} className="space-y-4">
                <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-400/40 text-xs text-cyan-200">
                  <span>Recovery verification code generated for <b>{forgotEmail}</b>.</span>
                  {previewCode && (
                    <div className="mt-2 p-2 rounded bg-[#031529] border border-cyan-400 text-center font-mono text-base font-black tracking-widest text-cyan-300">
                      {previewCode}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-cyan-200">Verification Code</label>
                  <input
                    type="text"
                    required
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value)}
                    placeholder="6-digit code"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#031529] border border-cyan-500/40 text-white text-xs font-mono focus:border-cyan-300 focus:outline-none text-center tracking-widest"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-cyan-200">New Password (Min 8 chars)</label>
                  <input
                    type="password"
                    required
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#031529] border border-cyan-500/40 text-white text-xs font-mono focus:border-cyan-300 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('request')}
                    className="px-4 py-2 rounded-xl bg-[#031529] hover:bg-slate-800 text-xs font-semibold text-slate-300 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
                  >
                    {isLoading ? 'Saving...' : 'Save New Password & Sign In'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Google Account Chooser & Live Popup Modal */}
      <GoogleAccountChooserModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onSuccess={onSuccess}
      />
    </div>
  );
};
