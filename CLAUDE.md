# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Firmino is a D&D Campaign Management Web Application - a collaborative wiki-style campaign manager with:
- Obsidian-style `[[wikilinks]]` for interconnected notes
- Knowledge graph visualization (force-directed graphs)
- RAG-powered AI search using Claude
- Role-based collaboration (DM, player, viewer roles)

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript 5.3 (strict mode)
- **Database:** Vercel Postgres (Neon) with Drizzle ORM and pgvector for embeddings
- **Auth:** NextAuth.js with JWT strategy and credentials provider
- **AI:** Anthropic Claude API + Jina API for embeddings (with keyword search fallback)
- **UI:** Tailwind CSS + shadcn/ui components + next-themes for dark mode

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run db:push      # Push Drizzle schema to database
npm run db:studio    # Open Drizzle Studio GUI
```

## Architecture

### App Router Structure (`app/`)
- `(auth)/` - Login/register pages
- `(dashboard)/campaigns/[campaignId]/` - Campaign pages (notes, graph, chat, entities, settings)
- `api/` - API routes for campaigns, entities, auth, admin, invites

### Key Libraries (`lib/`)
- `db/schema.ts` - Complete database schema (users, campaigns, entities, chunks, embeddings)
- `auth.ts` - NextAuth configuration
- `api/access.ts` - Campaign access control utilities
- `ai/rag.ts` - Vector search with keyword fallback
- `ai/chat.ts` - Claude chat generation
- `ai/extraction/pipeline.ts` - Multi-pass entity extraction from documents
- `wikilinks/parser.ts` - `[[wikilink]]` parsing
- `campaign-settings.ts` - Campaign configuration defaults

### Authorization Model
- Campaign owner: Full access
- DM role: Full access including DM-only content
- Player role: Limited access, sees only non-DM content
- Viewer role: Read-only

Access control is centralized in `lib/api/access.ts` with `checkCampaignAccess()`.

### RAG Search (`lib/ai/rag.ts`)
- Primary: pgvector cosine similarity search on 1536-dimension embeddings
- Fallback: Keyword search when vectors unavailable or Jina API is down
- Configurable thresholds and DM-only content filtering

### Entity Extraction Pipeline (`lib/ai/extraction/`)
- Multi-pass Claude extraction (Haiku initial, Sonnet refinement)
- Configurable aggressiveness: conservative, balanced, obsessive
- Staged review workflow before database commit
- Automatic deduplication with fuzzy matching

## Environment Variables

```bash
DATABASE_POSTGRES_URL       # Vercel Postgres connection
NEXTAUTH_URL               # Base URL (http://localhost:3000 for dev)
NEXTAUTH_SECRET            # Session encryption key
ANTHROPIC_API_KEY          # Claude API
JINA_API_KEY               # Embeddings API (optional, has fallback)
```

## Database Notes

- Uses Postgres connection pooler with `prepare: false` for serverless compatibility
- Entity system evolved from legacy notes system (backward compat maintained)
- Vector embeddings stored in `chunks` and `entity_embeddings` tables

## Key Files for Context

| File | Purpose |
|------|---------|
| `lib/db/schema.ts` | Database schema - start here for data model |
| `lib/api/access.ts` | Authorization logic |
| `app/api/campaigns/[campaignId]/chat/route.ts` | Main RAG chat endpoint |
| `lib/ai/rag.ts` | Core search implementation |
| `middleware.ts` | Route-level auth protection |
