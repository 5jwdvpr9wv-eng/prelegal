# ── Stage 1: Build Next.js frontend ─────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python/FastAPI backend ──────────────────────────────────────────
FROM python:3.12-slim
WORKDIR /app

RUN pip install uv --no-cache-dir

# Install Python dependencies (layer-cached when pyproject.toml unchanged)
COPY backend/pyproject.toml ./backend/pyproject.toml
RUN cd backend && uv sync --no-dev

# Copy application code and built frontend
COPY backend/ ./backend/
COPY --from=frontend-builder /build/out ./frontend/out

EXPOSE 8000

WORKDIR /app/backend
CMD [".venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
