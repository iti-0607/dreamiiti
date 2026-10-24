import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useNotification } from '../context/NotificationContext.js';
import { ArrowLeft, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const { success, error } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      success(res.message);
      if (res.resetToken) {
        setIssuedToken(res.resetToken);
      }
    } catch (err: any) {
      error(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F0D] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#151C17] rounded-3xl border border-[#27352C] shadow-2xl p-8 sm:p-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-[#98A69C] hover:text-[#39E58C] mb-6 font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>

        <h1 className="text-xl font-bold text-[#F2F7F3] mb-1">Reset Your Password</h1>
        <p className="text-xs text-[#98A69C] mb-6 leading-relaxed">
          Enter the email associated with your account and we will generate a secure reset link.
        </p>

        {issuedToken && (
          <div className="p-4 rounded-xl bg-[#1B3024] border border-[#39E58C]/40 mb-6 text-xs text-[#F2F7F3]">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-[#39E58C]">
              <KeyRound className="w-4 h-4 text-[#39E58C]" /> Development Reset Token:
            </div>
            <div className="font-mono bg-[#101713] p-2 rounded border border-[#27352C] text-center font-bold tracking-widest text-sm mb-3 text-[#39E58C]">
              {issuedToken}
            </div>
            <Link
              to={`/reset-password?token=${issuedToken}`}
              className="block w-full py-2 rounded-xl bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] font-bold text-center text-xs transition"
            >
              Proceed to Reset Password
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101713] border border-[#27352C] text-[#F2F7F3] placeholder-[#4E6155] text-sm focus:outline-none focus:border-[#39E58C]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>
      </div>
    </div>
  );
};
