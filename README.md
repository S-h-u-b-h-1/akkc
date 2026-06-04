# Employee Daily Task Management System

Production-grade full-stack foundation for an Employee Daily Task Management System.

## Project Structure

```text
akkc/
├── backend/
├── frontend/
├── README.md
└── .gitignore
```

## Backend

Tech stack: Node.js, Express, Prisma, PostgreSQL, JWT, bcrypt.

### Setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `backend/.env` with your local values. Do not commit `.env`.

### Useful Commands

```bash
npm run dev
npm run lint
npm test
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

The backend runs on `http://localhost:5001` by default.

### Authentication Routes

```text
POST /api/admin/signup
POST /api/admin/login
POST /api/employee/login
GET  /api/auth/me
```

### Seed Data

After running migrations against your PostgreSQL database, seed sample data:

```bash
cd backend
npm run prisma:seed
```

The seed creates one admin, three employees, sample tasks, and task updates. Sample passwords are printed by the seed command for local development only.

## Frontend

Tech stack: React, Vite, React Router.

### Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Update `frontend/.env` if the backend API URL changes.

### Useful Commands

```bash
npm run dev
npm run build
npm run lint
```

The frontend runs on `http://localhost:5173` by default.

## Environment Variables

Backend variables are defined in `backend/.env.example`.
Frontend variables are defined in `frontend/.env.example`.

Database credentials must always be supplied through `DATABASE_URL`; they should never be hardcoded in application code.
