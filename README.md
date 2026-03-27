# 🏓 PicklePark

A premium Pickleball court booking platform built for real-time play. **PicklePark** provides a seamless mobile-first experience for both players (Bookers) looking for a game and facility managers (Owners) managing their venues.

---

## ✨ Key Features

### 👤 For Bookers (Players)
- **Marketplace Discovery**: Browse and search pickleball venues by name or location with real-time status.
- **Visual Court Grid**: 10-slot color-coded grid for instant slot selection across multiple courts.
- **Smart Cart & Validation**: Atomic 10-second polling to ensure slot availability before checkout.
- **Booking Management**: 
    - Full history view with active vs. completed filters.
    - **Reschedule Flow**: 12-hour policy-aware rescheduling to new available slots.
    - **Cancellation**: One-tap cancellation with policy warnings and confirmation.
- **Mobile Responsive**: Sidebar transforms into a bottom navigation bar for a native-app feel on small screens.

### 💼 For Owners (Managers)
- **Revenue Dashboard**: Real-time stats on total venues, active courts, booking volume, and MTD revenue.
- **Venue Management**: Add, edit, and manage venues with image galleries and operating hours.
- **Court Control**: Dynamically add or remove courts from any venue.
- **Pricing Engine**: Configure separate weekday and weekend pricing per hour.
- **Booking Tracker**: Global view of all reservations across all managed locations.

---

## 🛠️ Tech Stack

| Layer | Choice |
| :--- | :--- |
| **Frontend** | React 18 + TypeScript + Vite |
| **Backend** | Node.js + Express + Prisma ORM |
| **Styling** | Tailwind CSS 3 (Custom Warm Light Theme) |
| **Navigation** | React Router v6 |
| **State/Data** | Context API + Axios (with auto-auth interceptors) |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Run Development Server
The frontend is configured to proxy `/api/*` requests to `localhost:8000`.
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Environment Setup
Create a `.env` in the backend root with:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `JWT_SECRET`: A secure string for token signing.

---

## 🎨 Design System

PicklePark uses a custom-tailored **Warm Light Theme** defined in `tailwind.config.js` and `index.css`:

- **Page BG**: `#FAF6F1` (Cream)
- **Cards**: `#FFFFFF` (Pure White)
- **Primary**: `#2D1F14` (Deep Umber)
- **Accent**: `#C85A38` (Burnt Sienna)
- **Support**: `#4A7C6F` (Forest Green)

---

## 📂 Project Structure

- `src/components/`: Reusable UI elements (Cards, Sidebar, Layout).
- `src/pages/booker/`: Player-facing pages (Marketplace, Booking Grid, History, Reschedule).
- `src/pages/owner/`: Management pages (Dashboard, Venue Editor, Court Manager).
- `src/contexts/`: Shared global state (Auth).
- `src/lib/`: API configuration and specialized logic.
- `src/types/`: Centralized TypeScript interfaces.
