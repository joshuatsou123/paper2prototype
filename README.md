# Paper2Prototype

**AI-powered web app that transforms research papers into structured summaries, implementation plans, and prototype code.**

> Upload a machine learning research paper PDF, and get back a complete implementation guide — model architecture breakdown, dataset requirements, training procedure, step-by-step checklist, and runnable PyTorch starter code.

---

## Problem

Reading AI/ML research papers is hard. Reproducing them is harder. Students and junior researchers spend hours deciphering dense academic writing only to find that key implementation details — hyperparameters, preprocessing steps, architectural nuances — are buried or missing entirely.

Paper2Prototype bridges the gap between reading a paper and building from it.

## What It Does

1. **Upload** — Drag-and-drop any AI/ML research paper as a PDF
2. **Analyze** — The app extracts text from the PDF, sends it to Claude (Anthropic's LLM), and generates a structured prototype plan
3. **Build** — Review the output across six organized tabs: Overview, Architecture, Dataset, Training, Code, and Missing Details
4. **Save** — Every analysis is persisted locally so you can revisit past papers anytime

## Key Features

- **PDF text extraction** — Parses uploaded papers into machine-readable text using pdf-parse
- **LLM-powered analysis** — Claude analyzes the paper and returns structured JSON covering 14 implementation-relevant fields
- **Tabbed result dashboard** — Clean six-tab interface (Overview · Architecture · Dataset · Training · Code · Missing Details)
- **Copy-to-clipboard** — One-click copy on every section card
- **PyTorch starter code** — Auto-generated skeleton code based on the paper's described method
- **Missing details flagging** — Explicitly identifies what the paper left vague or unspecified
- **Difficulty scoring** — Easy / Medium / Hard rating with reasoning
- **Paper history** — SQLite-backed persistence so previous analyses are always accessible
- **Drag-and-drop upload** — File validation for type (PDF only) and size (10 MB max)
- **Responsive design** — Works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Custom shadcn-style components (Button, Card, Badge, Tabs) |
| LLM | Anthropic Claude (claude-sonnet-4-6) via `@anthropic-ai/sdk` |
| PDF Parsing | pdf-parse |
| Database | SQLite via Prisma ORM |
| Icons | Lucide React |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐  │
│  │ Landing  │   │  Upload  │   │  Result  │   │ History │  │
│  │  Page    │   │   Page   │   │   Page   │   │  Page   │  │
│  └──────────┘   └────┬─────┘   └────┬─────┘   └────┬────┘  │
│                      │              │               │       │
│                      ▼              │               │       │
│               ┌──────────────┐      │               │       │
│               │ POST         │      │               │       │
│               │ /api/analyze │      │               │       │
│               └──────┬───────┘      │               │       │
│                      │              │               │       │
│         ┌────────────┼──────────────┼───────────────┤       │
│         ▼            ▼              ▼               ▼       │
│  ┌────────────┐ ┌──────────┐ ┌───────────────────────────┐  │
│  │  pdf-parse │ │ Anthropic│ │        Prisma + SQLite     │  │
│  │ (extract)  │ │   Claude │ │   (persist & retrieve)    │  │
│  └────────────┘ │  (analyze)│ └───────────────────────────┘  │
│                 └──────────┘                                │
└─────────────────────────────────────────────────────────────┘
```

**Pipeline:** PDF upload → text extraction → LLM analysis → structured JSON → database storage → dashboard display

See [`docs/architecture.md`](docs/architecture.md) for a detailed breakdown.

## Setup Instructions

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** 9+
- An [Anthropic API key](https://console.anthropic.com/settings/keys)

### 1. Clone the repository

```bash
git clone https://github.com/<YOUR_USERNAME>/paper2prototype.git
cd paper2prototype
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Create `.env` for Prisma (the ORM reads this file separately):

```env
DATABASE_URL="file:./prisma/dev.db"
```

### 4. Initialize the database

```bash
npm run db:push
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Example Workflow

1. Navigate to **http://localhost:3000/upload**
2. Drop a PDF — for example, [Attention Is All You Need](https://arxiv.org/abs/1706.03762) from arXiv
3. Click **Generate Prototype Plan** and wait 30–60 seconds
4. Explore the output across six tabs:
   - **Overview** — problem statement, summary, key contribution, numbered implementation checklist
   - **Architecture** — model structure with implementation-level detail
   - **Dataset** — what data you need and how to preprocess it
   - **Training** — training loop, loss function, evaluation metrics
   - **Code** — PyTorch starter code ready to copy and extend
   - **Missing Details** — everything the paper left vague, flagged explicitly
5. Click the copy icon on any card to grab its content
6. Visit **History** to see all previously analyzed papers

See [`examples/`](examples/) for sample input/output.

## Project Structure

```
paper2prototype/
├── prisma/
│   └── schema.prisma            # Database schema (SQLite)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.ts  # POST: PDF → extract → Claude → save
│   │   │   └── papers/
│   │   │       ├── route.ts      # GET: list all papers
│   │   │       └── [id]/route.ts # GET/DELETE: single paper
│   │   ├── page.tsx              # Landing page
│   │   ├── upload/page.tsx       # Upload UI
│   │   ├── result/[id]/page.tsx  # Result dashboard
│   │   ├── history/page.tsx      # Paper history
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Tailwind + global styles
│   ├── components/
│   │   ├── ui/                   # Reusable primitives (Button, Card, Badge, Tabs)
│   │   ├── FileUpload.tsx        # Drag-and-drop PDF upload
│   │   ├── Navbar.tsx            # Top navigation
│   │   ├── ResultTabs.tsx        # Tabbed result display
│   │   └── SectionCard.tsx       # Card with copy button
│   ├── lib/
│   │   ├── analyze-paper.ts      # Anthropic API integration + prompt
│   │   ├── prisma.ts             # Prisma client singleton
│   │   └── utils.ts              # cn(), formatDate(), parseJsonField()
│   └── types/
│       └── paper.ts              # TypeScript interfaces
├── docs/                         # Architecture, setup, and roadmap docs
├── examples/                     # Sample input/output for reference
├── tests/                        # Test stubs and utilities
├── .env.example                  # Template for environment variables
├── .gitignore
├── package.json
├── tailwind.config.ts
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

## MVP Limitations

- **Text-based PDFs only** — Scanned or image-only PDFs will fail text extraction
- **No OCR** — No fallback for papers that are scanned images
- **No authentication** — Designed for local/personal use; no user accounts
- **Paper length limit** — Text is truncated to ~80,000 characters before LLM analysis
- **Single LLM provider** — Currently only supports Anthropic Claude
- **No streaming** — Results appear after full processing (30–60 seconds), not incrementally
- **Local database** — SQLite is not suitable for multi-user production deployments
- **Vercel timeout** — Free-tier Vercel has a 60-second serverless function limit; long papers may time out

## Future Improvements

- [ ] **Streaming responses** — Show results as Claude generates them instead of waiting for the full response
- [ ] **Multi-provider LLM support** — Add OpenAI GPT-4 and Google Gemini as selectable options
- [ ] **PDF OCR fallback** — Use Tesseract.js or a cloud OCR service for scanned papers
- [ ] **Export to Markdown/PDF** — Let users download their prototype plan
- [ ] **Paper comparison** — Side-by-side comparison of multiple analyzed papers
- [ ] **User authentication** — Sign up / login with NextAuth.js for persistent personal libraries
- [ ] **Collaborative annotations** — Let teams share and annotate prototype plans
- [ ] **arXiv URL input** — Paste an arXiv link instead of uploading a PDF
- [ ] **Fine-tuned prompts** — Domain-specific prompts for NLP, CV, RL, etc.
- [ ] **PostgreSQL migration** — Replace SQLite for production multi-user deployment

## Screenshots

> _Screenshots coming soon — see [Example Workflow](#example-workflow) for what to expect._

<!-- Add screenshots here:
![Landing Page](assets/screenshots/landing.png)
![Result Dashboard](assets/screenshots/result.png)
-->

## Demo

> _Live demo link coming soon._

<!-- Replace with your deployed URL:
🔗 [paper2prototype.vercel.app](https://paper2prototype.vercel.app)
-->

## Repository

<
🔗 [[github.com/your-username/paper2prototype](https://github.com/joshuatsou123/paper2prototype.git)]
-->

---

## License

MIT

---

Built with [Next.js](https://nextjs.org), [Claude](https://anthropic.com), and [Tailwind CSS](https://tailwindcss.com).
