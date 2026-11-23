import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  LogOut 
} from 'lucide-react';
import { UserProfile } from '../types';
import { sound } from '../utils/sound';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  const [mode, setMode] = useState<'profile' | 'signin' | 'signup'>('profile');
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState('••••••••');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    onUpdateUser({
      ...currentUser,
      name: name.trim() || 'Alex Mercer',
      email: email.trim() || 'user@chronotask.io',
      avatar: selectedAvatar,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const handleGuestLogin = () => {
    sound.playClick();
    onUpdateUser({
      id: `usr_guest_${Date.now()}`,
      name: 'Guest Explorer',
      email: 'guest@chronotask.local',
      avatar: AVATAR_OPTIONS[1],
      soundEnabled: true,
      notificationsEnabled: true,
      theme: 'dark',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-md glass-modal rounded-3xl p-6 sm:p-7 text-slate-100 z-10 border border-slate-700/60 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {mode === 'profile' ? 'User Profile' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'profile' ? 'Manage your account and preferences' : 'Sync your tasks across devices'}
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
        <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 my-4 text-xs">
          <button
            type="button"
            onClick={() => setMode('profile')}
            className={`py-1.5 rounded-lg font-semibold transition-all ${
              mode === 'profile' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`py-1.5 rounded-lg font-semibold transition-all ${
              mode === 'signin' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-1.5 rounded-lg font-semibold transition-all ${
              mode === 'signup' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Avatar
            </label>
            <div className="flex items-center space-x-3">
              {AVATAR_OPTIONS.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Avatar option ${i + 1}`}
                  onClick={() => setSelectedAvatar(url)}
                  className={`w-12 h-12 rounded-2xl object-cover cursor-pointer transition-all border-2 ${
                    selectedAvatar === url
                      ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-105'
                      : 'border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 text-white"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 text-white"
              />
            </div>
          </div>

          {/* Password (for Sign In / Sign Up) */}
          {mode !== 'profile' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 text-white"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-3 space-y-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-1.5 transition-all"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>{mode === 'profile' ? 'Save Profile' : mode === 'signin' ? 'Sign In Now' : 'Create Account'}</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 font-medium border border-slate-700 transition-colors"
            >
              Continue as Guest (One-Click)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
