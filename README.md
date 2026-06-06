# A K Kataruka and Company Work Desk

Full-stack practice work desk for A K Kataruka and Company, Chartered Accountants. The app separates firm administrators from staff members and helps manage daily client assignments across audit, GST, income tax, TDS, company law, accounting review, and document follow-up workflows.

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

Start the complete app from the repository root:

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

For production, set `CORS_ORIGIN` to the deployed frontend URL, for example:

```text
CORS_ORIGIN=https://akkc-eight.vercel.app
```

Frontend variables are defined in `frontend/.env.example`:

```text
VITE_API_BASE_URL=http://localhost:5001/api
```

For production, set:

```text
VITE_API_BASE_URL=https://akkc.onrender.com/api
```

## Authentication

- Admins sign up and log in with email and password.
- Staff members do not sign up themselves.
- Admins create staff credentials with username and password.
- Staff members log in with username and password.
- JWT tokens include user id and role.

Seed credentials:

```text
Admin: admin@akkataruka.com / Admin@12345
Staff usernames: audit.associate, tax.associate, gst.associate
Staff password: Employee@12345
```

## Application Routes

### Frontend

```text
/                    Landing page
/admin/login         Admin login
/admin/signup        Admin signup
/admin/dashboard     Team AKKC dashboard
/admin/employees     Staff credential management
/admin/tasks         Client assignments
/employee/login      Staff login
/employee/dashboard  Team AKKC staff dashboard
/employee/tasks      Staff assigned work
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

## Deployment Notes

- Backend Render URL: `https://akkc.onrender.com`
- Frontend Vercel URL: `https://akkc-eight.vercel.app/`
- `frontend/vercel.json` rewrites all frontend routes to `index.html` so refreshing protected React routes does not return a Vercel 404.
- The backend `start` script runs `prisma migrate deploy` before starting Express so Render applies pending production migrations, including the staff `username` column.
- If the Vercel project root is the repository root, set the build output to `frontend/dist` or deploy with the frontend folder as the Vercel root directory.

## Test Coverage

Backend route tests cover:

- Authentication guards and validation
- Admin signup/login and `/api/auth/me`
- Staff username login
- Admin employee create/list/update/delete
- Admin assignment create/list/detail/update/delete
- Assignment filters by status, client, staff member, and date
- Admin stats updates
- Staff assigned-work visibility
- Staff done/not-done updates with required completion note/reason
- Role restrictions for admin-only and staff-only routes

Run tests:

```bash
npm test
```

## Security Notes

- Never hardcode database credentials.
- Use `DATABASE_URL` from `backend/.env`.
- Use a strong `JWT_SECRET` in local and production environments.
- Never commit `.env`, secrets, tokens, or database dumps.
- Staff members cannot sign up themselves; admins create staff credentials.
