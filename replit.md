# Imihigo Learn

AI-powered skill verification and job matching platform for Rwanda.

## Stack

- **Frontend:** React 18 + TypeScript + Vite (port 5000)
- **Backend:** Node.js + Express + TypeScript (port 3001, via tsx, binds 0.0.0.0)
- **Real-time:** Socket.io
- **Auth:** JWT + bcryptjs

## Key Files

- `src/` — React TypeScript frontend
  - `pages/` — Landing, Auth, Dashboard, Skills, Assessment, Jobs, Profile, Community, Leaderboard, Employer
  - `context/AuthContext.tsx` — JWT auth context
  - `context/LangContext.tsx` — EN/Kinyarwanda language toggle
  - `components/Navbar.tsx` — navigation with lang toggle
  - `types/index.ts` — shared types
- `server/` — Express TypeScript backend
  - `routes/` — auth, skills, jobs, users, assessments, community, leaderboard
  - `middleware/auth.ts` — JWT middleware
  - `data/store.ts` — in-memory data store (users, skills, jobs, assessments, credentials)
  - `data/community-store.ts` — tutorials, leaderboard data
- `vite.config.ts` — proxy `/api` → `localhost:3001`, host `0.0.0.0`, port `5000`

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth` | Login / Register |
| `/dashboard` | User dashboard (requires auth) |
| `/skills` | Browse skill assessments |
| `/assessment/:id` | Take timed assessment (requires auth) |
| `/jobs` | Job listings with skill matching |
| `/community` | Peer learning hub, Kinyarwanda tutorials |
| `/leaderboard` | Token leaderboard (Ibarura) |
| `/profile` | User credentials & history (requires auth) |
| `/employer` | Employer dashboard: post jobs, verify credentials |
| `/admin` | Admin portal: users, courses, tutorials, jobs, verifications, settings |

## Running

`npm run dev` — uses concurrently to run frontend + backend

## Demo Credentials

- Job Seeker: alice@example.com / password123
- Employer: bob@employer.com / password123
- Admin: bob@employer.com / password123 (role=admin in seed data)

## Colors

- Primary: #6366f1 (indigo)
- Rwanda Blue: #00A1DE
- Rwanda Yellow: #FAD201 (used for lang toggle, tokens)
- Rwanda Green: #20603D (used for brand accent)
