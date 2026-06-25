# Setup Guide

## Prerequisites

- **Node.js** 18 or higher (20+ recommended)
- **npm** 9 or higher
- An **Anthropic API key** — get one at [console.anthropic.com](https://console.anthropic.com/settings/keys)

## Step-by-Step

### 1. Clone and install

```bash
git clone https://github.com/<YOUR_USERNAME>/paper2prototype.git
cd paper2prototype
npm install
```

`npm install` runs `prisma generate` automatically via the `postinstall` script.

### 2. Configure environment variables

The project uses two env files:

| File | Read by | Contains |
|------|---------|----------|
| `.env` | Prisma CLI | `DATABASE_URL` |
| `.env.local` | Next.js runtime | `ANTHROPIC_API_KEY` |

```bash
# Create both files from the template
cp .env.example .env
cp .env.example .env.local
```

Edit `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

The `DATABASE_URL` in `.env` is pre-configured for local SQLite — no changes needed.

### 3. Initialize the database

```bash
npm run db:push
```

This creates `prisma/dev.db` and applies the schema. Run again after any changes to `prisma/schema.prisma`.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Start Next.js in development mode |
| Build | `npm run build` | Create production build |
| Start | `npm start` | Run production build |
| Lint | `npm run lint` | Run ESLint |
| DB push | `npm run db:push` | Apply Prisma schema to database |
| DB generate | `npm run db:generate` | Regenerate Prisma client |

## Testing with a PDF

1. Download any AI/ML paper PDF from [arxiv.org](https://arxiv.org)
2. Go to `http://localhost:3000/upload`
3. Drop the PDF or click to browse
4. Click **Generate Prototype Plan**
5. Wait 30–60 seconds for analysis
6. Review the structured output across six tabs

**Good test papers:**
- "Attention Is All You Need" (Vaswani et al., 2017)
- "Deep Residual Learning for Image Recognition" (He et al., 2015)
- "BERT: Pre-training of Deep Bidirectional Transformers" (Devlin et al., 2018)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ANTHROPIC_API_KEY` not found | Check that `.env.local` exists and the key is correct |
| `DATABASE_URL` not found | Ensure `.env` exists with `DATABASE_URL="file:./prisma/dev.db"` |
| PDF extraction fails | Try a text-based PDF (scanned/image PDFs won't work) |
| Analysis times out | Very long papers are truncated to ~80k chars automatically |
| Prisma errors | Run `npm run db:push` to reset the database |
| Port 3000 in use | Run `npm run dev -- -p 3001` to use a different port |
