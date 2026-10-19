import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { JournalEntry } from '../types/index.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Modal } from '../components/ui/Modal.js';
import { useNotification } from '../context/NotificationContext.js';
import {
  HeartHandshake,
  Plus,
  BookOpen,
  Sparkles,
  Lock,
  Smile,
  Search,
  Trash2,
  Calendar,
} from 'lucide-react';

export const WellnessPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalTags, setJournalTags] = useState('Reflection');

  // Daily Check-In State
  const [mood, setMood] = useState('good');
  const [energy, setEnergy] = useState('high');
  const [stress, setStress] = useState('low');
  const [checkInNote, setCheckInNote] = useState('');

  const { success, error } = useNotification();
  const queryClient = useQueryClient();

  // 1. Fetch Journal Entries
  const { data: journalData, isLoading } = useQuery({
    queryKey: ['journal', search],
    queryFn: () => api.get(`/wellness/journal?search=${search}`),
  });

  // 2. Fetch Today's Check-in
  const { data: checkInData } = useQuery({
    queryKey: ['wellness-checkin-today'],
    queryFn: () => api.get('/wellness/check-in/today'),
  });

  // 3. Fetch Reflection Prompts
  const { data: promptsData } = useQuery({
    queryKey: ['wellness-prompts'],
    queryFn: () => api.get('/wellness/prompts'),
  });

  // Check-In Mutation
  const saveCheckInMutation = useMutation({
    mutationFn: (data: any) => api.post('/wellness/check-in', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellness-checkin-today'] });
      success('Daily check-in saved.');
    },
  });

  // Journal Mutations
  const createJournalMutation = useMutation({
    mutationFn: (entry: any) => api.post('/wellness/journal', entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      success('Private reflection saved to journal.');
      setIsWriteOpen(false);
      setJournalContent('');
      setSelectedPrompt('');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to save entry');
    },
  });

  const deleteJournalMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/wellness/journal/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      success('Entry deleted.');
    },
  });

  const handleSaveCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    saveCheckInMutation.mutate({ mood, energy, stress, notes: checkInNote });
  };

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalContent.trim()) return;
    createJournalMutation.mutate({
      prompt: selectedPrompt || undefined,
      content: journalContent.trim(),
      tags: journalTags.trim() || undefined,
    });
  };

  const entries: JournalEntry[] = journalData?.entries || [];
  const prompts: string[] = promptsData?.prompts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-lavender-600" />
            <span>Wellness & Private Journal</span>
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Reflect on what feels manageable, notice friction without self-criticism, and track daily energy.
          </p>
        </div>

        <Button
          variant="lavender"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsWriteOpen(true)}
        >
          Write Journal Entry
        </Button>
      </div>

      {/* Privacy Guarantee Notice */}
      <div className="p-3.5 rounded-2xl bg-lavender-50/70 border border-lavender-200/80 flex items-center gap-2.5 text-xs text-lavender-900">
        <Lock className="w-4 h-4 text-lavender-700 shrink-0" />
        <span>
          <strong>Private by Design:</strong> Your journal entries are strictly private to you. They
          are never shared in community feeds, notifications, or third-party advertising.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Daily Mood & Energy Check-in */}
        <div>
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">
                Daily Check-in
              </h2>
            </div>

            {checkInData?.checkIn ? (
              <div className="p-4 rounded-xl bg-ivory-50 border border-charcoal-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-500">Recorded for today:</span>
                  <Badge variant="emerald" size="sm">
                    Logged ✓
                  </Badge>
                </div>
                <div>
                  Mood: <span className="font-bold capitalize">{checkInData.checkIn.mood}</span>
                </div>
                <div>
                  Energy: <span className="font-bold capitalize">{checkInData.checkIn.energy}</span>
                </div>
                {checkInData.checkIn.notes && (
                  <p className="font-serif italic text-charcoal-600 pt-1">
                    "{checkInData.checkIn.notes}"
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSaveCheckIn} className="space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    General Mood
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'great', label: 'Great ✨' },
                      { id: 'good', label: 'Good 🌿' },
                      { id: 'neutral', label: 'Neutral ☁️' },
                      { id: 'low', label: 'Tired 🕊️' },
                      { id: 'difficult', label: 'Heavy 🌧️' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMood(m.id)}
                        className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                          mood === m.id
                            ? 'bg-sage-600 text-white border-sage-700'
                            : 'bg-white border-charcoal-200 text-charcoal-700 hover:bg-ivory-50'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Energy Level
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['high', 'medium', 'low'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setEnergy(lvl)}
                        className={`p-2 rounded-xl border text-center capitalize font-semibold transition-all ${
                          energy === lvl
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-white border-charcoal-200 text-charcoal-700 hover:bg-ivory-50'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="One sentence on how you feel..."
                    value={checkInNote}
                    onChange={(e) => setCheckInNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full mt-2"
                  loading={saveCheckInMutation.isPending}
                >
                  Save Check-in
                </Button>
              </form>
            )}

            {/* Reflection Prompts List */}
            <div className="pt-4 border-t border-charcoal-100">
              <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-2">
                Reflection Prompts
              </span>
              <div className="space-y-1.5">
                {prompts.slice(0, 4).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedPrompt(p);
                      setIsWriteOpen(true);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-ivory-50/70 hover:bg-ivory-100 text-[11px] text-charcoal-700 transition-colors"
                  >
                    "{p}"
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right 2 Cols: Journal Entries List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-charcoal-800 uppercase tracking-wider">
              Journal Entries ({entries.length})
            </h2>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="text"
                placeholder="Search reflections..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-charcoal-200 bg-white focus:outline-none w-44"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-charcoal-400 text-xs">
              Loading journal entries...
            </div>
          ) : entries.length === 0 ? (
            <Card className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-lavender-100 text-lavender-700 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-charcoal-900 mb-1">Your journal is waiting</h3>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto mb-4">
                Capture what went well, what made starting difficult, or what you learned today.
              </p>
              <Button variant="lavender" size="sm" onClick={() => setIsWriteOpen(true)}>
                Write First Reflection
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <Card key={entry.id} className="p-5 space-y-2 border-charcoal-200/90 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-charcoal-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sage-600" />
                      {entry.date}
                    </span>
                    <button
                      onClick={() => deleteJournalMutation.mutate(entry.id)}
                      className="text-charcoal-300 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {entry.prompt && (
                    <div className="text-xs font-bold text-lavender-800 bg-lavender-50 px-2.5 py-1 rounded-md inline-block">
                      {entry.prompt}
                    </div>
                  )}

                  <p className="text-sm text-charcoal-800 leading-relaxed font-serif whitespace-pre-line">
                    {entry.content}
                  </p>

                  {entry.tags && (
                    <div className="pt-2 flex items-center gap-1.5">
                      {entry.tags.split(',').map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-charcoal-400 bg-ivory-100 px-2 py-0.5 rounded"
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Write Journal Modal */}
      <Modal
        isOpen={isWriteOpen}
        onClose={() => setIsWriteOpen(false)}
        title="Private Reflection Entry"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveJournal} className="space-y-4 text-xs">
          {selectedPrompt && (
            <div className="p-3 bg-lavender-50 border border-lavender-200 rounded-xl text-lavender-900 font-semibold">
              Prompt: "{selectedPrompt}"
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Reflective Writing *
            </label>
            <textarea
              rows={6}
              required
              placeholder="Write freely. No one else will ever see this..."
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-500/20 focus:border-lavender-500 font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Tags (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Reflection, Anti-Procrastination, Calm"
              value={journalTags}
              onChange={(e) => setJournalTags(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsWriteOpen(false)}>
              Cancel
            </Button>
            <Button variant="lavender" type="submit" loading={createJournalMutation.isPending}>
              Save to Journal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
