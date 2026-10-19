import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../api/client.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { useNotification } from '../context/NotificationContext.js';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Download,
  Trash2,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, updateSettings, logout } = useAuth();
  const { success, error } = useNotification();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [focusDuration, setFocusDuration] = useState(user?.profile?.focusDuration || 25);
  const [workingHoursStart, setWorkingHoursStart] = useState(
    user?.profile?.workingHoursStart || '09:00'
  );
  const [workingHoursEnd, setWorkingHoursEnd] = useState(
    user?.profile?.workingHoursEnd || '18:00'
  );
  const [weekStartDay, setWeekStartDay] = useState(user?.profile?.weekStartDay || 'monday');

  // Preferences Form
  const [wellnessEnabled, setWellnessEnabled] = useState(
    user?.settings?.wellnessEnabled ?? true
  );
  const [gamificationEnabled, setGamificationEnabled] = useState(
    user?.settings?.gamificationEnabled ?? true
  );

  const [savingProfile, setSavingProfile] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        bio,
        focusDuration: Number(focusDuration),
        workingHoursStart,
        workingHoursEnd,
        weekStartDay,
      });
      await updateSettings({
        wellnessEnabled,
        gamificationEnabled,
      });
      success('Preferences saved successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to save settings');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleExportData = async () => {
    setDownloading(true);
    try {
      const data = await api.get('/user/export');
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `dreamiiti-export-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      success('Complete JSON personal data export downloaded.');
    } catch (err: any) {
      error(err.message || 'Failed to export data');
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        'Are you absolutely sure? This will permanently delete your account, dreams, goals, tasks, and private journal entries.'
      )
    ) {
      setDeleting(true);
      try {
        await api.delete('/user/account');
        await logout();
      } catch (err: any) {
        error(err.message || 'Failed to delete account');
        setDeleting(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-charcoal-700" />
          <span>Settings & Personalization</span>
        </h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Manage your daily rhythms, preferences, and private data controls.
        </p>
      </div>

      {/* Profile & Rhythms Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <Card className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-charcoal-100">
            <User className="w-5 h-5 text-sage-600" />
            <h2 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">
              Profile & Working Boundaries
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                disabled
                value={name}
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-600 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Email Address
              </label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-600 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Personal Bio / Core Motto
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Building systems, mastering CS, and living with intentionality."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 font-serif"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Focus Duration (min)
              </label>
              <select
                value={focusDuration}
                onChange={(e) => setFocusDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none bg-white"
              >
                <option value={15}>15 minutes</option>
                <option value={25}>25 minutes (Pomodoro)</option>
                <option value={45}>45 minutes (Deep)</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Working Day Starts
              </label>
              <input
                type="time"
                value={workingHoursStart}
                onChange={(e) => setWorkingHoursStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Working Day Ends
              </label>
              <input
                type="time"
                value={workingHoursEnd}
                onChange={(e) => setWorkingHoursEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Week Start Day
            </label>
            <select
              value={weekStartDay}
              onChange={(e) => setWeekStartDay(e.target.value)}
              className="w-full max-w-xs px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none bg-white capitalize"
            >
              <option value="monday">Monday (Recommended)</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>

          {/* Preferences Toggles */}
          <div className="space-y-3 pt-3 border-t border-charcoal-100">
            <label className="flex items-center justify-between p-3 rounded-xl bg-ivory-50/70 border border-charcoal-200/80 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-charcoal-900">
                  Wellness Check-in & Private Journal
                </div>
                <div className="text-[11px] text-charcoal-500">
                  Enable daily energy/mood logging and private reflection prompts
                </div>
              </div>
              <input
                type="checkbox"
                checked={wellnessEnabled}
                onChange={(e) => setWellnessEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-sage-600 focus:ring-sage-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-ivory-50/70 border border-charcoal-200/80 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-charcoal-900">
                  Gentle Botanical Gamification
                </div>
                <div className="text-[11px] text-charcoal-500">
                  Enable Habit Garden growth and gentle milestone celebration confetti
                </div>
              </div>
              <input
                type="checkbox"
                checked={gamificationEnabled}
                onChange={(e) => setGamificationEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-sage-600 focus:ring-sage-500"
              />
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <Button variant="primary" type="submit" loading={savingProfile}>
              Save Preferences
            </Button>
          </div>
        </Card>
      </form>

      {/* Data Export & Privacy */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-charcoal-100">
          <Download className="w-5 h-5 text-amber-600" />
          <h2 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">
            Data Portability & Export
          </h2>
        </div>

        <p className="text-xs text-charcoal-600 leading-relaxed">
          You own your data completely. Download a comprehensive JSON export of all your dreams,
          goals, milestones, tasks, habit logs, focus sessions, and private reflections anytime.
        </p>

        <Button
          variant="secondary"
          size="sm"
          icon={<Download className="w-4 h-4" />}
          onClick={handleExportData}
          loading={downloading}
        >
          Export All Personal Data (JSON)
        </Button>
      </Card>

      {/* Danger Zone: Account Deletion */}
      <Card className="p-6 sm:p-8 space-y-4 border-rose-200 bg-rose-50/30">
        <div className="flex items-center gap-2 pb-3 border-b border-rose-100">
          <Trash2 className="w-5 h-5 text-rose-600" />
          <h2 className="text-sm font-bold text-rose-900 uppercase tracking-wider">
            Delete Account
          </h2>
        </div>

        <p className="text-xs text-rose-800 leading-relaxed">
          Permanently remove your account and all associated dreams, goals, habits, and private journal
          records from the database. This action cannot be undone.
        </p>

        <Button
          variant="danger"
          size="sm"
          icon={<Trash2 className="w-4 h-4" />}
          onClick={handleDeleteAccount}
          loading={deleting}
        >
          Delete Account and All Data
        </Button>
      </Card>
    </div>
  );
};
