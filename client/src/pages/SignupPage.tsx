import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useNotification } from '../context/NotificationContext.js';
import { Eye, EyeOff } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#0B0F0D] text-[#F2F7F3] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#151C17] rounded-2xl border border-[#27352C] shadow-2xl p-8 sm:p-10 animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <span className="font-extrabold text-2xl tracking-tight text-[#F2F7F3]">
              Dream<span className="text-[#39E58C]">IITi</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-[#F2F7F3]">Create your account</h1>
          <p className="text-xs text-[#98A69C] mt-1">
            Build discipline, track daily consistency, and reach your six-month goal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#98A69C] mb-1.5">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#27352C] bg-[#1B241E] text-sm text-[#F2F7F3] placeholder-[#98A69C]/50 focus:outline-none focus:border-[#39E58C] focus:ring-1 focus:ring-[#39E58C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#98A69C] mb-1.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#27352C] bg-[#1B241E] text-sm text-[#F2F7F3] placeholder-[#98A69C]/50 focus:outline-none focus:border-[#39E58C] focus:ring-1 focus:ring-[#39E58C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#98A69C] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#27352C] bg-[#1B241E] text-sm text-[#F2F7F3] placeholder-[#98A69C]/50 focus:outline-none focus:border-[#39E58C] focus:ring-1 focus:ring-[#39E58C] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A69C] hover:text-[#F2F7F3]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#98A69C] mb-1.5">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#27352C] bg-[#1B241E] text-sm text-[#F2F7F3] placeholder-[#98A69C]/50 focus:outline-none focus:border-[#39E58C] focus:ring-1 focus:ring-[#39E58C]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl font-semibold text-sm bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#98A69C]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#39E58C] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
