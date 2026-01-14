# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Firmino is MGXs's personal AI assistant for capturing ideas, organizing projects, and connecting creative work. Features:
- Obsidian-style `[[wikilinks]]` for interconnected notes
- Knowledge graph visualization (force-directed graphs)
- RAG-powered AI search using Claude
- Role-based collaboration (owner, collaborator, viewer roles)

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
- `(dashboard)/campaigns/[campaignId]/` - Workspace pages (notes, graph, chat, entities, settings)
- `api/` - API routes for workspaces, entities, auth, admin, invites

### Key Libraries (`lib/`)
- `db/schema.ts` - Complete database schema (users, workspaces, entities, chunks, embeddings)
- `auth.ts` - NextAuth configuration
- `api/access.ts` - Workspace access control utilities
- `ai/rag.ts` - Vector search with keyword fallback
- `ai/chat.ts` - Claude chat generation
- `ai/extraction/pipeline.ts` - Multi-pass entity extraction from documents
- `wikilinks/parser.ts` - `[[wikilink]]` parsing
- `campaign-settings.ts` - Workspace configuration defaults

### Entity Types
- `artwork` - Finished pieces, portfolio items
- `character` - Character designs, OCs
- `reference` - Visual references, mood boards
- `technique` - Methods, processes, tutorials
- `client` - Clients, commissioners
- `style` - Art styles, aesthetics
- `idea` - Raw ideas, concepts
- `task` - Action items, to-dos
- `milestone` - Project milestones, deadlines
- `asset` - Resources, files, tools
- `note` - General notes
- `inspiration` - Artists, works that inspire

### Authorization Model
- Owner: Full access
- Collaborator: Limited access, sees only non-private content
- Viewer: Read-only

Access control is centralized in `lib/api/access.ts` with `checkCampaignAccess()`.

### RAG Search (`lib/ai/rag.ts`)
- Primary: pgvector cosine similarity search on 1536-dimension embeddings
- Fallback: Keyword search when vectors unavailable or Jina API is down
- Configurable thresholds and private content filtering

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
- Vector embeddings stored in `chunks` and `entity_embeddings` tables

## Key Files for Context

| File | Purpose |
|------|---------|
| `lib/db/schema.ts` | Database schema - start here for data model |
| `lib/api/access.ts` | Authorization logic |
| `app/api/campaigns/[campaignId]/chat/route.ts` | Main RAG chat endpoint |
| `lib/ai/rag.ts` | Core search implementation |
| `middleware.ts` | Route-level auth protection |
