# ContextCraft — AI Context Window Planner

A visual tool for planning and understanding AI model context windows. Add content blocks (system prompts, code files, documents, chat history, images) and watch a blueprint architectural diagram fill up to show how much of your chosen model's context window you're consuming.

## What It Does

- **Visual blueprint diagram** showing context usage as a building cross-section
- **12 AI models** across OpenAI, Anthropic, Google, DeepSeek, Meta, Mistral
- **6 content types** with size presets (System Prompt, Code File, Document, Chat History, Image, Custom)
- **5 preset scenarios** (RAG Pipeline, Code Review, Long-Doc Q&A, Full Codebase, Multimodal)
- **Cost estimation** based on published input token pricing
- **Real-world comparisons** (novels, Wikipedia articles, emails, tweets)
- **Auto-saves** to localStorage

## Design

Style: **Precision Engineering Blueprint**
- Deep navy blueprint paper background with CSS grid
- Monospace typography (JetBrains Mono) throughout
- Blueprint-blue accents with cream annotation labels
- Building cross-section as signature visual element
- Corner marks, dimension arrows, scale rulers

## Running

### Docker (production)
```bash
docker build -t contextcraft .
docker run -p 3113:80 contextcraft
```

### Development
```bash
npm install
npm run dev
```

## Deployment

Deployed at: http://100.97.65.28:3113

```bash
# On plex:
docker compose up -d --build
```

## Tech Stack

- React 18 + Vite
- Pure CSS (no Tailwind, no libraries)
- Zero backend — all data is client-side
- LocalStorage for state persistence
