import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, User, Zap, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error } = useAuthStore();
  const { theme, toggleTheme } = useSettingsStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [touched, setTouched] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const valid = username.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    const ok = await login(username, password, remember);
    if (ok) navigate('/dashboard');
  };

  const fillDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="relative">
          <Logo size="lg" textClassName="text-white" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-medium">
            <ShieldCheck size={14} /> Enterprise-grade Monitoring
          </div>
          <h2 className="text-4xl font-bold leading-tight">Monitor your industrial energy in real time.</h2>
          <p className="text-white/80 max-w-md">Track power meters across multiple sites, detect anomalies, and optimize energy cost — all from a single command center.</p>
        </motion.div>
        <div className="relative grid grid-cols-3 gap-4 text-center">
          {[{ v: '4', l: 'Sites' }, { v: '21', l: 'Devices' }, { v: '99.9%', l: 'Uptime' }].map((s) => (
            <div key={s.l} className="rounded-2xl bg-white/10 backdrop-blur p-4">
              <p className="text-2xl font-bold">{s.v}</p>
              <p className="text-xs text-white/70">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <Logo />
            <button onClick={toggleTheme} className="btn-ghost !p-2">{theme === 'light' ? '🌙' : '☀️'}</button>
          </div>

          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your EMS account</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  className="input-field !pl-10"
                />
              </div>
              {touched && !username.trim() && <p className="text-xs text-danger-500 mt-1">Username is required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input-field !pl-10 !pr-10"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {touched && !password && <p className="text-xs text-danger-500 mt-1">Password is required</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                Remember me
              </label>
              <button type="button" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Forgot password?</button>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-danger-600 bg-danger-500/10 px-3 py-2 rounded-xl">
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary w-full !py-3">
              {isLoading ? <><Spinner size={18} /> Signing in…</> : <><Zap size={16} /> Sign in</>}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Demo accounts</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[['admin', 'admin'], ['engineer', 'engineer'], ['operator', 'operator'], ['viewer', 'viewer']].map(([u, p]) => (
                <button key={u} onClick={() => fillDemo(u, p)} className="text-left px-2.5 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                  <span className="font-medium">{u}</span> / {p}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
