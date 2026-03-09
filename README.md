# Urban Stay — Real Estate Platform

A full-stack real estate platform built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend). It supports property listings, search & filters, inquiries, reviews, saved alerts, and multi-role dashboards for users, sellers, and admins.

---

## Tech Stack

| Layer    | Technology                                                               |
| -------- | ------------------------------------------------------------------------ |
| Frontend | React 18, Vite, React Router v7, Tailwind CSS, Framer Motion, Axios, Zod |
| Backend  | Node.js, Express 5, Mongoose, MongoDB Atlas                              |
| Auth     | JWT (7-day expiry), bcryptjs                                             |
| Email    | Nodemailer (SMTP)                                                        |
| Payments | Razorpay                                                                 |
| Maps     | Leaflet + React Leaflet                                                  |
| Uploads  | Multer (local storage)                                                   |

---

## Features

- **Authentication** — Register, Login, OTP-based Forgot/Reset Password
- **Properties** — Post, search, filter, paginate, view details with image gallery & map
- **Roles** — `user`, `seller`, `admin` with role-based access control
- **Inquiries** — Send, respond, schedule visits, track status
- **Reviews** — Star ratings + comments per property
- **Saved Alerts** — Save search criteria and manage from dashboard
- **Featured Listings** — Admin can feature properties for 30 days
- **Property Verification** — Admin approval workflow
- **Dashboards** — Separate dashboards per role
- **EMI Calculator** — Built-in tool
- **GDPR Cookie Banner** — Cookie consent notice

---

## Project Structure

```
Logic-Wave-Project/
├── api/          ← Frontend (React + Vite)  — runs on port 5173
└── server/       ← Backend (Express + MongoDB) — runs on port 5000
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Gmail account with App Password (for email)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/logic-wave.git
cd logic-wave
```

### 2. Configure environment variables

**Backend** — create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/logicwave
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Frontend** — create `api/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install dependencies & run

```bash
# Terminal 1 — Backend
cd server
npm install
npm run dev       # nodemon → http://localhost:5000

# Terminal 2 — Frontend
cd api
npm install
npm run dev       # Vite → http://localhost:5173
```

### 4. (Optional) Seed sample data

```bash
cd server
node seeder.js
```

---

## API Overview

| Route prefix               | Description                                         |
| -------------------------- | --------------------------------------------------- |
| `POST /api/auth`           | Register, Login, Forgot/Reset password, Get profile |
| `GET/POST /api/properties` | Property CRUD, search, filter, featured             |
| `GET/POST /api/inquiries`  | Send & manage inquiries                             |
| `GET/POST /api/reviews`    | Property reviews & ratings                          |
| `GET/POST /api/alerts`     | Saved search alerts                                 |
| `GET/POST /api/projects`   | Builder projects                                    |
| `GET /api/health`          | Server health check                                 |

Full Postman collection is available in [`server/postman/`](server/postman/).

---

## Roles & Permissions

| Action                  | User | Seller | Admin |
| ----------------------- | :--: | :----: | :---: |
| Browse / Search         |  ✅  |   ✅   |  ✅   |
| Send Inquiry            |  ✅  |   ✅   |  ✅   |
| Post Property           |  ❌  |   ✅   |  ✅   |
| Respond to Inquiry      |  ❌  |   ✅   |  ✅   |
| Verify Property         |  ❌  |   ❌   |  ✅   |
| Feature Property        |  ❌  |   ❌   |  ✅   |
| Admin Dashboard & Stats |  ❌  |   ❌   |  ✅   |

---

## Scripts

| Location  | Command         | Description                |
| --------- | --------------- | -------------------------- |
| `api/`    | `npm run dev`   | Start Vite dev server      |
| `api/`    | `npm run build` | Production build           |
| `server/` | `npm run dev`   | Start backend with nodemon |
| `server/` | `npm start`     | Start backend (production) |

---

## License

MIT
