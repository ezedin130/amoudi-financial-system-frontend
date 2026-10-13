# Amoudi Financial Management — Frontend

Modern, production-grade React application for the **Amoudi Financial Management System**, integrated with the authoritative Spring Boot backend (`http://localhost:8080/api/v1`).

---

## 1. Architecture & Tech Stack

- **Framework:** React 19 + TypeScript 5.7
- **Build Tool:** Vite 6 (with Rollup manual chunks for optimal vendor bundling)
- **Routing:** React Router 7 (`createBrowserRouter`) with centralized `ErrorBoundary` and `ProtectedRoute` guards
- **Styling:** Tailwind CSS v4 + Authoritative Figma Design Tokens (`#0F2E22` Forest Green, `#CBA326` Gold, `Jost`, `Inter`)
- **Testing:** Vitest 3 + React Testing Library + JSDOM (132 automated unit and component tests)
- **Icons & Branding:** Native SVG icons and official Amoudi Brand Mark extracted from authoritative Figma design
- **State & Data Invariants:** Strictly backend-authoritative. Zero client-side arithmetic or balance calculations. Zero mock data.

---

## 2. Directory Structure

```text
frontend/
├── index.html                  # HTML entrypoint with Google Fonts (Josefin Sans, Jost, Inter)
├── vite.config.ts              # Vite + React + Tailwind v4 + path alias + proxy + Vitest + manualChunks
├── tsconfig.json               # TypeScript configuration with @/* alias
├── package.json                # Project dependencies and scripts
├── .env                        # Local backend URL (VITE_API_BASE_URL=http://localhost:8080)
├── public/
│   └── amoudi-logo.jpeg        # Official Amoudi brand logo asset
└── src/
    ├── app/
    │   ├── App.tsx             # Root component with ErrorBoundary, AuthProvider, and RouterProvider
    │   └── router.tsx          # Declarative router with public, protected, and role-guarded routes
    ├── api/
    │   ├── client.ts           # Centralized HTTP client (Bearer token, correlation IDs, 401 handling, blob handling)
    │   ├── auth.ts             # Auth endpoints (POST /auth/login, GET /auth/me)
    │   ├── nonIataApi.ts       # Non-IATA CRUD, status toggling, ledger, and financial summaries
    │   ├── salesApi.ts         # Sales transaction querying, filtering, and ticket details
    │   ├── importsApi.ts       # Galileo/BSP daily sales report Excel uploading and batch audit logs
    │   ├── paymentsApi.ts      # Payment recording, cancellation, receipt upload, and binary receipt retrieval
    │   ├── statementsApi.ts    # Authoritative chronological statements and Excel/PDF exports
    │   ├── agingApi.ts         # Accounts receivable aging reports and Excel/PDF exports
    │   └── dashboardApi.ts     # Aggregated dashboard metrics and recent operational activity
    ├── auth/
    │   ├── AuthContext.tsx     # Context providing user profile, JWT token, login, logout, & hydration
    │   ├── ProtectedRoute.tsx  # Route guard checking authentication and allowed roles
    │   └── auth.types.ts       # Typed credentials, login response, and auth state
    ├── components/
    │   ├── branding/           # Amoudi double-diamond brand mark and header lockup
    │   ├── layout/             # Responsive AppShell, Header, and role-aware Sidebar
    │   └── ui/                 # ErrorBoundary, Modal, Button, Input, Card, Badge, PageHeader, Icons
    ├── features/
    │   ├── dashboard/          # KPI overview cards, aging distribution, balance table, recent feeds
    │   ├── non-iata/           # Sub-agent list, search, status changes, creation, and detail views
    │   ├── sales/              # Sales transactions table, ticket filtering, and detail modal
    │   ├── imports/            # Excel upload dropzone, validation feedback, and ingestion history
    │   ├── payments/           # Payment recording, cancellation dialog, receipt viewer & uploader
    │   ├── statements/         # Statements table, running/closing balances, Excel & PDF export
    │   └── aging/              # FIFO aging bracket breakdown, risk indicators, Excel & PDF export
    ├── pages/                  # Top-level page controllers
    ├── types/                  # Authoritative TypeScript contracts matching backend DTOs
    └── utils/                  # Safe currency/date formatters and binary blob download helpers
```

---

## 3. Getting Started

### Prerequisites

- Node.js `v20+` or `v22+`
- PostgreSQL 15+ running
- Spring Boot backend running on `http://localhost:8080`

### Installation & Development

```bash
# 1. Install dependencies
npm install

# 2. Start local development server (runs on http://localhost:5173)
npm run dev

# 3. Run type checking (0 errors enforced)
npx tsc --noEmit

# 4. Run automated test suite (132 tests)
npm test

# 5. Production build (Vite + Rollup chunking)
npm run build
```

---

## 4. Environment Configuration

The frontend communicates with the backend via `VITE_API_BASE_URL`.
- Default: `http://localhost:8080`
- Configured in `.env` or set as an environment variable in production environments.
- In production builds, no developer secrets or passwords are embedded in the client bundle.

---

## 5. Role Capabilities Matrix

| Workflow / Endpoint | Finance Role | General Manager Role |
| :--- | :---: | :---: |
| **Dashboard Overview** | Read-Only | Read-Only |
| **Non-IATA Sub-Agents** | View, Create, Update, Activate/Deactivate | View Only |
| **Sales Reports & Viewing** | View All Transactions & Details | View All Transactions & Details |
| **Daily Sales Excel Upload** | **Allowed** (`POST /api/v1/imports`) | **Forbidden** (`403 Forbidden`) |
| **Payment Recording** | **Forbidden** (`403 Forbidden`) | **Allowed** (`POST /api/v1/payments`) |
| **Receipt Upload / Replace** | **Forbidden** (`403 Forbidden`) | **Allowed** (`POST /api/v1/payments/{id}/receipt`) |
| **Receipt Viewing & Download** | Allowed | Allowed |
| **Payment Cancellation** | **Allowed** (`POST /api/v1/payments/{id}/cancel`) | **Forbidden** (`403 Forbidden`) |
| **Account Statements** | View, Filter, Export Excel & PDF | View, Filter, Export Excel & PDF |
| **A/R Aging Analysis** | View, Filter, Export Excel & PDF | View, Filter, Export Excel & PDF |

---

## 6. Authentication & Reliability Features

1. **Centralized Error Boundary:** Any unexpected React rendering error is caught gracefully, presenting an accessible recovery screen with "Refresh Page" and "Return to Dashboard" options without leaking stack traces or internal secrets.
2. **Session Lifecycle:** Bearer tokens are stored in `localStorage` under `amoudi_auth_token`. Upon receiving any backend `401 Unauthorized` response, the token is automatically wiped, active state is cleared, and the user is redirected to `/login`.
3. **Blob & Memory Safety:** Receipts, PDF exports, and Excel spreadsheets are handled as binary blobs with automatic object URL revocation (`URL.revokeObjectURL`) to prevent browser memory leaks.
4. **Accessible Modals & Controls:** All modals feature `role="dialog"`, `aria-modal="true"`, focus preservation, backdrop click dismiss, and `Escape` key handling. File upload dropzones are keyboard navigable via `Tab`, `Enter`, and `Space`.
