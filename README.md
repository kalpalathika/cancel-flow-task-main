# MigrateMate – Cancellation & Downsell Flow

A focused **Next.js (App Router)** module that runs a secure, experiment-ready **subscription cancellation flow**. It collects feedback, offers targeted down-sell options, and persists outcomes in **Supabase**.

> ✅ This repository contains a **working implementation** of the full cancellation & downsell flow, including UI steps, data persistence, security, and A/B testing.

---

## 🏗 Architecture Decisions

**Tech stack**
- **Next.js + React (TypeScript)** for UI, modal-based multi-step flow.
- **Supabase** for database.

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

## 🧪 A/B Testing Approach

- Deterministic assignment of **Variant A | B** using `ab-testing.ts` (hash-based).
- Variant stored in DB (`cancellations.downsell_variant`) to ensure persistence.
- Surfaces differ by variant:
  - **A** → survey before offer
  - **B** → early down-sell step

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

create .env.local and place the .env.example above with actual keys in it
npm run db:setup

Note: Did not have time to test RLS completely, please disable RLS in DB if it does not work
```

## Future Enhancements

This repository already contains a working implementation of the cancellation & downsell flow.  
To move towards production readiness, the following items are planned for the future:

- Unit tests for core logic (`SecureDatabase`, cancellation service, flow transitions).  
- Integration tests for Supabase database interactions and end-to-end user flows.  
- Webpack or other build optimizations for smaller bundles and faster deploys.  
- Accessibility validations (WCAG 2.1 AA) for modals, forms, and keyboard navigation.  
- CI/CD pipeline with linting, type checks, and automated testing.  
- Monitoring and analytics (e.g., Sentry, Datadog, Supabase logs).  
- Performance tuning (caching, rate limits, optimized database indexes).  

---

These enhancements are not implemented yet — they are planned for future iterations to make the codebase fully production-ready.

![Demo](media/migrateMateDemo.mov)


