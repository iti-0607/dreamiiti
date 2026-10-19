import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useNotification } from '../context/NotificationContext.js';
import { api } from '../api/client.js';
import { Button } from '../components/ui/Button.js';
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Coins,
  Palette,
  Compass,
  Check,
  Clock,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user, updateProfile, updateSettings } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();

  // Step 1: Life areas
  const [selectedAreas, setSelectedAreas] = useState<string[]>([
    'Career & Learning',
    'Health & Routine',
    'Personal Growth',
  ]);

  // Step 2: First dream
  const [dreamTitle, setDreamTitle] = useState('');
  const [dreamMotivation, setDreamMotivation] = useState('');

  // Step 3: Horizon
  const [horizon, setHorizon] = useState('3_months');

  // Step 4: Availability
  const [focusDuration, setFocusDuration] = useState(25);
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('18:00');

  // Step 5: Preferences
  const [weekStartDay, setWeekStartDay] = useState('monday');
  const [wellnessEnabled, setWellnessEnabled] = useState(true);

  const areasList = [
    { name: 'Career & Learning', icon: Briefcase, color: 'text-sage-700 bg-sage-50 border-sage-200' },
    { name: 'Health & Routine', icon: HeartPulse, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { name: 'Financial Freedom', icon: Coins, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { name: 'Creativity & Hobbies', icon: Palette, color: 'text-lavender-700 bg-lavender-50 border-lavender-200' },
    { name: 'Personal Growth', icon: Compass, color: 'text-sage-800 bg-sage-50 border-sage-200' },
  ];

  const toggleArea = (name: string) => {
    setSelectedAreas((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      // 1. Update Profile & Settings
      await updateProfile({
        currentHorizon: horizon,
        focusDuration,
        workingHoursStart,
        workingHoursEnd,
        weekStartDay,
      });

      await updateSettings({
        wellnessEnabled,
      });

      // 2. Create Initial Dream if provided
      if (dreamTitle.trim()) {
        await api.post('/dreams', {
          title: dreamTitle.trim(),
          motivation: dreamMotivation.trim() || undefined,
          timeframe: horizon,
        });
      }

      success('Your personalized workspace is ready!');
      navigate('/app/today');
    } catch (err: any) {
      error(err.message || 'Failed to finish onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-charcoal-200/80 shadow-elevated p-6 sm:p-10 animate-fade-in relative">
        {/* Progress Dots */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-charcoal-100">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === step
                    ? 'w-8 bg-sage-600'
                    : i < step
                    ? 'w-2 bg-sage-300'
                    : 'w-2 bg-charcoal-200'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => navigate('/app/today')}
            className="text-xs text-charcoal-400 hover:text-charcoal-700 font-medium"
          >
            Skip for now
          </button>
        </div>

        {/* Step 1: Welcome & Life Areas */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-50 text-sage-800 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-sage-600" />
                <span>Step 1 of 6</span>
              </div>
              <h2 className="text-2xl font-bold text-charcoal-900">What would you like to nurture?</h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Choose the life areas that matter most right now. You can customize them anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {areasList.map((area) => {
                const Icon = area.icon;
                const isSelected = selectedAreas.includes(area.name);
                return (
                  <button
                    type="button"
                    key={area.name}
                    onClick={() => toggleArea(area.name)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? `${area.color} border-current shadow-sm scale-[1.01]`
                        : 'bg-white border-charcoal-200/80 text-charcoal-700 hover:bg-ivory-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="text-xs font-semibold">{area.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="primary"
                onClick={() => setStep(2)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Capture First Dream */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lavender-50 text-lavender-800 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-lavender-600" />
                <span>Step 2 of 6</span>
              </div>
              <h2 className="text-2xl font-bold text-charcoal-900">Plant your first dream</h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Name something you genuinely wish to accomplish or become. Don't worry about perfection.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Dream Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master full-stack architecture or Run a 10K"
                  value={dreamTitle}
                  onChange={(e) => setDreamTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Why does this matter to you?
                </label>
                <textarea
                  rows={3}
                  placeholder="Connecting your dream to your internal 'why' makes consistency joyful."
                  value={dreamMotivation}
                  onChange={(e) => setDreamMotivation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(3)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Horizon */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-2">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Step 3 of 6</span>
              </div>
              <h2 className="text-2xl font-bold text-charcoal-900">Choose your primary planning horizon</h2>
              <p className="text-xs text-charcoal-500 mt-1">
                A 3-month horizon is ideal for major skill acquisition without distant horizon fatigue.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: '1_month', label: '1 Month', desc: 'Sprint focus' },
                { id: '3_months', label: '3 Months (Recommended)', desc: 'Quarterly mastery' },
                { id: '6_months', label: '6 Months', desc: 'Major transformation' },
                { id: '1_year', label: '1 Year', desc: 'Long-term ambition' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setHorizon(opt.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    horizon === opt.id
                      ? 'bg-sage-50 border-sage-500 text-sage-900 shadow-sm'
                      : 'bg-white border-charcoal-200 hover:bg-ivory-50 text-charcoal-700'
                  }`}
                >
                  <div className="font-bold text-sm">{opt.label}</div>
                  <div className="text-xs text-charcoal-500 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(4)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Availability & Focus */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-50 text-sage-800 text-xs font-semibold mb-2">
                <Clock className="w-3.5 h-3.5 text-sage-600" />
                <span>Step 4 of 6</span>
              </div>
              <h2 className="text-2xl font-bold text-charcoal-900">Rhythm and focus interval</h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Setting realistic boundaries prevents calendar burnout.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Preferred Focus Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 25, 45, 60].map((min) => (
                    <button
                      type="button"
                      key={min}
                      onClick={() => setFocusDuration(min)}
                      className={`py-2.5 rounded-xl border font-bold text-xs transition-all ${
                        focusDuration === min
                          ? 'bg-sage-600 text-white border-sage-700'
                          : 'bg-white border-charcoal-200 text-charcoal-700 hover:bg-ivory-50'
                      }`}
                    >
                      {min} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                    Working Hours Start
                  </label>
                  <input
                    type="time"
                    value={workingHoursStart}
                    onChange={(e) => setWorkingHoursStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                    Working Hours End
                  </label>
                  <input
                    type="time"
                    value={workingHoursEnd}
                    onChange={(e) => setWorkingHoursEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(5)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Planning Preferences */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lavender-50 text-lavender-800 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-lavender-600" />
                <span>Step 5 of 6</span>
              </div>
              <h2 className="text-2xl font-bold text-charcoal-900">Personalize your experience</h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Customize your week start day and wellness check-in prompts.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Week Start Day
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['monday', 'sunday'].map((day) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => setWeekStartDay(day)}
                      className={`py-2.5 px-4 rounded-xl border text-xs font-bold capitalize transition-all ${
                        weekStartDay === day
                          ? 'bg-sage-50 border-sage-500 text-sage-900'
                          : 'bg-white border-charcoal-200 text-charcoal-700 hover:bg-ivory-50'
                      }`}
                    >
                      Starts on {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-ivory-50 border border-charcoal-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-charcoal-900">Daily Wellness Check-in</div>
                  <div className="text-[11px] text-charcoal-500">
                    Gentle, 1-click energy and mood recording
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={wellnessEnabled}
                  onChange={(e) => setWellnessEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-sage-600 focus:ring-sage-500"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(4)}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(6)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Review & Launch
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Starting Workspace Ready */}
        {step === 6 && (
          <div className="space-y-6 text-center animate-fade-in py-2">
            <div className="w-14 h-14 rounded-3xl bg-sage-100 text-sage-700 flex items-center justify-center mx-auto mb-2 shadow-soft">
              <CheckCircle2 className="w-8 h-8 text-sage-600" />
            </div>

            <h2 className="text-2xl font-bold text-charcoal-900">Your workspace is ready!</h2>
            <p className="text-xs text-charcoal-600 max-w-sm mx-auto leading-relaxed">
              We've created a clean, welcoming dashboard for you. No overwhelming flood of tasks—just
              a calm space to show up every day.
            </p>

            <div className="p-4 rounded-2xl bg-sage-50/80 border border-sage-200 text-left text-xs text-sage-900 space-y-1.5 max-w-sm mx-auto">
              <div className="font-semibold text-sage-800">Your configuration:</div>
              <div>• Horizon: {horizon.replace('_', ' ')}</div>
              <div>• Focus duration: {focusDuration} minutes</div>
              <div>• Week start: {weekStartDay}</div>
              {dreamTitle && <div>• Initial dream: "{dreamTitle}"</div>}
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full text-base font-bold"
                onClick={handleFinishOnboarding}
                loading={loading}
              >
                Enter DreamIITi Workspace
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
