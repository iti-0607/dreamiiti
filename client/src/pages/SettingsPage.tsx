import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../api/client.js';
import { CoinLedger, PersonalReward, SixMonthOverview } from '../types/index.js';
import { Modal } from '../components/ui/Modal.js';
import { useNotification } from '../context/NotificationContext.js';
import {
  User,
  Target,
  Coins,
  Gift,
  Shield,
  LogOut,
  Save,
  Plus,
  Trash2,
  Check,
  Flame,
  AlertTriangle,
  History,
  Lock,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, logout, updateCoinBalance } = useAuth();
  const { success, warning, error } = useNotification();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'purpose' | 'coins' | 'rewards' | 'security'>('purpose');

  // Goals & Purpose state
  const { data: overviewData } = useQuery<SixMonthOverview>({
    queryKey: ['goals-overview'],
    queryFn: () => api.get('/goals/points/overview'),
  });

  const [lifePurpose, setLifePurpose] = useState('');
  const [sixMonthTitle, setSixMonthTitle] = useState('');
  const [sixMonthDesc, setSixMonthDesc] = useState('');
  const [sixMonthTarget, setSixMonthTarget] = useState('');

  // Sync overview when loaded
  React.useEffect(() => {
    if (overviewData) {
      setLifePurpose(overviewData.lifePurpose || '');
      setSixMonthTitle(overviewData.sixMonthGoalTitle || '');
      setSixMonthDesc(overviewData.sixMonthGoalDesc || '');
      setSixMonthTarget(overviewData.sixMonthGoalTarget || '');
    }
  }, [overviewData]);

  // Coins Ledger State
  const { data: ledgerData } = useQuery<CoinLedger>({
    queryKey: ['coins-ledger'],
    queryFn: () => api.get('/coins/ledger'),
  });

  const [defaultReward, setDefaultReward] = useState(10);
  const [defaultPenalty, setDefaultPenalty] = useState(5);
  const [penaltyEnabled, setPenaltyEnabled] = useState(false);

  React.useEffect(() => {
    if (ledgerData) {
      setDefaultReward(ledgerData.defaultTaskReward || 10);
      setDefaultPenalty(ledgerData.defaultPenalty || 5);
      setPenaltyEnabled(Boolean(ledgerData.defaultPenaltyEnabled));
    }
  }, [ledgerData]);

  // Personal Rewards State
  const { data: rewardsData } = useQuery<{ success: boolean; rewards: PersonalReward[] }>({
    queryKey: ['personal-rewards'],
    queryFn: () => api.get('/coins/rewards'),
  });
  const rewards = rewardsData?.rewards || [];

  // Add Reward Modal state
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardDesc, setRewardDesc] = useState('');
  const [rewardCost, setRewardCost] = useState(100);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Mutations
  const updatePurposeMutation = useMutation({
    mutationFn: (data: any) => api.put('/goals/points/six-month', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals-overview'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      success('Life Purpose and Six-Month Goal updated');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update goal');
    },
  });

  const updateCoinSettingsMutation = useMutation({
    mutationFn: (data: any) => api.put('/coins/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coins-ledger'] });
      success('Coin defaults and penalty rules saved');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update coin rules');
    },
  });

  const addRewardMutation = useMutation({
    mutationFn: (data: any) => api.post('/coins/rewards', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-rewards'] });
      setIsAddRewardOpen(false);
      setRewardTitle('');
      setRewardDesc('');
      setRewardCost(100);
      success('Personal reward added to your catalog');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to add reward');
    },
  });

  const deleteRewardMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/coins/rewards/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-rewards'] });
      success('Reward removed');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to remove reward');
    },
  });

  const redeemRewardMutation = useMutation({
    mutationFn: (id: string) => api.post(`/coins/rewards/${id}/redeem`, {}),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['personal-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['coins-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      if (res.newBalance !== undefined) {
        updateCoinBalance(res.newBalance - (user?.coinBalance || 0));
      }
      success(`Redemption claimed! Treat yourself.`);
    },
    onError: (err: any) => {
      error(err.message || 'Failed to redeem reward');
    },
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      error(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSavePurpose = (e: React.FormEvent) => {
    e.preventDefault();
    updatePurposeMutation.mutate({
      lifePurpose,
      sixMonthGoalTitle: sixMonthTitle,
      sixMonthGoalDesc: sixMonthDesc,
      sixMonthGoalTarget: sixMonthTarget,
    });
  };

  const handleSaveCoinSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateCoinSettingsMutation.mutate({
      defaultTaskReward: Number(defaultReward),
      defaultPenalty: Number(defaultPenalty),
      defaultPenaltyEnabled: penaltyEnabled,
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F2F7F3] tracking-tight">
            Settings & Discipline Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#98A69C] mt-1">
            Configure your purpose, coin incentives, personal rewards, and security.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151C17] border border-[#27352C] text-xs font-bold text-[#39E58C]">
            <Coins className="w-4 h-4" />
            <span>{ledgerData?.balance ?? user?.coinBalance ?? 0} Coins</span>
          </div>

          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-900/40 hover:bg-rose-900/40 text-xs font-bold text-rose-300 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#27352C] pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'purpose', label: 'Life Purpose & 6-Month Goal', icon: Target },
          { id: 'coins', label: 'Coins & Penalty Rules', icon: Coins },
          { id: 'rewards', label: 'Personal Rewards Store', icon: Gift },
          { id: 'security', label: 'Account & Security', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition shrink-0 ${
                isActive
                  ? 'bg-[#1B3024] text-[#39E58C] border border-[#39E58C]/40'
                  : 'text-[#98A69C] hover:text-[#F2F7F3] hover:bg-[#151C17]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PURPOSE & 6-MONTH GOAL */}
      {activeTab === 'purpose' && (
        <form onSubmit={handleSavePurpose} className="space-y-6">
          {/* Life Purpose */}
          <div className="bg-[#151C17] border border-[#27352C] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#F2F7F3]">Ultimate Life Purpose</h3>
                <p className="text-xs text-[#98A69C] mt-0.5">
                  Your overarching North Star that drives your everyday choices.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#39E58C] bg-[#1B3024] px-2.5 py-1 rounded-lg border border-[#27352C]">
                Core Anchor
              </span>
            </div>

            <textarea
              rows={3}
              value={lifePurpose}
              onChange={(e) => setLifePurpose(e.target.value)}
              placeholder="e.g. Master software engineering and build high-impact technologies while keeping my health and mind sharp."
              className="w-full px-4 py-3 rounded-xl bg-[#101713] border border-[#27352C] text-[#F2F7F3] placeholder-[#4E6155] text-sm focus:outline-none focus:border-[#39E58C] leading-relaxed"
            />
          </div>

          {/* 6-Month Goal */}
          <div className="bg-[#151C17] border border-[#27352C] rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#F2F7F3]">Current 6-Month Goal</h3>
              <p className="text-xs text-[#98A69C] mt-0.5">
                The single mission you are relentlessly committing to for the next 180 days.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={sixMonthTitle}
                  onChange={(e) => setSixMonthTitle(e.target.value)}
                  placeholder="e.g. Crack Senior Software Engineer at Top Tier Tech Company"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101713] border border-[#27352C] text-[#F2F7F3] text-sm focus:outline-none focus:border-[#39E58C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
                  Goal Target / Key Outcome
                </label>
                <input
                  type="text"
                  value={sixMonthTarget}
                  onChange={(e) => setSixMonthTarget(e.target.value)}
                  placeholder="e.g. Solve 300 LeetCode, ship 2 production microservices, secure offer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101713] border border-[#27352C] text-[#F2F7F3] text-sm focus:outline-none focus:border-[#39E58C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
                  Detailed Strategy & Description
                </label>
                <textarea
                  rows={3}
                  value={sixMonthDesc}
                  onChange={(e) => setSixMonthDesc(e.target.value)}
                  placeholder="Breakdown of how you will execute this week by week..."
                  className="w-full px-4 py-3 rounded-xl bg-[#101713] border border-[#27352C] text-[#F2F7F3] placeholder-[#4E6155] text-sm focus:outline-none focus:border-[#39E58C]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updatePurposeMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{updatePurposeMutation.isPending ? 'Saving...' : 'Save Life Mission'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: COINS & PENALTY RULES */}
      {activeTab === 'coins' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveCoinSettings} className="bg-[#151C17] border border-[#27352C] rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[#F2F7F3]">Incentive & Penalty Engine</h3>
              <p className="text-xs text-[#98A69C] mt-0.5">
                Every task and habit completion earns coins. Missing commitments can deduct coins to keep stakes real.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#101713] border border-[#27352C] space-y-2">
                <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider">
                  Default Task Reward
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={defaultReward}
                    onChange={(e) => setDefaultReward(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#0B0F0D] border border-[#27352C] text-[#39E58C] font-bold text-sm focus:outline-none focus:border-[#39E58C]"
                  />
                  <Coins className="w-4 h-4 text-[#39E58C] absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-[#98A69C]">
                  Coins earned upon completing a task or daily standard.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#101713] border border-[#27352C] space-y-2">
                <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider">
                  Default Missed Penalty
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={defaultPenalty}
                    onChange={(e) => setDefaultPenalty(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#0B0F0D] border border-[#27352C] text-rose-400 font-bold text-sm focus:outline-none focus:border-[#39E58C]"
                  />
                  <AlertTriangle className="w-4 h-4 text-rose-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-[#98A69C]">
                  Coins deducted if a scheduled commitment is abandoned.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#101713] border border-[#27352C] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#F2F7F3]">Enforce Missed-Task Penalties Globally</div>
                <div className="text-[11px] text-[#98A69C] mt-0.5">
                  When enabled, overdue tasks will deduct penalty coins at the end of the day.
                </div>
              </div>
              <input
                type="checkbox"
                checked={penaltyEnabled}
                onChange={(e) => setPenaltyEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-[#27352C] text-[#39E58C] focus:ring-0 bg-[#0B0F0D] accent-[#39E58C] cursor-pointer"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updateCoinSettingsMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Coin Rules</span>
              </button>
            </div>
          </form>

          {/* Ledger History */}
          <div className="bg-[#151C17] border border-[#27352C] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#39E58C]" />
                <h3 className="text-sm font-bold text-[#F2F7F3]">Discipline Ledger History</h3>
              </div>
              <span className="text-xs text-[#98A69C]">
                Total Earned: <strong className="text-[#39E58C]">+{ledgerData?.totalEarned || 0}</strong> • Spent:{' '}
                <strong className="text-amber-400">-{ledgerData?.totalSpent || 0}</strong>
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {!ledgerData?.transactions || ledgerData.transactions.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#98A69C]">No coin transactions yet.</div>
              ) : (
                ledgerData.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#101713] border border-[#27352C] text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#F2F7F3]">{tx.description}</div>
                      <div className="text-[10px] text-[#98A69C] mt-0.5">
                        {new Date(tx.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • <span className="uppercase text-[9px] font-bold tracking-wider">{tx.type}</span>
                      </div>
                    </div>
                    <span
                      className={`font-black text-sm ${
                        tx.amount >= 0 ? 'text-[#39E58C]' : 'text-rose-400'
                      }`}
                    >
                      {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PERSONAL REWARDS STORE */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-[#151C17] border border-[#27352C] p-5 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-[#F2F7F3]">Your Personal Rewards Store</h3>
              <p className="text-xs text-[#98A69C] mt-0.5">
                Define treats and privileges that you ONLY unlock with earned discipline coins.
              </p>
            </div>

            <button
              onClick={() => setIsAddRewardOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] font-bold text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Reward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rewards.length === 0 ? (
              <div className="col-span-2 bg-[#151C17] border border-[#27352C] rounded-2xl p-12 text-center text-xs text-[#98A69C]">
                No rewards configured. Add your first reward (e.g. "Sunday Cheat Meal" or "Buy New Book").
              </div>
            ) : (
              rewards.map((reward) => {
                const canAfford = (user?.coinBalance || 0) >= reward.coinCost;
                return (
                  <div
                    key={reward.id}
                    className="bg-[#151C17] border border-[#27352C] rounded-2xl p-5 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-2xl">{reward.icon || '🎁'}</div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1B3024] border border-[#27352C] text-[#39E58C] font-black text-xs">
                          <Coins className="w-3.5 h-3.5" />
                          <span>{reward.coinCost} Coins</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-[#F2F7F3] mt-3">
                        {reward.title || reward.name}
                      </h4>
                      {reward.description && (
                        <p className="text-xs text-[#98A69C] mt-1 leading-relaxed">
                          {reward.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#27352C]">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete reward "${reward.title || reward.name}"?`)) {
                            deleteRewardMutation.mutate(reward.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-[#98A69C] hover:text-rose-400 transition"
                        title="Delete reward"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (!canAfford) {
                            warning(`Need ${reward.coinCost - (user?.coinBalance || 0)} more coins to unlock.`);
                            return;
                          }
                          if (window.confirm(`Redeem "${reward.title || reward.name}" for ${reward.coinCost} coins?`)) {
                            redeemRewardMutation.mutate(reward.id);
                          }
                        }}
                        disabled={!canAfford || redeemRewardMutation.isPending}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          canAfford
                            ? 'bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] shadow-sm'
                            : 'bg-[#1B241E] text-[#4E6155] border border-[#27352C] cursor-not-allowed'
                        }`}
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>{canAfford ? 'Redeem Treat' : 'Locked'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & ACCOUNT */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <form onSubmit={handleChangePassword} className="bg-[#151C17] border border-[#27352C] rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#F2F7F3]">Change Password</h3>
              <p className="text-xs text-[#98A69C] mt-0.5">
                Keep your personal discipline logs and account secure.
              </p>
            </div>

            <div className="space-y-3 max-w-md">
              <div>
                <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101713] border border-[#27352C] text-[#F2F7F3] text-sm focus:outline-none focus:border-[#39E58C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101713] border border-[#27352C] text-[#F2F7F3] text-sm focus:outline-none focus:border-[#39E58C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101713] border border-[#27352C] text-[#F2F7F3] text-sm focus:outline-none focus:border-[#39E58C]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>

          {/* User Profile Info */}
          <div className="bg-[#151C17] border border-[#27352C] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[#F2F7F3]">{user?.name}</div>
              <div className="text-xs text-[#98A69C] mt-0.5">{user?.email}</div>
              <div className="text-[11px] text-[#4E6155] mt-2">
                User ID: <code className="text-[#98A69C]">{user?.id}</code>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-900/40 text-rose-300 font-bold text-xs hover:bg-rose-900/40 transition self-start sm:self-center"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of DreamIITi</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Reward Modal */}
      <Modal
        isOpen={isAddRewardOpen}
        onClose={() => setIsAddRewardOpen(false)}
        title="Add Personal Reward"
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!rewardTitle.trim()) return;
            addRewardMutation.mutate({
              name: rewardTitle.trim(),
              title: rewardTitle.trim(),
              description: rewardDesc.trim() || undefined,
              coinCost: Number(rewardCost) || 100,
              icon: '🎁',
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
              Reward Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Weekend Movie Night, Buy Mechanical Keyboard, Cheat Meal"
              value={rewardTitle}
              onChange={(e) => setRewardTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101713] border border-[#27352C] text-[#F2F7F3] text-sm focus:outline-none focus:border-[#39E58C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Only after hitting 100% of weekly habits"
              value={rewardDesc}
              onChange={(e) => setRewardDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101713] border border-[#27352C] text-[#F2F7F3] text-sm focus:outline-none focus:border-[#39E58C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
              Coin Cost *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min={10}
                max={5000}
                value={rewardCost}
                onChange={(e) => setRewardCost(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#101713] border border-[#27352C] text-[#39E58C] font-bold text-sm focus:outline-none focus:border-[#39E58C]"
              />
              <Coins className="w-4 h-4 text-[#39E58C] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddRewardOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#98A69C] hover:text-[#F2F7F3] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addRewardMutation.isPending}
              className="px-5 py-2 rounded-xl bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              Save Reward
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
