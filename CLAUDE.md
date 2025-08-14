# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application for implementing a subscription cancellation flow for Migrate Mate. The project is a coding challenge that requires implementing a pixel-perfect cancellation journey with A/B testing and secure data persistence.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks
- `npm run db:setup` - Initialize local Supabase database and run seed data
- `npm run db:reset` - Reset Supabase database

## Architecture

### Tech Stack
- **Frontend**: Next.js 15.3.5 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Development**: ESLint, Turbopack for fast dev builds

### Database Schema
The application uses three main tables:
- `users` - User accounts with email and UUID
- `subscriptions` - Monthly subscriptions ($25/$29 plans) with status tracking
- `cancellations` - Cancellation records with A/B test variant tracking

### Key Files
- `src/lib/supabase.ts` - Database client configuration (client + admin)
- `src/app/page.tsx` - Main profile page with subscription management UI
- `seed.sql` - Database schema and seed data with RLS policies

### Business Logic Requirements
- **A/B Testing**: 50/50 split using cryptographically secure RNG
- **Variant A**: No downsell screen
- **Variant B**: $10 off downsell offer ($25→$15, $29→$19)
- **Data Persistence**: Track user_id, downsell_variant, reason, accepted_downsell
- **Security**: Row-Level Security policies for data access control

### Environment Setup
- Requires Supabase environment variables (URL, anon key, service role key)
- Database seeded with 3 test users and corresponding subscriptions
- Mock user authentication (no real auth implementation needed)

## Implementation Notes

The current codebase provides scaffolding with a profile page UI but requires implementation of:
1. Cancellation flow UI matching Figma design
2. A/B testing logic with persistent variant assignment
3. Database integration for cancellation tracking
4. Security validation and RLS policy enforcement

The challenge emphasizes pixel-perfect UI implementation, secure data handling, and proper A/B test methodology over payment processing or complex authentication.