# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation supports all 11 document types via AI chat. PL-4 built the technical foundation, PL-5 added AI chat for NDA creation, PL-6 expanded to all document types. Document persistence is planned for future tickets.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
The frontend is statically built (`next build` with `output: "export"`) and served by FastAPI from `frontend/out/`.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme

These are the actual Tailwind tokens in `frontend/tailwind.config.ts`:
- `navy`: `#0f1f38` (header background)
- `gold`: `#b8963e` (accents, focus states, download button)
- `gold-hover`: `#a07d2e`
- `gold-light`: `#fdf8f0` (focused input background)
- `surface`: `#f2f1ee` (form panel background)
- `desk`: `#c8c4bc` (document preview background)
- `rule`: `#e5e2dd` (borders)
- `ink`: `#1a2333` (body text)

## Implementation Status

### Completed (PL-4) — Technical Foundation
- Docker multi-stage build: Node 20 builds frontend, Python 3.12-slim runs backend
- FastAPI backend (`backend/`, uv project) with SQLite — fresh DB each container start
- Next.js static export (`output: "export"`) served by FastAPI at `http://localhost:8000`
- Auth endpoints with JWT (HttpOnly cookies) and bcrypt password hashing
- Start/stop scripts for Mac, Linux, Windows (`scripts/`)
- Mutual NDA form with live preview and client-side PDF download (`frontend/app/page.tsx`)
- `.env.example` documents required environment variables

### Completed (PL-5) — AI Chat Interface
- Left panel has a **Chat / Form** tab toggle — both modes share `formData` so the preview stays in sync
- **AI Chat tab**: freeform conversation; AI asks questions and extracts field values via structured output
- **Manual Form tab**: field-by-field form for users who prefer direct input
- LiteLLM via OpenRouter with Cerebras inference (`gpt-oss-120b`); streaming SSE response + structured-output field extraction after each reply
- Resilience: extraction wrapped in `try/finally` (backend) and `sendMessage` uses `try/catch/finally` (frontend)

### Completed (PL-6) — All Document Types
- AI detects document type from conversation (two-phase: detecting → drafting)
- Document Registry in `backend/app/documents.py`: `DocumentConfig` dataclass, `REGISTRY` dict with 12 entries, `make_fields_model()` builds Pydantic models dynamically via `create_model`
- SSE events: `text`, `detection`, `fields`, `done`, `error`
- `detection` event carries `document_type` and `name`; frontend transitions from detecting → drafting phase
- `FormData = Record<string, string>` replaces `NDAFormData`; `DOCUMENT_CONFIGS` mirrors backend registry
- NDA: structured preview + PDF; other types: `GenericPreview` + `generateGenericPDF`
- `DynamicFormPanel` renders any document's fields from config
- Download button appears when all required fields are populated and doc type is known
- `GET /api/catalog` endpoint returns all registered doc types
- 19 backend tests passing; backward-compat aliases: `GREETING`, `NDAFields`

### Not yet built (upcoming tickets)
- **PL-7**: Frontend auth UI, document persistence, My Documents, user menu

### Current API Endpoints
- `GET  /api/health` — Health check
- `GET  /api/catalog` — List all supported document types
- `GET  /api/chat/greeting` — Returns AI greeting (`?document_type=<key>` for doc-specific)
- `POST /api/chat/message` — Streaming SSE chat: `{message, history, document_type?}` → text/detection/fields/done events
- `POST /api/auth/signup` — Create account (sets JWT cookie)
- `POST /api/auth/signin` — Sign in (sets JWT cookie)
- `POST /api/auth/signout` — Clear JWT cookie
- `GET  /api/auth/me` — Return current user (requires cookie)
