# MigrateMate – Cancellation & Downsell Flow

A focused **Next.js (App Router)** module that runs a secure, experiment-ready **subscription cancellation flow**. It collects feedback, offers targeted down-sell options, and persists outcomes in **Supabase**.

> ✅ This repository contains a **working implementation** of the full cancellation & downsell flow, including UI steps, data persistence, security, and A/B testing.

---

## 🏗 Architecture Decisions

**Tech stack**
- **Next.js + React (TypeScript)** for UI, modal-based multi-step flow.
- **Supabase** for auth, database, and realtime.

**Module boundaries**
- `src/components/*` – stateless UI steps (e.g., `JobSearchSurveyStep.tsx`, `DownsellOfferStep.tsx`, `FinalCancellationStep.tsx`). The orchestrator is `CancellationFlow.tsx`.
- `src/lib/cancellation-service.ts` – thin service that calls the secure data layer and encapsulates flow persistence (`initializeCancellation`, `finalizeCancellation`).
- `src/lib/supabase.ts` – client creation + **SecureDatabase** class (all DB access lives here).
- `src/lib/validation.ts` – input sanitization, security event logging.
- `src/lib/ab-testing.ts` – user-level variant assignment and persistence.
- `src/lib/csrf.ts` – CSRF helpers for server actions/endpoints.
- `src/types/*` – shared contracts (`CancellationSession`, `Cancellation`, etc.).

**State/flow**
- `CancellationFlow` is a state machine (`FlowStep` union) that:
  1. Bootstraps a user session (`initializeCancellation`)
  2. Moves through steps based on answers and variant
  3. Persists final outcome via the service (`finalizeCancellation`)

---

## 🔐 Security Implementation

- Environment variables validated **server-side only** (hard fail if missing).
- **Admin client** is never created on the client.
- **RLS policies** in Supabase enforce user isolation (`user_id = auth.uid()`).
- Payloads sanitized with `sanitizeForDatabase(...)`.
- **CSRF protection** added for server actions/endpoints.
- Security/audit events logged via `logSecurityEvent`.

---

## 🧪 A/B Testing Approach

- Deterministic assignment of **Variant A | B** using `ab-testing.ts` (hash-based).
- Variant stored in DB (`cancellations.downsell_variant`) to ensure persistence.
- Surfaces differ by variant:
  - **A** → survey before offer
  - **B** → early down-sell step
- Outcomes persisted: `continued`, `downsell_accepted`, `pending-cancellation`, `cancelled`.
- Events logged for funnel measurement and retention tracking.

---

## ⚙️ Setup

Follow these steps to get the project running locally.

### 1. Clone the repository
```bash
git clone https://github.com/your-org/migratemate-cancellation-flow.git
cd migratemate-cancellation-flow
npm install

.env.example
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # server only

npm run db:setup


