import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useNotification } from '../context/NotificationContext.js';
import { Button } from '../components/ui/Button.js';
import { ArrowLeft } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || !newPassword) return;

    if (newPassword !== confirmPassword) {
      error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword,
      });
      success(res.message);
      navigate('/login');
    } catch (err: any) {
      error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-charcoal-200/80 shadow-elevated p-8 sm:p-10 animate-fade-in">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-charcoal-500 hover:text-charcoal-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>

        <h1 className="text-xl font-bold text-charcoal-900 mb-1">Set New Password</h1>
        <p className="text-xs text-charcoal-500 mb-6 leading-relaxed">
          Enter the security token and choose your new password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Reset Token
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 8-character token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};
