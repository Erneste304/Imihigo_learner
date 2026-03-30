# 🎓 Imihigo Learn

**AI-Powered Skill Verification & Job Matching Platform for Rwanda**

> Solving Rwanda's skills mismatch problem: 50,000+ graduates yearly but employers can't trust certificates. Imihigo Learn uses AI assessment and blockchain verification to bridge the gap.

---

## 🚀 What It Does

| Feature | Description |
|--------|-------------|
| 🧠 Adaptive Skill Testing | AI-generated personalized challenges, anti-cheat proctoring |
| 🔗 Blockchain Credentials | Tamper-proof certificates on Polygon, QR-code verifiable |
| 🎯 Smart Job Matching | ML model matches verified skills to job requirements |
| 🏫 Community Learning Hubs | Peer-to-peer marketplace, Kinyarwanda tutorials, token rewards |
| 📱 Gig SMS Alerts | Real-time job alerts for delivery, data entry, tutoring |

---

## 🛠 Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite (dev server)
- React Router DOM
- CSS Modules

**Backend**
- Node.js + Express + TypeScript
- tsx (TypeScript execution)
- JWT Authentication
- Socket.io (real-time)
- bcryptjs, uuid, zod

---

## 📁 Project Structure

```
├── src/                    # React TypeScript frontend
│   ├── context/            # Auth context
│   ├── pages/              # Landing, Auth, Dashboard, Skills, Assessment, Jobs, Profile
│   ├── components/         # Navbar
│   └── types/              # Shared TypeScript types
├── server/                 # Express TypeScript backend
│   ├── routes/             # auth, skills, jobs, users, assessments
│   ├── middleware/         # JWT auth middleware
│   └── data/               # In-memory data store (replace with PostgreSQL)
├── vite.config.ts          # Vite config (port 5000, proxies /api → :3001)
└── tsconfig.json           # TypeScript config
```

---

## 🏃 Running Locally

```bash
npm run dev          # Runs frontend (:5000) + backend (:3001) concurrently
```

**Demo Account:** `alice@example.com` / `password123`

---

## 🎯 Impact Goals

- **10,000** verified profiles in Year 1
- **40%** reduction in hiring time for SMEs
- **5,000** informal workers certified
- **Zero** paper certificates → eco-friendly

---

## 🗺 Roadmap

- **Phase 1 (Now):** Skill assessment engine + blockchain credentials
- **Phase 2:** Smart job matching + employer portal
- **Phase 3:** Kinyarwanda voice tutor + offline mode
- **Phase 4:** Blockchain micro-credential marketplace
- **Phase 5:** Regional expansion across East Africa

---

*Built with ❤️ for Rwanda's future workforce*
