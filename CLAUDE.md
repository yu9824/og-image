# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A serverless TypeScript application that dynamically generates Open Graph (OGP) images using headless Chromium/Puppeteer, deployed on Vercel. Forked from Vercel's og-image project.

## Commands

### Development
```bash
vercel dev          # Start local dev server (primary development method)
OG_HTML_DEBUG=1 vercel dev  # Debug mode: returns raw HTML instead of screenshot
```

### Build
```bash
npm run build       # Compiles web/index.ts → public/dist/ (tsc -p web/tsconfig.json)
```

The API TypeScript is NOT pre-compiled — Vercel handles it at runtime.

### Docker (alternative local environment)
```bash
./docker/build.sh   # Build Docker image
./docker/run.sh     # Run container with bind mount to project
```

### Verification
```bash
node scripts/verify-vercel-dev.mjs  # Verify vercel dev setup
```

## Architecture

Request flow: `api/index.ts` → parser → template → chromium → PNG/JPEG response

### Key Components

**`api/index.ts`** — Serverless entry point. Parses request, generates HTML, screenshots it, returns image with 7-day immutable cache headers. Detects production via `AWS_REGION` env var.

**`api/_lib/parser.ts`** — Extracts text from URL path (filename), file type from extension, and query params. Rejects array values (only single values allowed per param).

**`api/_lib/template.ts`** — Builds the HTML page that gets screenshotted. Loads custom fonts as base64 WOFF2, renders markdown via `marked`, emojis via `twemoji`, math via KaTeX. Supports 3 background patterns: `none`, `cross`, `polka`.

**`api/_lib/chromium.ts`** — Launches headless Chrome, takes 1200×630px screenshot (standard OGP size). Reuses browser instance across invocations.

**`api/_lib/options.ts`** — Returns Puppeteer launch config. Dev uses system Chrome (path varies by OS); production uses `@sparticuz/chromium`. macOS path: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.

**`api/_lib/sanitizer.ts`** — Basic HTML entity encoding to prevent XSS in user-provided text/colors.

**`web/index.ts`** — Frontend UI compiled to `public/dist/`. Interactive form that builds the image URL and shows live preview. Uses dot-dom (Preact-like) loaded from CDN in `public/index.html`.

### URL Format
```
/{text}.{png|jpeg}?pattern=cross&fontSize=50px&width=600px&md=1&textColor=...&textStrongColor=...&overlay=...
```
All routes rewrite to `/api` (see `vercel.json`).

### TypeScript Setup
- `api/tsconfig.json`: CommonJS, ESNext target, JSX react
- `web/tsconfig.json`: extends api config, ESNext module, outputs to `public/dist/`

### Node Version
Node 24.x required (pinned to 24.14.0 via Volta).


# AI-DLC and Spec-Driven Development

Kiro-style Spec Driven Development implementation on AI-DLC (AI Development Life Cycle)

## Project Context

### Paths
- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications
- Check `.kiro/specs/` for active specifications
- Use `/kiro:spec-status [feature-name]` to check progress

## Development Guidelines
- Think in English, generate responses in Japanese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).

## Minimal Workflow
- Phase 0 (optional): `/kiro:steering`, `/kiro:steering-custom`
- Phase 1 (Specification):
  - `/kiro:spec-init "description"`
  - `/kiro:spec-requirements {feature}`
  - `/kiro:validate-gap {feature}` (optional: for existing codebase)
  - `/kiro:spec-design {feature} [-y]`
  - `/kiro:validate-design {feature}` (optional: design review)
  - `/kiro:spec-tasks {feature} [-y]`
- Phase 2 (Implementation): `/kiro:spec-impl {feature} [tasks]`
  - `/kiro:validate-impl {feature}` (optional: after implementation)
- Progress check: `/kiro:spec-status {feature}` (use anytime)

## Development Rules
- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `/kiro:spec-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Steering Configuration
- Load entire `.kiro/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/kiro:steering-custom`)
