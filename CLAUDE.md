# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation (PL-5) adds an AI chat interface for Mutual NDA creation on top of the PL-4 technical foundation. Additional document types and document persistence are planned for future tickets.

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
- AI chat replaces the manual form in the left panel; NDA preview and PDF generation unchanged
- LiteLLM via OpenRouter with Cerebras inference (`gpt-oss-120b`); structured-output field extraction
- Streaming SSE: text tokens stream as the AI types; field extraction fires after each response
- Live NDA preview updates as fields are extracted from the conversation
- Download PDF button appears once all 8 required fields are populated
- Backend: `backend/app/chat.py` (chat logic), 8 integration tests in `backend/tests/`
- Resilience: extraction wrapped in `try/finally` (backend) and `sendMessage` uses `try/catch/finally` (frontend) so the UI never gets permanently locked on API failures

### Not yet built (upcoming tickets)
- **PL-6**: Support for all 11 document types from catalog.json
- **PL-7**: Frontend auth UI, document persistence, My Documents, user menu

### Current API Endpoints
- `GET  /api/health` — Health check
- `GET  /api/chat/greeting` — Returns AI greeting message
- `POST /api/chat/message` — Streaming SSE chat: `{message, history}` → text chunks + fields + done
- `POST /api/auth/signup` — Create account (sets JWT cookie)
- `POST /api/auth/signin` — Sign in (sets JWT cookie)
- `POST /api/auth/signout` — Clear JWT cookie
- `GET  /api/auth/me` — Return current user (requires cookie)
