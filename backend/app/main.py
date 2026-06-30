import os
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from jose import JWTError
from pydantic import BaseModel

from .auth import create_token, decode_token, hash_password, verify_password
from .chat import ChatMessage, get_greeting, stream_chat
from .database import get_db, init_db
from .documents import REGISTRY


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)


class AuthRequest(BaseModel):
    email: str
    password: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    document_type: Optional[str] = None


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/catalog")
async def get_catalog():
    return [
        {
            "doc_type": key,
            "name": config.name,
            "template_file": config.template_file,
            "required_field_count": len(config.required_field_keys),
        }
        for key, config in REGISTRY.items()
    ]


@app.get("/api/chat/greeting")
async def chat_greeting(document_type: Optional[str] = None):
    return {"message": get_greeting(document_type)}


@app.post("/api/chat/message")
async def chat_message(req: ChatRequest):
    return StreamingResponse(
        stream_chat(req.message, req.history, req.document_type),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/api/auth/signup")
async def signup(req: AuthRequest, response: Response):
    with get_db() as conn:
        if conn.execute("SELECT id FROM users WHERE email = ?", (req.email,)).fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        cursor = conn.execute(
            "INSERT INTO users (email, hashed_password) VALUES (?, ?)",
            (req.email, hash_password(req.password)),
        )
        conn.commit()
        user_id = cursor.lastrowid

    token = create_token(user_id, req.email)
    response.set_cookie(
        "access_token", token, httponly=True, samesite="lax",
        max_age=7 * 86400,
    )
    return {"email": req.email}


@app.post("/api/auth/signin")
async def signin(req: AuthRequest, response: Response):
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, email, hashed_password FROM users WHERE email = ?", (req.email,)
        ).fetchone()

    if not row or not verify_password(req.password, row["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(row["id"], row["email"])
    response.set_cookie(
        "access_token", token, httponly=True, samesite="lax",
        max_age=7 * 86400,
    )
    return {"email": row["email"]}


@app.post("/api/auth/signout")
async def signout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Signed out"}


@app.get("/api/auth/me")
async def me(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(token)
        return {"id": int(payload["sub"]), "email": payload["email"]}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# Serve the static Next.js export — must be mounted after all API routes
_frontend_dir = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "out")
)
if os.path.isdir(_frontend_dir):
    app.mount("/", StaticFiles(directory=_frontend_dir, html=True), name="frontend")
