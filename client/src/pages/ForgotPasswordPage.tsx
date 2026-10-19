import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useNotification } from '../context/NotificationContext.js';
import { Button } from '../components/ui/Button.js';
import { ArrowLeft, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const { success, error } = useNotification();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-charcoal-200/80 shadow-elevated p-8 sm:p-10 animate-fade-in">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-charcoal-500 hover:text-charcoal-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>

        <h1 className="text-xl font-bold text-charcoal-900 mb-1">Reset your password</h1>
        <p className="text-xs text-charcoal-500 mb-6 leading-relaxed">
          Enter the email associated with your account and we will generate a secure reset link.
        </p>

        {issuedToken && (
          <div className="p-4 rounded-xl bg-sage-50 border border-sage-200 mb-6 text-xs text-sage-900">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <KeyRound className="w-4 h-4 text-sage-700" /> Development Reset Token:
            </div>
            <div className="font-mono bg-white p-2 rounded border border-sage-200 text-center font-bold tracking-widest text-sm mb-2">
              {issuedToken}
            </div>
            <Link to={`/reset-password?token=${issuedToken}`}>
              <Button size="sm" variant="primary" className="w-full">
                Proceed to Reset Password
              </Button>
            </Link>
          </div>
        )}

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

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            Send Reset Instructions
          </Button>
        </form>
      </div>
    </div>
  );
};
