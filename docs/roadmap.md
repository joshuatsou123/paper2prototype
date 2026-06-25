# Roadmap

Current state: **MVP** — functional end-to-end pipeline for single-user local use.

## Near-Term (Next Sprint)

- [ ] **Streaming responses** — Use Anthropic's streaming API to show results progressively instead of blocking for 30–60 seconds
- [ ] **arXiv URL input** — Accept an arXiv link alongside PDF upload; fetch and parse the PDF server-side
- [ ] **Export to Markdown** — One-click download of the full prototype plan as a `.md` file
- [ ] **Improved code highlighting** — Add syntax highlighting to the PyTorch code block (Prism.js or Shiki)

## Medium-Term

- [ ] **Multi-provider LLM support** — Let users choose between Claude, GPT-4, and Gemini via a dropdown
- [ ] **PDF OCR fallback** — Integrate Tesseract.js for scanned papers
- [ ] **Paper comparison** — Side-by-side view of two analyzed papers
- [ ] **Search and filter** — Full-text search across paper history
- [ ] **Tags and categories** — Let users organize papers by topic (NLP, CV, RL, etc.)

## Long-Term

- [ ] **User authentication** — NextAuth.js for personal accounts and cloud persistence
- [ ] **PostgreSQL migration** — Replace SQLite for multi-user production deployment
- [ ] **Collaborative annotations** — Share prototype plans with team members
- [ ] **Fine-tuned domain prompts** — Specialized prompts for different ML subfields
- [ ] **CI/CD pipeline** — Automated testing and deployment via GitHub Actions
- [ ] **API endpoint** — Public REST API for programmatic paper analysis

## Non-Goals (for now)

- Full paper management system (Zotero/Mendeley replacement)
- Real-time multi-user collaboration
- Mobile native app
- Training or fine-tuning models within the platform
