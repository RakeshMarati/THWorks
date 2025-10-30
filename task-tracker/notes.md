SQLite was selected for its speed and portability. The tasks schema is normalized for minimal redundancy and query speed, with proper enums and date fields for filtering. The insight service uses aggregation and simple rules to create readable workload analysis for the user, matching assignment requirements.

Backend design
- Data store: SQLite via better-sqlite3 (embedded, fast, zero-ops). Users: id, name, mobile, email, password_hash. Tasks: id, user_id, title, description, status (Open/In Progress/Done), priority (Low/Medium/High), due_date, created_at.
- Auth: bcryptjs for hashing, JWT for stateless sessions. Token payload includes uid. A fallback secret allows validating older tokens during rotation.
- Multi-tenancy: all task queries are scoped by userId; routes are behind an auth guard that extracts uid from Authorization.
- Pagination/filtering/sorting: GET /tasks supports page, limit, status, priority, sort_by, order. Queries use indexed columns for performance.
- Migrations: light runtime checks add missing columns (e.g., user_id on tasks) to avoid manual migration steps.
- Insights: aggregate counts by status/priority and time windows to produce a concise summary string.

Frontend design
- React + Vite. API base from VITE_API_BASE; all requests include Authorization: Bearer <token>.
- Auth flow: register collects name/mobile/email/password, then redirects to login. Login stores token in localStorage; Logout clears it.
- Task CRUD: list with filters, sort, pagination, inline edit/save/cancel, delete.
- Timeline: Chart.js stacked bar chart by due_date, segmented by priority (Low=green, Medium=amber, High=red).
- Resilience: Components treat 401s as empty data to avoid crashes.

Defaults for new users
- On register, seed 3 tasks (High/Medium/Low). On first login (if user has 0 tasks), seed again to ensure visibility.

Deployment
- Backend on Render (JWT_SECRET, optional JWT_SECRET_FALLBACK). SQLite file persisted via Render disk. CORS enabled.
- Frontend on Vercel (VITE_API_BASE set to backend URL). Rebuild required after env changes.

Potential improvements
- Add refresh tokens and server-side token revocation list.
- Replace ad-hoc migrations with versioned migrations (e.g., knex or umzug).
- Add input validation (zod/yup) and better error responses.
- Add optimistic UI updates and skeleton loading.
- Introduce role-based access if admin features are needed.
- Add tests (unit for services, integration for routes).
