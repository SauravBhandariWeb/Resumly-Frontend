# Resumly — AI Resume Builder (MERN)

A production-ready AI resume builder SaaS.

## Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router, Framer Motion, React Hook Form, Zod, Axios, html2canvas + jsPDF
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT (HttpOnly cookies), bcryptjs, Helmet, rate limiting, mongo-sanitization
- **AI:** Google Gemini API (server-side only — the key never reaches the browser)
- **Image uploads:** ImageKit

## Folder structure

```
.
├── src/                      # React frontend (client)
│   ├── api/                  # API layer (local + remote adapters)
│   ├── components/           # Reusable components, UI primitives, templates
│   ├── context/              # Auth, Theme, Toast contexts
│   ├── lib/                  # utils, AI fallback, PDF export, resume defaults
│   ├── pages/                # auth + app pages
│   └── types/                # shared domain types
└── server/                   # Express backend
    └── src/
        ├── controllers/      # route handlers
        ├── middleware/       # auth, error handling
        ├── models/           # Mongoose models (User, Resume, Profile, Template)
        ├── routes/           # express routers
        ├── services/         # Gemini, ImageKit
        └── utils/            # tokens, email
```

## Getting started

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
cp .env.example .env   # fill in your values
npm run seed           # create an admin user (admin@resumly.app / admin123)
npm run dev
```

### Connect the frontend to the backend
Set `VITE_API_URL` in the frontend `.env`:
```
VITE_API_URL=http://localhost:5001
```
When unset, the frontend runs in standalone demo mode (browser storage) so every feature works without a backend.

## Environment variables

See `server/.env.example`. Required: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `IMAGEKIT_*`, `PORT`.

The Gemini API key is read from `process.env.GEMINI_API_KEY` on the server and is **never** exposed to the UI.

## Features

- Auth: register, login, logout, forgot/reset password, protected routes, JWT in HttpOnly cookies, bcrypt hashing, session persistence across refresh.
- ImageKit uploads: profile photo + resume profile image, reusable upload utility, URLs stored in MongoDB.
- Dashboard: create / list / duplicate / delete / edit / preview / download resumes, search, pagination, analytics.
- Resume builder: ATS-friendly editor with Personal Info, Summary, Education, Experience, Projects, Skills, Languages, Certifications, Achievements, Interests, Custom Sections; drag-and-drop section ordering; live preview; auto-save; responsive.
- AI (Gemini): summary, bullet points, skills, project description, cover letter, improve grammar, rewrite, shorten, expand, ATS score, keyword suggestions, job-description matching — all via backend routes.
- 10 ATS templates: Modern, Classic, Minimal, Executive, Google Style, Harvard, Stanford, Professional, Creative, Corporate — instant switching, responsive, export-safe.
- PDF export: A4, multi-page, hex/RGB colors only, matches the preview exactly.
- Analytics: resume count, downloads, profile completion, recent resumes, storage used, average ATS score.
- Admin panel: total users, total resumes, delete user/resume, 7-day growth chart, recent activity.
- Premium UI: Canva/Linear/Notion-inspired, glassmorphism, soft shadows, dark/light mode, Framer Motion transitions, skeletons.
- Security: Helmet, CORS, rate limiting, mongo-sanitization, JWT middleware, input validation (express-validator + Zod), toasts.

## API endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
PATCH  /api/users/me

GET    /api/resumes?page=&limit=&q=
POST   /api/resumes
GET    /api/resumes/:id
PATCH  /api/resumes/:id
DELETE /api/resumes/:id
POST   /api/resumes/:id/duplicate
POST   /api/resumes/:id/download

POST   /api/ai/run
POST   /api/upload/image
GET    /api/upload/imagekit-auth

GET    /api/analytics/me
GET    /api/analytics/admin

GET    /api/admin/users
DELETE /api/admin/users/:id
DELETE /api/admin/resumes/:id
```
