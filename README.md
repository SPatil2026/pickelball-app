# 🏓 PicklePark — Frontend

Pickleball court booking platform built with **Vite + React + TypeScript + Tailwind CSS**.

## Stack

| Layer        | Choice                           |
|--------------|----------------------------------|
| Bundler      | Vite 5                           |
| UI           | React 18 + TypeScript            |
| Styling      | Tailwind CSS 3                   |
| Routing      | React Router v6                  |
| HTTP client  | Axios (proxy → `localhost:8000`) |
| Icons        | Lucide React                     |

## Project Structure

```
src/
├── contexts/
│   └── AuthContext.tsx      # Auth state, login/register/logout
├── lib/
│   └── api.ts               # Axios instance + authApi calls
├── types/
│   └── index.ts             # Shared TypeScript types
├── components/
│   ├── ProtectedRoute.tsx   # Guards for authenticated routes
│   └── layout/
│       ├── AppLayout.tsx    # Shell with sidebar
│       └── Sidebar.tsx      # Nav sidebar
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   └── PlaceholderPages.tsx # Courts / History / Marketplace / Settings
├── App.tsx                  # Route definitions
├── main.tsx
└── index.css                # Tailwind + custom design tokens
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (proxies /api → http://localhost:8000)
npm run dev
```

App runs at **http://localhost:5173**

## API Proxy

`vite.config.ts` proxies all `/api/*` requests to your backend:

```
/api/auth/register  → POST http://localhost:8000/api/auth/register
/api/auth/login     → POST http://localhost:8000/api/auth/login
/api/auth/logout    → POST http://localhost:8000/api/auth/logout
```

The Axios instance in `src/lib/api.ts`:
- Attaches `Authorization: Bearer <token>` from `localStorage` automatically
- Redirects to `/login` on any `401` response

## Auth Flow

1. **Register** — `POST /api/auth/register` → stores `{ user, token }` in `localStorage`
2. **Login** — `POST /api/auth/login` → same
3. **Logout** — `POST /api/auth/logout` (protected) → clears storage, redirects to `/login`

## Routes

| Path           | Access    | Page               |
|----------------|-----------|--------------------|
| `/login`       | Public    | Login              |
| `/register`    | Public    | Register           |
| `/dashboard`   | Protected | Dashboard          |
| `/courts`      | Protected | Book Courts (stub) |
| `/history`     | Protected | Bookings (stub)    |
| `/marketplace` | Protected | Marketplace (stub) |
| `/settings`    | Protected | Settings (stub)    |

## Next Steps

- [ ] Court grid page with 3-court colour-coded slots
- [ ] Multi-slot cart & checkout flow
- [ ] Booking history with rescheduling
- [ ] Marketplace with venue cards & availability filters
- [ ] Owner dashboard for venue creation & management
- [ ] Photo upload integration
