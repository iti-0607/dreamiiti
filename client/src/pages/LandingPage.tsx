import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  Sparkles,
  Target,
  Sprout,
  CheckCircle2,
  Clock,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Calendar,
  Compass,
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does DreamIITi differ from traditional to-do lists or rigid project managers?',
      a: 'Most tools expect you to be a machine. DreamIITi is built around compassionate productivity. If life happens or you have a low-energy day, "Make Today Lighter" recalculates your priorities to a Minimum Viable Day without guilt or broken-streak penalties.',
    },
    {
      q: 'Do I need a paid AI account or API key to use the goal breakdown?',
      a: 'Not at all! DreamIITi includes a comprehensive, deterministic goal decomposition engine built right in. It suggests structured milestones, 5-minute doorway starting actions, and restorative buffers with zero external dependencies.',
    },
    {
      q: 'Is my personal reflection and journal data private?',
      a: 'Yes, completely private by design. Your journal entries and emotional check-ins are scoped strictly to your account and never used in public feeds, telemetry, or third-party training.',
    },
    {
      q: 'Can I export my data or delete my account anytime?',
      a: 'Absolutely. Under Settings, you can download a complete JSON export of all your dreams, goals, tasks, habits, and journals with one click, or permanently delete your account and records.',
    },
  ];

  return (
    <div className="min-h-screen bg-ivory-100/70 text-charcoal-900 selection:bg-sage-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-charcoal-200/60 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sage-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              D
            </div>
            <span className="font-extrabold text-xl tracking-tight text-charcoal-900">
              DreamIITi
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-charcoal-600">
            <a href="#features" className="hover:text-sage-700 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-sage-700 transition-colors">
              How it works
            </a>
            <a href="#philosophy" className="hover:text-sage-700 transition-colors">
              Our approach
            </a>
            <a href="#faq" className="hover:text-sage-700 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                Start Journey
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-100 text-sage-800 text-xs font-semibold mb-6 border border-sage-200">
            <Sparkles className="w-3.5 h-3.5 text-sage-600" />
            <span>Anti-Procrastination & Sustainable Growth</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-charcoal-900 tracking-tight leading-[1.12] mb-6">
            Your dreams deserve <br className="hidden sm:inline" />
            <span className="text-sage-700 font-serif italic">more than a someday.</span>
          </h1>

          <p className="text-lg sm:text-xl text-charcoal-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Turn what you dream about into small, achievable steps. Plan your days, cultivate habits,
            and make steady progress at your own pace without shame or overwhelm.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full text-base px-8 py-3.5">
                Start your journey for free
              </Button>
            </Link>
            <a href="#preview" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full text-base px-8 py-3.5">
                Explore how it works
              </Button>
            </a>
          </div>

          {/* Interactive Realistic Product Preview Card */}
          <div
            id="preview"
            className="rounded-3xl bg-white border border-charcoal-200/90 shadow-elevated p-6 sm:p-8 text-left transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sage-500 via-lavender-500 to-amber-500" />

            {/* Preview Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-charcoal-100 gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-sage-700 mb-1">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Good morning, Aarav</span>
                </div>
                <h2 className="text-xl font-bold text-charcoal-900">
                  "Start small. Show up. Become who you want to be."
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-50 text-amber-800 font-medium px-3 py-1 rounded-full border border-amber-200">
                  Energy: High ⚡
                </span>
                <span className="text-xs bg-sage-50 text-sage-800 font-medium px-3 py-1 rounded-full border border-sage-200">
                  Top 3 Priorities Active
                </span>
              </div>
            </div>

            {/* Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Priorities Column */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">
                    Today's Priority Focus
                  </span>
                  <span className="text-xs text-sage-700 font-medium">1 of 3 completed</span>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-sm font-semibold text-charcoal-900 line-through text-charcoal-400">
                        Review syllabus and core chapters
                      </div>
                      <div className="text-xs text-charcoal-500">Goal: Master CS Fundamentals • 40m</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                    Done
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-charcoal-200 bg-white shadow-soft flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md border-2 border-sage-600/40" />
                    <div>
                      <div className="text-sm font-semibold text-charcoal-900">
                        Implement calendar conflict warnings
                      </div>
                      <div className="text-xs text-charcoal-500">Goal: Build DreamIITi Platform • 60m</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-sage-700 bg-sage-50 px-2 py-0.5 rounded border border-sage-200">
                    Must-Do
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-charcoal-200 bg-white shadow-soft flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md border-2 border-amber-500/40" />
                    <div>
                      <div className="text-sm font-semibold text-charcoal-900">
                        Evening reflection in private journal
                      </div>
                      <div className="text-xs text-charcoal-500">Goal: Mindful Routine • 15m</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Should-Do
                  </span>
                </div>
              </div>

              {/* Habit Garden Preview Column */}
              <div className="p-4 rounded-2xl bg-ivory-50/80 border border-charcoal-200/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-700">
                      <Sprout className="w-4 h-4 text-emerald-600" />
                      <span>Habit Garden</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      12-Day Streak
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-charcoal-200/60 shadow-sm mb-3 text-center">
                    <div className="text-2xl mb-1">🌿</div>
                    <div className="text-xs font-bold text-charcoal-800">Flourishing Sprout</div>
                    <div className="text-[10px] text-charcoal-500 mt-0.5">
                      3 habits active • Rest days protected
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-charcoal-700">
                      <span>Morning Hydration</span>
                      <span className="text-emerald-600 font-bold">✓</span>
                    </div>
                    <div className="flex items-center justify-between text-charcoal-700">
                      <span>45m Focus Block</span>
                      <span className="text-charcoal-400">Scheduled 2pm</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-charcoal-200/50 flex items-center justify-between text-xs text-charcoal-500">
                  <span>Planned today: 2h 15m</span>
                  <span className="text-sage-700 font-medium">Sustainable pace</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem & The Solution */}
      <section id="how-it-works" className="py-20 bg-white border-y border-charcoal-200/70 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-charcoal-900 mb-4">
              Why traditional planning fails & how we fix it
            </h2>
            <p className="text-charcoal-600">
              The problem isn't a lack of ambition. It's overwhelming goals, unrealistic calendars,
              and the crushing guilt of missed days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* The Old Way */}
            <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-200/70">
              <div className="text-rose-700 font-bold text-sm mb-3">The Familiar Trap</div>
              <ul className="space-y-3 text-sm text-charcoal-700">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Huge, vague resolutions like "Learn Coding" or "Get Fit" that overwhelm.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Rigid hour-by-hour timetables that break down the moment life happens.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Shame-based streak apps that reset your progress after one busy weekend.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Giving up completely because restarting feels like admitting failure.</span>
                </li>
              </ul>
            </div>

            {/* The DreamIITi Way */}
            <div className="p-6 rounded-2xl bg-sage-50/50 border border-sage-200">
              <div className="text-sage-700 font-bold text-sm mb-3">The DreamIITi Cycle</div>
              <ul className="space-y-3 text-sm text-charcoal-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dream → Milestone → 5-Min Action:</strong> Big dreams decompose into doorway steps.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>"Make Today Lighter":</strong> Automatic triage to a Minimum Viable Day when low on energy.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Compassionate Streaks:</strong> Rest days and custom schedules never destroy your momentum.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Guilt-Free Restart:</strong> Welcome back without judgment anytime you take a break.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-charcoal-900 mb-3">
              Designed for daily joy and genuine progress
            </h2>
            <p className="text-charcoal-600">
              Every tool in DreamIITi is built to reduce friction, eliminate procrastination, and help
              you show up consistently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-charcoal-200 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-charcoal-900 mb-2">Goal Decomposition Engine</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Connect long-term dreams to monthly milestones, weekly objectives, and 5-minute doorway
                actions. Automatic capacity checks ensure schedules stay realistic.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-charcoal-200 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Sprout className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-charcoal-900 mb-2">Habit Garden & Rest Days</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Watch your habits grow visually through botanical stages. Built-in compassionate logic
                honors chosen weekdays and planned rest without breaking streaks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-charcoal-200 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-charcoal-900 mb-2">Calendar Conflict Guard</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Day, Week, Month, and Agenda views with overlap detection that warns you before you
                overbook yourself, plus 1-click rescheduling for unfinished work.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-charcoal-200 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-lavender-100 text-lavender-700 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-charcoal-900 mb-2">Distraction-Free Focus</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                15, 25, 45, and 60-minute focus modes with integrated break prompts. Elapsed time is
                reconciled on the backend, surviving browser refreshes without losing data.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-charcoal-200 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-charcoal-900 mb-2">Private Wellness & Journal</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Quick, skippable energy and mood check-ins paired with reflective journaling. Strictly
                private, encrypted by session, and never used for advertising.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-charcoal-200 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-charcoal-900 mb-2">Weekly Guided Reviews</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Celebrate wins, examine friction points, and carry forward active goals cleanly into
                next week. Real progress analytics that answer practical questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-20 bg-ivory-200/50 border-t border-charcoal-200/60 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs font-bold text-sage-800 uppercase tracking-widest mb-3">
            Our Core Principles
          </div>
          <h2 className="text-3xl font-bold text-charcoal-900 mb-8">
            Progress over perfection. Encouragement over guilt.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl bg-white border border-charcoal-200">
              <div className="text-sm font-bold text-sage-800 mb-1">Consistency &gt; Intensity</div>
              <p className="text-xs text-charcoal-600">
                15 focused minutes every day builds far more momentum than sporadic 10-hour sprints.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-charcoal-200">
              <div className="text-sm font-bold text-sage-800 mb-1">Adaptability &gt; Rigidity</div>
              <p className="text-xs text-charcoal-600">
                When plans encounter real life, gently adapt the timetable instead of abandoning it.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-charcoal-200">
              <div className="text-sm font-bold text-sage-800 mb-1">Privacy by Design</div>
              <p className="text-xs text-charcoal-600">
                Your private thoughts, ambitions, and reflections belong to you alone. Full export anytime.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-charcoal-200">
              <div className="text-sm font-bold text-sage-800 mb-1">No Toxic Scores</div>
              <p className="text-xs text-charcoal-600">
                We never assign a single reductive "productivity score" to measure your human worth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-charcoal-900 mb-2">Frequently Asked Questions</h2>
          <p className="text-sm text-charcoal-600">Clear answers on how DreamIITi respects your time and privacy.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-charcoal-200 bg-white overflow-hidden transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between font-semibold text-sm text-charcoal-900 hover:text-sage-800"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-charcoal-400 transition-transform ${
                    activeFaq === idx ? 'rotate-180 text-sage-600' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-sm text-charcoal-600 leading-relaxed border-t border-charcoal-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-sage-700 text-white text-center px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Begin your journey with clarity and calm.
          </h2>
          <p className="text-sage-100 text-base mb-8">
            Start small today. Take 5 minutes to plant your first dream.
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-sage-800 hover:bg-ivory-100 text-base px-8 py-3.5 font-bold"
            >
              Get started — it's free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-charcoal-200 px-6 py-8 text-xs text-charcoal-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sage-600 text-white font-bold flex items-center justify-center text-xs">
              D
            </div>
            <span className="font-bold text-charcoal-800">DreamIITi</span>
            <span>— Your dreams deserve a plan.</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Privacy by design</span>
            <span>Zero shame-based productivity</span>
            <span>Built with care</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
