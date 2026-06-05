# Employee Daily Task Management System

Production-grade full-stack Employee Daily Task Management System with separate React/Vite frontend and Node.js/Express/Prisma backend.

## Project Structure

```text
akkc/
├── backend/
├── frontend/
├── README.md
├── package.json
└── .gitignore
```

## Tech Stack

- Frontend: React, Vite, React Router
- Backend: Node.js, Express, Prisma
- Database: PostgreSQL
- Auth: JWT, bcrypt

## Local Setup

Install all workspace dependencies from the repository root:

```bash
npm install
```

Create local environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update `backend/.env` with your local PostgreSQL `DATABASE_URL` and a strong `JWT_SECRET`.
Do not commit `.env` files or real credentials.

Run Prisma setup after PostgreSQL is available:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Start the complete app from the repository root after environment variables are configured:

```bash
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001/api`

## Root Commands

```bash
npm run dev
npm run lint
npm test
npm run build
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Environment Variables

Backend variables are defined in `backend/.env.example`:

```text
NODE_ENV=development
PORT=5001
CORS_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN=1d
```

Frontend variables are defined in `frontend/.env.example`:

```text
VITE_API_BASE_URL=http://localhost:5001/api
```

## Application Routes

### Frontend

```text
/                    Landing page
/admin/login         Admin login
/admin/signup        Admin signup
/admin/dashboard     Admin dashboard
/admin/employees     Admin dashboard employee section
/admin/tasks         Admin dashboard task section
/employee/login      Employee login
/employee/dashboard  Employee assigned tasks
/employee/tasks      Employee assigned tasks
```

### Backend API

```text
GET  /api/health

POST /api/admin/signup
POST /api/admin/login
POST /api/employee/login
GET  /api/auth/me

POST   /api/admin/employees
GET    /api/admin/employees
PUT    /api/admin/employees/:id
DELETE /api/admin/employees/:id

POST   /api/admin/tasks
GET    /api/admin/tasks
GET    /api/admin/tasks/:id
PUT    /api/admin/tasks/:id
DELETE /api/admin/tasks/:id
GET    /api/admin/stats

GET /api/employee/tasks
PUT /api/employee/tasks/:id/done
PUT /api/employee/tasks/:id/not-done
```

## Test Coverage

Backend route tests cover:

- Authentication guards and validation
- Admin signup/login and `/api/auth/me`
- Employee login
- Admin employee create/list/update/delete
- Admin task create/list/detail/update/delete
- Task filters by status, client, employee, and date
- Admin stats updates
- Employee assigned-task visibility
- Employee done/not-done updates with required remark/reason
- Role restrictions for admin-only and employee-only routes

Run tests:

```bash
npm test
```

## Security Notes

- Never hardcode database credentials.
- Use `DATABASE_URL` from `backend/.env`.
- Use a strong `JWT_SECRET` in local and production environments.
- Never commit `.env`, secrets, tokens, or database dumps.
- Employees cannot sign up themselves; admins create employee credentials.
