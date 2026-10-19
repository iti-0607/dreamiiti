import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { useNotification } from '../context/NotificationContext.js';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Coffee,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FocusPage: React.FC = () => {
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState('');

  const timerRef = useRef<any>(null);
  const { success, info } = useNotification();
  const queryClient = useQueryClient();

  // Load user tasks for selection
  const { data: tasksData } = useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: () => api.get('/tasks?view=all'),
  });

  // Load today focus stats
  const { data: focusStats } = useQuery({
    queryKey: ['focus-today'],
    queryFn: () => api.get('/focus/today'),
  });

  // Timer Tick
  useEffect(() => {
    if (isActive && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      handleCompleteSession();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, secondsRemaining]);

  const handleStart = async () => {
    try {
      if (!activeSessionId && !isBreak) {
        const res = await api.post('/focus/start', {
          taskId: selectedTaskId || undefined,
          targetMinutes,
        });
        setActiveSessionId(res.session.id);
      }
      setIsActive(true);
    } catch {
      setIsActive(true);
    }
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsRemaining(targetMinutes * 60);
  };

  const handleSelectPreset = (min: number) => {
    setIsActive(false);
    setIsBreak(false);
    setTargetMinutes(min);
    setSecondsRemaining(min * 60);
  };

  const handleStartBreak = (min: number) => {
    setIsActive(false);
    setIsBreak(true);
    setTargetMinutes(min);
    setSecondsRemaining(min * 60);
  };

  const handleCompleteSession = async () => {
    setIsActive(false);
    if (activeSessionId) {
      await api.post(`/focus/${activeSessionId}/end`, {
        status: 'COMPLETED',
      });
      queryClient.invalidateQueries({ queryKey: ['focus-today'] });
      setActiveSessionId(null);
    }

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
    success('Focus session complete! Take a gentle rest or stretch.');
  };

  const handleStopEarly = async () => {
    setIsActive(false);
    if (activeSessionId) {
      await api.post(`/focus/${activeSessionId}/end`, {
        status: 'STOPPED_EARLY',
      });
      queryClient.invalidateQueries({ queryKey: ['focus-today'] });
      setActiveSessionId(null);
    }
    info('Session saved. Every focused minute counts toward momentum.');
    handleReset();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent =
    ((targetMinutes * 60 - secondsRemaining) / (targetMinutes * 60)) * 100;

  const tasks = (tasksData?.tasks || []).filter((t: any) => t.status !== 'COMPLETED');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight flex items-center justify-center gap-2">
          <Clock className="w-6 h-6 text-sage-600" />
          <span>Distraction-Free Focus</span>
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Single-tasking with calm rhythm. No penalty for stopping early.
        </p>
      </div>

      {/* Main Focus Dial Card */}
      <Card
        className={`p-8 sm:p-12 text-center transition-all ${
          isActive ? 'focus-glow border-sage-500/50' : 'border-charcoal-200/90'
        }`}
      >
        {/* Preset Selector */}
        {!isActive && (
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {[15, 25, 45, 60].map((min) => (
              <button
                key={min}
                onClick={() => handleSelectPreset(min)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  targetMinutes === min && !isBreak
                    ? 'bg-sage-600 text-white shadow-sm'
                    : 'bg-ivory-100 hover:bg-ivory-200 text-charcoal-700'
                }`}
              >
                {min}m Focus
              </button>
            ))}
            <button
              onClick={() => handleStartBreak(5)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isBreak && targetMinutes === 5
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              5m Break
            </button>
          </div>
        )}

        {/* Circular Display */}
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center mb-8">
          {/* Background Ring */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="#EBE7DE"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke={isBreak ? '#E5A93C' : '#2E6F52'}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 110}
              strokeDashoffset={2 * Math.PI * 110 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-extrabold text-charcoal-900 tracking-tight font-mono">
              {formatTime(secondsRemaining)}
            </div>
            <div className="text-xs font-semibold text-charcoal-500 mt-2 uppercase tracking-widest">
              {isBreak ? 'Restorative Break' : 'Deep Flow'}
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-3">
          {!isActive ? (
            <Button
              variant="primary"
              size="lg"
              icon={<Play className="w-5 h-5 fill-current" />}
              onClick={handleStart}
              className="px-8 font-bold"
            >
              Begin Session
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="lg"
                icon={<Pause className="w-5 h-5" />}
                onClick={handlePause}
              >
                Pause
              </Button>
              <Button
                variant="amber"
                size="lg"
                icon={<CheckCircle2 className="w-5 h-5" />}
                onClick={handleCompleteSession}
              >
                Complete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStopEarly}
                className="text-charcoal-400 hover:text-charcoal-700"
              >
                End Early
              </Button>
            </>
          )}

          {!isActive && secondsRemaining < targetMinutes * 60 && (
            <Button variant="ghost" size="lg" icon={<RotateCcw className="w-4 h-4" />} onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>

        {/* Task Attachment */}
        {!isActive && (
          <div className="mt-8 pt-6 border-t border-charcoal-100 max-w-sm mx-auto">
            <label className="block text-xs font-semibold text-charcoal-600 mb-1.5 text-left">
              Link Focus to a Task (Optional)
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:outline-none bg-white text-charcoal-800"
            >
              <option value="">No task linked (Open focus)</option>
              {tasks.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </Card>

      {/* Today's Focus Summary */}
      <Card className="p-5 flex items-center justify-around text-center">
        <div>
          <div className="text-2xl font-extrabold text-sage-700">
            {focusStats?.stats?.totalMinutes || 0}m
          </div>
          <div className="text-xs text-charcoal-500 font-medium mt-0.5">Focus Time Today</div>
        </div>
        <div className="h-8 w-px bg-charcoal-200" />
        <div>
          <div className="text-2xl font-extrabold text-charcoal-900">
            {focusStats?.stats?.completedSessionsCount || 0}
          </div>
          <div className="text-xs text-charcoal-500 font-medium mt-0.5">Sessions Completed</div>
        </div>
      </Card>
    </div>
  );
};
