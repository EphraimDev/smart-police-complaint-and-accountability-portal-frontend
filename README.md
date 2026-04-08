# Smart Police Complaint & Accountability Portal (SPCAP) — Frontend

A React + TypeScript single-page application for filing, tracking, and managing police complaints against the Nigeria Police Force. Built with a Nigeria Police Force-inspired dark-green and gold institutional design system.

## Tech Stack

| Layer            | Technology                                    |
| ---------------- | --------------------------------------------- |
| **Framework**    | React 19 + TypeScript 5.7                     |
| **Build**        | Vite 6                                        |
| **Styling**      | Tailwind CSS 3.4 (custom NPF theme tokens)    |
| **Routing**      | React Router 7                                |
| **Server State** | TanStack Query (React Query) 5                |
| **Forms**        | React Hook Form 7 + Zod 4                     |
| **Linting**      | ESLint 9 (flat config) + Prettier 3           |
| **Testing**      | Vitest 3 + React Testing Library 16 + MSW 2.7 |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment template
cp .env.example .env

# 3. Start the development server
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Environment Variables

See [`.env.example`](.env.example) for all available variables:

| Variable              | Description                    | Default                                        |
| --------------------- | ------------------------------ | ---------------------------------------------- |
| `VITE_API_BASE_URL`   | Backend API base URL           | `http://localhost:3000/api`                    |
| `VITE_APP_NAME`       | Full application name          | Smart Police Complaint & Accountability Portal |
| `VITE_APP_SHORT_NAME` | Short name                     | SPCAP                                          |
| `VITE_ENABLE_MSW`     | Enable MSW for browser mocking | `false`                                        |
| `VITE_PAYLOAD_ENCRYPTION_ENABLED` | Enable JSON payload encryption | `false`                            |
| `VITE_PAYLOAD_ENCRYPTION_KEY` | Shared secret used to derive the AES key | unset                    |
| `VITE_PAYLOAD_ENCRYPTION_ALGORITHM` | Payload encryption algorithm | `aes-256-gcm`                       |
| `VITE_PAYLOAD_ENCRYPTION_IV_LENGTH` | AES-GCM IV length in bytes | `12`                                  |
| `VITE_PAYLOAD_ENCRYPTION_TAG_LENGTH` | AES-GCM auth tag length in bytes | `16`                       |
| `VITE_ENCRYPTED_PAYLOAD_SEPARATOR` | Separator used in serialized encrypted payloads | `.`        |

## Payload Encryption

The frontend supports JSON payload encryption through [`src/services/payloadEncryption.ts`](src/services/payloadEncryption.ts) and applies it centrally in [`src/services/api.ts`](src/services/api.ts).

When `VITE_PAYLOAD_ENCRYPTION_ENABLED=true`:

- Outgoing JSON request bodies are encrypted before being sent to the backend.
- Incoming encrypted JSON responses are automatically decrypted before the app consumes them.
- The payload format matches the backend contract: `{ encrypted: true, algorithm, payload }`.
- The serialized `payload` value uses backend-compatible `iv.tag.ciphertext` base64url segments.
- Additional authenticated data (AAD) is derived from the direction, HTTP method, and request path, so frontend and backend settings must match.

Recommended values:

```env
VITE_PAYLOAD_ENCRYPTION_ENABLED=true
VITE_PAYLOAD_ENCRYPTION_KEY=your-shared-secret
VITE_PAYLOAD_ENCRYPTION_ALGORITHM=aes-256-gcm
VITE_PAYLOAD_ENCRYPTION_IV_LENGTH=12
VITE_PAYLOAD_ENCRYPTION_TAG_LENGTH=16
VITE_ENCRYPTED_PAYLOAD_SEPARATOR=.
```

Notes:

- Only JSON requests sent through the shared API client are encrypted automatically.
- `FormData` uploads such as file upload endpoints are intentionally not encrypted by this helper.
- The frontend and backend must share the same secret, algorithm, IV length, tag length, and separator.

## Scripts

| Command                 | Description                   |
| ----------------------- | ----------------------------- |
| `npm run dev`           | Start dev server              |
| `npm run build`         | Type-check + production build |
| `npm run preview`       | Preview production build      |
| `npm run lint`          | Run ESLint                    |
| `npm run lint:fix`      | Auto-fix lint issues          |
| `npm run format`        | Format with Prettier          |
| `npm run format:check`  | Check formatting              |
| `npm test`              | Run tests in watch mode       |
| `npm run test:run`      | Run tests once                |
| `npm run test:coverage` | Run tests with V8 coverage    |

## Project Structure

```
src/
├── components/          # Shared/reusable UI components
│   ├── Alert.tsx        # Dismissible alert banners
│   ├── Badge.tsx        # Status/role badges
│   ├── Button.tsx       # Primary, secondary, outline, ghost, danger
│   ├── Card.tsx         # Card, CardHeader, CardBody, CardFooter
│   ├── Charts.tsx       # BarChart, DonutChart, StatCard, TrendLine
│   ├── EmptyState.tsx   # Empty list placeholders
│   ├── ErrorState.tsx   # Error display with retry
│   ├── FilterBar.tsx    # Reusable filter bar (select, date, text)
│   ├── Input.tsx        # Form input with label/error/hint
│   ├── Logo.tsx         # NPF crest logo
│   ├── Modal.tsx        # Accessible dialog/modal
│   ├── Select.tsx       # Form select with label/error
│   ├── Sidebar.tsx      # Dashboard sidebar navigation
│   ├── Skeleton.tsx     # Loading skeletons (card, table, generic)
│   ├── Table.tsx        # Table primitives
│   ├── Textarea.tsx     # Form textarea
│   ├── Topbar.tsx       # Dashboard top bar with user/logout
│   └── index.ts         # Barrel re-exports
├── hooks/
│   ├── useAuth.ts       # Auth context consumer hook
│   └── useQueries.ts    # TanStack Query hooks (all data fetching)
├── layouts/
│   ├── AuthLayout.tsx   # Centered auth forms
│   ├── DashboardLayout.tsx  # Sidebar + topbar + outlet
│   └── PublicLayout.tsx     # Navbar + footer
├── pages/
│   ├── admin/
│   │   └── UserManagementPage.tsx   # CRUD user management (admin-only)
│   ├── auth/
│   │   ├── ForgotPasswordPage.tsx
│   │   └── LoginPage.tsx
│   ├── dashboard/
│   │   ├── ComplaintDetailPage.tsx   # Detail, timeline, evidence, assign, status
│   │   ├── ComplaintsListPage.tsx    # Paginated list with status filter
│   │   ├── DashboardOverviewPage.tsx # Stats cards + recent complaints
│   │   ├── OfficersListPage.tsx      # Officers table
│   │   ├── ProfileSettingsPage.tsx   # Edit profile + change password
│   │   ├── ReportsPage.tsx           # Analytics charts, filters, rankings
│   │   └── StationsListPage.tsx      # Stations table
│   ├── public/
│   │   ├── ComplaintResultPage.tsx   # Public complaint status result
│   │   ├── ComplaintSuccessPage.tsx  # Confirmation after submission
│   │   ├── FaqPage.tsx              # FAQ accordion
│   │   ├── LandingPage.tsx          # Hero + features + CTA
│   │   ├── SubmitComplaintPage.tsx   # Multi-field complaint form
│   │   └── TrackComplaintPage.tsx    # Search by tracking ID
│   └── NotFoundPage.tsx             # 404 page
├── router/
│   ├── ProtectedRoute.tsx   # Auth guard with role checking
│   └── routes.tsx           # All route definitions
├── services/
│   ├── api.ts                # Typed fetch-based API service layer
│   └── payloadEncryption.ts  # JSON request/response encryption helpers
├── store/
│   └── AuthContext.tsx   # Auth provider (login, logout, persistence)
├── test/
│   ├── mocks/
│   │   ├── handlers.ts  # MSW request handlers
│   │   └── server.ts    # MSW server setup
│   └── test-utils.tsx   # Custom render with all providers
├── theme/
│   └── tokens.ts        # NPF color palette + design tokens
└── types/
    ├── auth.ts          # Auth types + Zod schemas
    ├── complaint.ts     # Complaint types + Zod schema
    ├── dashboard.ts     # Internal complaint, officer, station types
    └── reports.ts       # Report, admin, profile types
```

## Features

### Public Pages

- **Landing Page** — Hero section, feature highlights, call-to-action
- **Submit Complaint** — Multi-field form with Zod validation (12+ fields)
- **Track Complaint** — Look up status by tracking ID
- **Complaint Result** — Public status timeline
- **FAQ** — Accordion-style frequently asked questions

### Authentication

- **Login** — Email/password with form validation
- **Forgot Password** — Email-based password reset request
- **Auth Context** — JWT persistence via localStorage, role-based access
- **Protected Routes** — Auto-redirect to login, optional role allowlists

### Dashboard (Authenticated)

- **Overview** — 6-metric stats grid + recent complaints
- **Complaints List** — Paginated table, status filter, search
- **Complaint Detail** — Full details, status timeline, evidence viewer, assignment panel, status updater
- **Officers** — Paginated officers table with rank, badge, status
- **Stations** — Paginated stations table with officer/complaint counts
- **Reports & Analytics** — Trend line, donut chart, bar chart, filter bar, station rankings, officer performance tables
- **User Management** (admin) — CRUD users with roles, status, modals
- **Profile & Settings** — Edit profile, change password

### Reusable Components

- 20+ shared UI components with consistent NPF-inspired styling
- **FilterBar** — Declarative filter fields (select, date, text) with Apply/Reset
- **Chart Widgets** — BarChart, DonutChart, StatCard, TrendLine (pure SVG, no charting library)

## Design System

NPF-inspired institutional theme:

| Token         | Usage            | Hex                         |
| ------------- | ---------------- | --------------------------- |
| `primary-700` | Main green       | `#041710` → `#EDFAF2` scale |
| `accent-500`  | Gold accent      | `#3D210C` → `#FEFCEB` scale |
| `success`     | Resolved/active  | Green tones                 |
| `warning`     | Under review     | Amber tones                 |
| `danger`      | Dismissed/errors | Red tones                   |

## Testing

All API calls are mocked via MSW. Tests cover loading, success, empty, and error states for every page.

```bash
# Run all tests
npm run test:run

# Run with coverage
npm run test:coverage

# Watch mode
npm test
```

## Role-Based Access

| Role           | Access                                               |
| -------------- | ---------------------------------------------------- |
| `admin`        | All pages including User Management                  |
| `supervisor`   | Dashboard, complaints, officers, stations, analytics |
| `investigator` | Dashboard, complaints, settings                      |
| `officer`      | Dashboard, complaints, settings                      |

## License

MIT
