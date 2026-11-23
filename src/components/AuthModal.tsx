import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  LogOut, 
  AlertCircle, 
  Palette 
} from 'lucide-react';
import { UserProfile, ColorTheme } from '../types';
import { StorageService, DEFAULT_AVATARS } from '../services/storage';
import { sound } from '../utils/sound';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onUserAuthChange: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onUserAuthChange,
}) => {
  // If user is guest, default to 'signin' or 'signup'. If logged in, show 'profile'.
  const [mode, setMode] = useState<'profile' | 'signin' | 'signup'>(currentUser.isGuest ? 'signin' : 'profile');

  // Sign In clean state (NEVER PRE-FILLED)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up clean state (NEVER PRE-FILLED)
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpAvatar, setSignUpAvatar] = useState(DEFAULT_AVATARS[0]);

  // Profile Edit state
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileAvatar, setProfileAvatar] = useState(currentUser.avatar);
  const [colorTheme, setColorTheme] = useState<ColorTheme>(currentUser.colorTheme || 'emerald');

  const [authError, setAuthError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear fields and error whenever modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setAuthError(null);
      setSuccessMsg(null);
      setLoginEmail('');
      setLoginPassword('');
      setSignUpName('');
      setSignUpEmail('');
      setSignUpPassword('');
      setProfileName(currentUser.name);
      setProfileAvatar(currentUser.avatar);
      setColorTheme(currentUser.colorTheme || 'emerald');
      setMode(currentUser.isGuest ? 'signin' : 'profile');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Handle Sign In
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const result = StorageService.login(loginEmail, loginPassword);
    if (!result.success || !result.user) {
      setAuthError(result.error || 'Failed to sign in.');
      sound.playDelete();
      return;
    }

    sound.playComplete();
    setSuccessMsg(`Welcome back, ${result.user.name}!`);
    onUserAuthChange(result.user);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  // Handle Sign Up
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const result = StorageService.register(signUpName, signUpEmail, signUpPassword, signUpAvatar);
    if (!result.success || !result.user) {
      setAuthError(result.error || 'Failed to create account.');
      sound.playDelete();
      return;
    }

    sound.playComplete();
    setSuccessMsg(`Account created! Welcome, ${result.user.name}!`);
    onUserAuthChange(result.user);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  // Handle Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    const updated: UserProfile = {
      ...currentUser,
      name: profileName.trim() || 'Habit Builder',
      avatar: profileAvatar,
      colorTheme: colorTheme,
    };
    onUpdateUser(updated);
    setSuccessMsg('Profile updated!');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 700);
  };

  // Handle Logout
  const handleLogout = () => {
    sound.playClick();
    const guest = StorageService.logout();
    onUserAuthChange(guest);
    setSuccessMsg('Logged out. Switched to Guest mode.');
    setTimeout(() => {
      onClose();
    }, 700);
  };

  // 1-Click Guest
  const handleContinueAsGuest = () => {
    sound.playClick();
    const guest: UserProfile = {
      ...currentUser,
      name: 'Guest Explorer',
      isGuest: true,
    };
    StorageService.saveUser(guest);
    onUserAuthChange(guest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-md glass-modal rounded-3xl p-6 sm:p-7 text-slate-100 z-10 border border-emerald-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {mode === 'profile' ? 'My Account' : mode === 'signin' ? 'Sign In to ChronoTask' : 'Create Free Account'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'profile' ? 'Customize your habits and theme' : 'Your personal daily routine dashboard'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 my-4 text-xs font-semibold">
          {!currentUser.isGuest && (
            <button
              type="button"
              onClick={() => {
                setAuthError(null);
                setMode('profile');
              }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === 'profile' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Profile
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setAuthError(null);
              setMode('signin');
            }}
            className={`py-1.5 rounded-lg transition-all ${
              mode === 'signin' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            } ${currentUser.isGuest ? 'col-span-1' : ''}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthError(null);
              setMode('signup');
            }}
            className={`py-1.5 rounded-lg transition-all ${
              mode === 'signup' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            } ${currentUser.isGuest ? 'col-span-2' : ''}`}
          >
            Create Account
          </button>
        </div>

        {/* Status Alerts */}
        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={handleContinueAsGuest}
                className="w-full py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-400 font-medium border border-slate-800 transition-colors"
              >
                Skip & Continue as Guest
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGN UP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Choose Your Avatar
              </label>
              <div className="flex items-center space-x-2.5">
                {DEFAULT_AVATARS.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Avatar ${i + 1}`}
                    onClick={() => setSignUpAvatar(url)}
                    className={`w-10 h-10 rounded-xl object-cover cursor-pointer transition-all border-2 ${
                      signUpAvatar === url
                        ? 'border-emerald-400 ring-2 ring-emerald-500/40 scale-105'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Create a password (min 4 chars)"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
              >
                Create Account
              </button>

              <button
                type="button"
                onClick={handleContinueAsGuest}
                className="w-full py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-400 font-medium border border-slate-800 transition-colors"
              >
                Explore as Guest First
              </button>
            </div>
          </form>
        )}

        {/* 3. PROFILE / EDIT FORM (WHEN LOGGED IN) */}
        {mode === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Avatar
              </label>
              <div className="flex items-center space-x-2.5">
                {DEFAULT_AVATARS.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Avatar ${i + 1}`}
                    onClick={() => setProfileAvatar(url)}
                    className={`w-10 h-10 rounded-xl object-cover cursor-pointer transition-all border-2 ${
                      profileAvatar === url
                        ? 'border-emerald-400 ring-2 ring-emerald-500/40 scale-105'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 text-white"
                />
              </div>
            </div>

            {/* Color Theme Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-400" />
                <span>Color Accent Theme</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'emerald', label: 'Emerald', color: 'bg-emerald-500', border: 'border-emerald-500' },
                  { id: 'violet', label: 'Violet', color: 'bg-purple-500', border: 'border-purple-500' },
                  { id: 'amber', label: 'Amber', color: 'bg-amber-500', border: 'border-amber-500' },
                  { id: 'rose', label: 'Rose', color: 'bg-rose-500', border: 'border-rose-500' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setColorTheme(th.id as ColorTheme)}
                    className={`p-2 rounded-xl border flex flex-col items-center space-y-1 transition-all ${
                      colorTheme === th.id
                        ? `${th.border} bg-slate-800/80 ring-1 ring-white/20`
                        : 'border-slate-800 bg-slate-900/60 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${th.color}`} />
                    <span className="text-[10px] text-slate-300 font-medium">{th.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
              >
                Save Preferences
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
