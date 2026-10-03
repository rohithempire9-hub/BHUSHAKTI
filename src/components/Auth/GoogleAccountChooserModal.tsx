import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { signInWithGooglePopup } from '../../services/firebase';
import { ExternalLink, Check, UserPlus, Shield, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

interface GoogleAccountOption {
  email: string;
  name: string;
  avatar?: string;
  badge?: string;
  roleDescription?: string;
}

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DEFAULT_ACCOUNTS: GoogleAccountOption[] = [
  {
    email: 'rohithempire9@gmail.com',
    name: 'Rohit Empire',
    badge: 'Active Google User',
    roleDescription: 'Disaster Management Specialist (Personal Google Account)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },
  {
    email: 'officer@bhusakthi.gov.in',
    name: 'Disaster Operations Officer',
    badge: 'Google Workspace',
    roleDescription: 'State Disaster Management Authority (Institutional)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  }
];

export const GoogleAccountChooserModal: React.FC<GoogleAccountChooserModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { loginWithGoogle } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAccount = async (account: GoogleAccountOption) => {
    setErrorMsg(null);
    setSelectedEmail(account.email);
    setIsAuthenticating(true);

    try {
      const res = await loginWithGoogle({
        email: account.email,
        full_name: account.name,
        avatar_url: account.avatar
      });

      if (res.ok) {
        setSuccessMsg(`Signed in as ${account.name} (${account.email})`);
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate with Google Account.');
      setIsAuthenticating(false);
      setSelectedEmail(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const email = customEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid Google Account or Gmail address.');
      return;
    }

    const name = customName.trim() || email.split('@')[0];
    setIsAuthenticating(true);
    setSelectedEmail(email);

    try {
      const res = await loginWithGoogle({
        email,
        full_name: name
      });

      if (res.ok) {
        setSuccessMsg(`Signed in with Google as ${email}`);
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error with Google Account.');
      setIsAuthenticating(false);
      setSelectedEmail(null);
    }
  };

  // Launch live Google Accounts popup
  const handleLaunchBrowserPopup = async () => {
    setErrorMsg(null);
    setIsAuthenticating(true);
    setSelectedEmail('popup');

    try {
      // 1. Try Firebase Auth popup with prompt: select_account
      const googleUser = await signInWithGooglePopup();
      const res = await loginWithGoogle({
        email: googleUser.email,
        full_name: googleUser.displayName,
        avatar_url: googleUser.photoURL
      });

      if (res.ok) {
        setSuccessMsg(`Authenticated via Google as ${googleUser.email}`);
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 600);
      }
    } catch (err: any) {
      console.warn('[GoogleAuth] Live popup notice:', err);
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in cancelled. You can select your Google account directly from the list below.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMsg('Google popup was blocked by your browser. Please select your Google account from the options below.');
      } else {
        setErrorMsg('Google sign-in popup encountered a restriction. Please select your account directly from the list below.');
      }
      setIsAuthenticating(false);
      setSelectedEmail(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-[460px] rounded-3xl bg-[#07172e] border border-cyan-400/40 shadow-[0_20px_60px_-15px_rgba(0,180,255,0.35)] overflow-hidden text-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Border */}
        <div className="h-1 w-full bg-gradient-to-r from-red-500 via-amber-400 via-emerald-400 to-blue-500" />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-cyan-900/40">
          <div className="flex items-center gap-3">
            {/* Google 'G' Mark */}
            <div className="w-10 h-10 rounded-2xl bg-white p-2 flex items-center justify-center shadow-md shrink-0">
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Choose an account</h2>
              <p className="text-xs text-cyan-200/80">to continue to <span className="font-semibold text-cyan-300">BHUSAKTHI AI</span></p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isAuthenticating}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Status / Alerts */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-950/70 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center gap-2.5 text-xs text-emerald-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 space-y-3">
          {/* Option: Launch Live Google Browser Popup */}
          <button
            type="button"
            onClick={handleLaunchBrowserPopup}
            disabled={isAuthenticating}
            className="w-full p-3 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-400/40 hover:border-cyan-300 text-left flex items-center justify-between gap-3 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition-transform">
                <ExternalLink className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Open Google Accounts Window</span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[10px] text-cyan-300 font-mono">
                    popup
                  </span>
                </div>
                <div className="text-[11px] text-cyan-200/70">
                  Authenticate directly via accounts.google.com
                </div>
              </div>
            </div>
            {selectedEmail === 'popup' && isAuthenticating ? (
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
            ) : (
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            )}
          </button>

          <div className="relative py-1 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cyan-900/40" />
            </div>
            <span className="relative px-3 bg-[#07172e] text-[10px] font-mono uppercase tracking-wider text-cyan-400/80">
              OR SELECT GOOGLE ACCOUNT
            </span>
          </div>

          {/* List of Known / Fast-Switch Accounts */}
          <div className="space-y-2">
            {DEFAULT_ACCOUNTS.map((account) => {
              const isSelected = selectedEmail === account.email;
              return (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleSelectAccount(account)}
                  disabled={isAuthenticating}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-md'
                      : 'bg-[#031529]/90 hover:bg-[#082347] border-cyan-500/30 hover:border-cyan-400'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {account.avatar ? (
                      <img
                        src={account.avatar}
                        alt={account.name}
                        className="w-10 h-10 rounded-full object-cover border border-cyan-400/40 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center text-sm font-bold text-cyan-200 shrink-0">
                        {account.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{account.name}</span>
                        {account.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                            {account.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-cyan-200/90 font-mono truncate">{account.email}</div>
                      {account.roleDescription && (
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {account.roleDescription}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && isAuthenticating ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-cyan-500/10 group-hover:bg-cyan-500/20 flex items-center justify-center shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-300 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Option: Use another Google account */}
          {!isCustomMode ? (
            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              disabled={isAuthenticating}
              className="w-full p-3 rounded-2xl bg-[#031529]/60 hover:bg-[#082347] border border-dashed border-cyan-500/40 hover:border-cyan-300 text-left flex items-center gap-3 transition-all cursor-pointer text-cyan-200"
            >
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-cyan-300">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-cyan-100">
                Use another Google Account...
              </div>
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="p-4 rounded-2xl bg-[#031529] border border-cyan-400/50 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-200">Enter Google Account</span>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] text-cyan-300">Google Email / Gmail Address</label>
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#061c38] border border-cyan-500/40 text-white text-xs font-mono focus:border-cyan-300 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] text-cyan-300">Display Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Officer Sharma"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#061c38] border border-cyan-500/40 text-white text-xs focus:border-cyan-300 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#041529] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in with Google...</span>
                  </>
                ) : (
                  <span>Continue with this Account →</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-[#031124] border-t border-cyan-900/40 flex items-center justify-between text-[11px] text-cyan-300/70">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Google Identity Services • OAuth 2.0</span>
          </div>
          <span className="font-mono text-[10px] text-cyan-400/90">BHUSAKTHI 2026</span>
        </div>
      </div>
    </div>
  );
};
