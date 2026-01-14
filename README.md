# Firmino

A personal AI assistant for capturing ideas, organizing projects, and connecting creative work. Features wiki-style notes with Obsidian-style `[[wikilinks]]` and RAG-powered AI search.

## Features

- **Wiki-Style Notes**: Create interconnected notes for ideas, references, and projects with `[[wikilinks]]`
- **Knowledge Graph**: Visualize connections between your ideas with an interactive force-directed graph
- **AI-Powered Search**: Ask questions about your workspace and get answers with source citations using RAG
- **Smart Extraction**: Automatically extract and link concepts from uploaded documents
- **Collaborative**: Share workspaces with collaborators using role-based permissions

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui
- **Database**: Vercel Postgres (Neon) with pgvector for embeddings
- **ORM**: Drizzle ORM
- **Auth**: NextAuth.js with credentials provider
- **AI**: Anthropic Claude API, Jina API for embeddings
- **Visualization**: react-force-graph-2d
- **Deploy**: Vercel

## Local Development

### Prerequisites

- Node.js 18+
- Vercel CLI (`npm i -g vercel`)
- Anthropic API key

### Setup

1. Clone the repository:
```bash
git clone <repo-url>
cd firmino
```

2. Install dependencies:
```bash
npm install
```

3. Link to your Vercel project:
```bash
vercel link
```

4. Pull environment variables:
```bash
vercel env pull .env.local
```

5. Add your API keys to `.env.local`:
```
ANTHROPIC_API_KEY=your-anthropic-api-key
JINA_API_KEY=your-jina-api-key  # optional
NEXTAUTH_SECRET=your-secret-here
```

6. Push the database schema:
```bash
npm run db:push
```

7. Run the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```
# Database (auto-set by Vercel Postgres integration)
DATABASE_POSTGRES_URL=

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# AI
ANTHROPIC_API_KEY=your-anthropic-api-key
JINA_API_KEY=your-jina-api-key  # optional, has fallback
```

## Entity Types

- **Artwork**: Finished pieces, portfolio items
- **Character**: Character designs, OCs
- **Reference**: Visual references, mood boards
- **Technique**: Methods, processes, tutorials
- **Client**: Clients, commissioners
- **Style**: Art styles, aesthetics
- **Idea**: Raw ideas, concepts
- **Task**: Action items, to-dos
- **Milestone**: Project milestones, deadlines
- **Asset**: Resources, files, tools
- **Note**: General notes
- **Inspiration**: Artists, works that inspire

## Wikilinks

Link entities together using Obsidian-style wikilinks:

- `[[Entity Name]]` - Link to an entity by name
- `[[Entity Name|Display Text]]` - Link with custom display text

The editor provides autocomplete suggestions as you type.

## AI Chat

The AI chat feature uses RAG (Retrieval-Augmented Generation) to:

1. Search your workspace using vector similarity (pgvector)
2. Build context from relevant chunks
3. Generate responses with Claude
4. Display source citations

## License

MIT
