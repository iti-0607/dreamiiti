import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useNotification } from '../context/NotificationContext.js';
import { Button } from '../components/ui/Button.js';
import { Eye, EyeOff, Check, ArrowRight } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();

  // Password strength calculation
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const strengthScore = (hasMinLength ? 1 : 0) + (hasLetter ? 1 : 0) + (hasNumber ? 1 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;

    if (password !== confirmPassword) {
      error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password);
      success('Account created! Welcome to DreamIITi.');
      navigate('/onboarding');
    } catch (err: any) {
      error(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-charcoal-200/80 shadow-elevated p-8 sm:p-10 animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-sage-600 text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
              D
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-charcoal-900">
              DreamIITi
            </span>
          </Link>
          <h1 className="text-xl font-bold text-charcoal-900">Start your journey</h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Build sustainable consistency and turn your dreams into reality.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
            />
          </div>

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
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Create Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 6 characters"
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

            {/* Password Strength Feedback */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex gap-1 h-1.5 w-full bg-ivory-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      strengthScore === 1
                        ? 'w-1/3 bg-amber-500'
                        : strengthScore === 2
                        ? 'w-2/3 bg-sage-500'
                        : 'w-full bg-emerald-500'
                    }`}
                  />
                </div>
                <div className="flex items-center gap-3 text-[11px] text-charcoal-500">
                  <span className={hasMinLength ? 'text-emerald-700 font-medium' : ''}>
                    8+ chars
                  </span>
                  <span className={hasLetter ? 'text-emerald-700 font-medium' : ''}>
                    Letters
                  </span>
                  <span className={hasNumber ? 'text-emerald-700 font-medium' : ''}>
                    Numbers
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
            />
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded text-sage-600 focus:ring-sage-500"
            />
            <label htmlFor="terms" className="text-xs text-charcoal-600">
              I agree to the privacy policy and understand that my personal dreams and journals are
              strictly private.
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            loading={loading}
            disabled={!agreed}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Create My Workspace
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-charcoal-100 text-center text-xs text-charcoal-500">
          Already have an account?{' '}
          <Link to="/login" className="text-sage-700 font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
