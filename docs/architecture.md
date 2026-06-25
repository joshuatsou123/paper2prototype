# Architecture

Paper2Prototype is a Next.js 15 full-stack application. The frontend and backend live in a single codebase, following the Next.js App Router convention.

## System Overview

```
User
 │
 │  1. Upload PDF
 ▼
┌───────────────────────────────────────────────────┐
│  Next.js Frontend                                 │
│  /upload — FileUpload component (drag & drop)     │
│                                                   │
│  POST /api/analyze (FormData with PDF)            │
└───────────────┬───────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────┐
│  API Route: /api/analyze/route.ts                 │
│                                                   │
│  Step 1: Validate file (type, size)               │
│  Step 2: Extract text via pdf-parse               │
│  Step 3: Send text to Anthropic Claude API        │
│  Step 4: Parse structured JSON response           │
│  Step 5: Save result to SQLite via Prisma         │
│  Step 6: Return { id } to client                  │
└───────────────┬───────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────┐
│  Next.js Frontend                                 │
│  /result/[id] — ResultTabs component              │
│                                                   │
│  Fetches PaperResult from DB (server component)   │
│  Displays across 6 tabs with copy buttons         │
└───────────────────────────────────────────────────┘
```

## Key Components

### Frontend Layer (`src/app/`, `src/components/`)

| Component | File | Purpose |
|-----------|------|---------|
| Landing page | `src/app/page.tsx` | Hero, features, CTA |
| Upload page | `src/app/upload/page.tsx` | Drag-and-drop upload UI |
| Result page | `src/app/result/[id]/page.tsx` | Server component that fetches paper data and renders tabs |
| History page | `src/app/history/page.tsx` | Lists all analyzed papers from DB |
| FileUpload | `src/components/FileUpload.tsx` | Client component handling file selection, validation, upload state |
| ResultTabs | `src/components/ResultTabs.tsx` | Client component with tab switching, code blocks, copy buttons |
| SectionCard | `src/components/SectionCard.tsx` | Reusable card with copy-to-clipboard |

### Backend Layer (`src/app/api/`, `src/lib/`)

| Module | File | Purpose |
|--------|------|---------|
| Analyze route | `src/app/api/analyze/route.ts` | Accepts PDF upload, orchestrates the full pipeline |
| Papers list | `src/app/api/papers/route.ts` | GET endpoint returning all saved papers |
| Paper detail | `src/app/api/papers/[id]/route.ts` | GET/DELETE for individual papers |
| LLM service | `src/lib/analyze-paper.ts` | Anthropic SDK integration, prompt engineering, JSON parsing |
| Database | `src/lib/prisma.ts` | Prisma client singleton (prevents connection pool exhaustion in dev) |

### Data Layer (`prisma/`)

- **Schema:** `prisma/schema.prisma` defines the `PaperResult` model with 17 fields
- **Database:** SQLite file at `prisma/dev.db` (gitignored)
- **JSON fields:** `implementationChecklist` and `missingDetails` are stored as JSON strings since SQLite lacks native array support

## Data Flow

```
PDF file (max 10 MB)
    │
    ▼
pdf-parse — extracts raw text from PDF
    │
    ▼
Text truncation — cap at ~80,000 characters
    │
    ▼
Anthropic Claude API — structured prompt requesting JSON
    │
    ▼
JSON parsing — strip code fences, extract outermost object
    │
    ▼
Prisma create — persist all 17 fields to SQLite
    │
    ▼
Client redirect — /result/{id}
```

## LLM Prompt Design

The system prompt in `src/lib/analyze-paper.ts` instructs Claude to:

1. Act as an ML researcher and engineering mentor
2. Focus on reproduction-relevant details (not just summarization)
3. Return exactly 14 JSON keys covering problem, architecture, dataset, training, code, and gaps
4. Flag missing information rather than inventing it
5. Target explanations at an undergraduate AI/ML level

The prompt explicitly requests raw JSON (no markdown fences) and the parsing logic has fallbacks for when the model wraps output in code blocks anyway.

## Error Handling

| Error | Where | Response |
|-------|-------|----------|
| Non-PDF file | API route | 400 with message |
| File > 10 MB | API route + client | 413 / client-side validation |
| Empty/unreadable PDF | API route | 422 with guidance |
| LLM API failure | API route | 502 with retry suggestion |
| Malformed LLM JSON | analyze-paper.ts | Fallback regex extraction, then throw |
| Paper not found | result page | Next.js 404 via `notFound()` |
