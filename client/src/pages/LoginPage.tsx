import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useNotification } from '../context/NotificationContext.js';
import { Button } from '../components/ui/Button.js';
import { Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      success('Welcome back to DreamIITi!');
      navigate('/app/today');
    } catch (err: any) {
      error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await login('demo@dreamiiti.app', 'dream123');
      success('Logged in with demo workspace!');
      navigate('/app/today');
    } catch (err: any) {
      error(err.message || 'Failed to log in with demo account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-charcoal-200/80 shadow-elevated p-8 sm:p-10 animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-sage-600 text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
              D
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-charcoal-900">
              DreamIITi
            </span>
          </Link>
          <h1 className="text-xl font-bold text-charcoal-900">Welcome back</h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Sign in to continue planning your life with calm intention.
          </p>
        </div>

        {/* 1-Click Demo Login */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-sage-300 bg-sage-50/80 hover:bg-sage-100/90 text-sage-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-sage-600" />
            <span>Try Demo Workspace (1-Click Login)</span>
          </button>
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-charcoal-200"></div>
            <span className="flex-shrink mx-4 text-charcoal-400 text-xs font-medium">or continue with email</span>
            <div className="flex-grow border-t border-charcoal-200"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-charcoal-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-sage-700 hover:text-sage-900 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            loading={loading}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-charcoal-100 text-center text-xs text-charcoal-500">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-sage-700 font-bold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
