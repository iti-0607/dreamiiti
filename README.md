# DreamIITi 🌿

> **"Your dreams deserve a plan. Start small. Show up. Become who you want to be."**

DreamIITi is a personal growth, life-planning, and anti-procrastination full-stack platform designed to help people convert their ambitions into concrete, manageable actions without shame or overwhelm.

---

## 🌟 The Core Philosophy

```
DREAM → DEFINE → BREAK DOWN → PLAN → ACT → REFLECT → ADAPT → GROW
```

1. **Progress over perfection**
2. **Clarity over complexity**
3. **Consistency over intensity**
4. **Adaptability over rigid schedules**
5. **Encouragement over guilt**
6. **User control over automation**
7. **Privacy by design**

---

## 🚀 Quick Start (Running Locally in 2 Steps)

The backend and frontend are already built, seeded with realistic demo data, and runnable immediately!

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v22.16.0)
- **npm**: v9+

### 2. How to Start the App

You can run both the frontend and backend dev servers with simple commands:

#### Terminal 1 — Start the Backend Server:
```bash
cd server
npm run dev
```
> The backend will start on **http://localhost:5000**.
> OpenAPI documentation is available at **http://localhost:5000/api/v1/openapi.json**.

#### Terminal 2 — Start the Frontend Client:
```bash
cd client
npm run dev
```
> The Vite client will start on **http://localhost:5173**.
> Open **http://localhost:5173** in your browser.

---

## 🔑 Demo Account Credentials

A pre-populated demo account is seeded into the database with active dreams, goals, milestones, timetable blocks, habit garden progress, focus sessions, and journal reflections:

- **Email**: `demo@dreamiiti.app`
- **Password**: `dream123`

*(On the login screen, you can also simply click the **"Try Demo Workspace (1-Click Login)"** button to enter immediately!)*

---

## 🛠️ Complete Command Reference

### Database & Seeding
```bash
# In the server directory:
cd server

# Generate Prisma Client:
npm run prisma:generate

# Sync schema to SQLite database (dev.db):
npm run prisma:migrate

# Seed / re-seed demo data:
npm run prisma:seed
```

### Running Automated Tests
```bash
# In the server directory:
cd server
npm run test
```
*Executes all Vitest integration suites: Authentication, Tenant Isolation, Goal Decomposition, Anti-Procrastination workflows, Calendar Overlap detection, and Habit streaks.*

### Building for Production
```bash
# Build frontend bundle:
cd client
npm run build

# Build backend server:
cd server
npm run build
```

---

## 🏗️ Architecture & Tech Stack

### Frontend (`client/`)
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with curated warm ivory, sage green, calming lavender, and soft amber design tokens
- **Routing**: React Router DOM v7
- **Server State**: TanStack React Query v5
- **Icons**: Lucide React
- **Visuals & Charts**: Recharts & Canvas Confetti

### Backend (`server/`)
- **Runtime**: Node.js + Express + TypeScript
- **ORM**: Prisma ORM (v6)
- **Database**:
  - **Development**: Zero-dependency SQLite (`dev.db`) for instant local startup without requiring an external database daemon.
  - **Production / Managed Cloud**: PostgreSQL via `prisma/schema.postgresql.prisma` and `docker-compose.yml`.
- **Security & Auth**:
  - Password hashing with bcrypt (12 salt rounds)
  - Secure HTTP-only cookies and Bearer token support
  - Tenant isolation on every endpoint (User A cannot read or modify User B's records)
  - Helmet security headers and rate limiting

---

## 🎯 Key Product Features

### 1. Today Action Center (`/app/today`)
- Time-appropriate greeting, supportive daily quote, and skippable mood/energy check-in.
- **Top 3 Priorities Card**: Clear visual focus on today's highest-leverage tasks.
- **"Make Today Lighter"**: Anti-procrastination action that reschedules should-dos to tomorrow and preserves only your Minimum Viable Day.
- **"Help Me Start"**: Overcomes procrastination by breaking any overwhelming task into a 5-minute doorway action.

### 2. Dream Vault (`/app/dreams`)
- Life area categorization (Career, Health, Financial Freedom, Creativity, Personal Growth).
- Live progress calculations based on milestones and linked tasks.
- Grid & list view with status filtering (Active, Paused, Completed, Archived).

### 3. User-Owned Goals & Milestones (`/app/goals`)
- Hierarchy: **Dream → Goal → Milestone → Task → Subtask**.
- **User-Owned Planning Principle**: All goals, milestones, tasks, and calendar schedules are created and controlled by the user. AI never invents, populates, or mutates planning records.
- Support for yearly, 6-month, monthly, and weekly planning horizons.
- Manual milestone addition, task creation, subtask tracking, and direct-to-calendar scheduling.

### 4. Flexible Calendar & Timetable (`/app/calendar`)
- Day, Week, Month, and Agenda views.
- **Conflict Guard**: Detects overlapping time slots and issues a warning with details of the conflicting block before saving, with a deliberate user override option.
- **Unfinished Work Resolution**: One-click option to move overdue scheduled work to tomorrow or the backlog.

### 5. Habit Garden (`/app/habits`)
- Botanical garden canvas with plant growth stages:
  - `SEED` (0–2 days)
  - `SPROUT` (3–6 days)
  - `BUD` (7–13 days)
  - `BLOOM` (14–29 days)
  - `FOREST` (30+ days)
- **Compassionate Streaks**: Weekday and weekly habits never lose their streak on planned rest days.

### 6. Distraction-Free Focus Mode (`/app/focus`)
- Circular focus dial with presets (15m, 25m Pomodoro, 45m Deep Work, 60m).
- Restorative break options (5m, 10m).
- Server-reconciled timestamps: session duration survives page refreshes and saves actual minutes to the database.

### 7. Private Wellness & Journaling (`/app/wellness`)
- Daily energy, mood, and stress check-ins.
- Private reflective journaling with prompt suggestions.
- Strict privacy: never shared with third parties or public feeds.

### 8. Weekly & Monthly Reviews (`/app/reviews`)
- Guided 4-question reflection: What went well? What felt overwhelming? What should continue? What matters most next week?
- Real statistics: planned vs. completed tasks, habit consistency rate, focus time.

### 9. Progress Insights (`/app/insights`)
- Recharts visualizations: 14-day task completion trends, focus hours distribution, workload by life area, and estimation accuracy ratios.

### 10. Data Portability & Settings (`/app/settings`)
- 1-click **JSON Personal Data Export** (downloads all user dreams, goals, tasks, habits, and journals).
- Account deletion with full database cleanup.

---

## 🐳 Running with PostgreSQL & Docker (Optional)

If you wish to run with managed PostgreSQL:
```bash
# Start PostgreSQL container:
docker-compose up -d

# Set DATABASE_URL in server/.env:
DATABASE_URL="postgresql://dreamuser:dreampassword@localhost:5432/dreamiiti?schema=public"

# Push schema:
cd server
npx prisma db push --schema=prisma/schema.postgresql.prisma
```

---

## 🔒 Security Best Practices
- Passwords hashed with bcrypt (salt rounds = 12).
- Tenant data scoping: every database query filters strictly by `req.user.id`.
- Rate limiting on authentication routes (100 requests per 15-minute window).
- Strict input validation using Zod.
- No sensitive secrets or passwords logged.
