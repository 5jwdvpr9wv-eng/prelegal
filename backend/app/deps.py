from fastapi import HTTPException, Request
from jose import JWTError

from .auth import decode_token


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(token)
        return {"id": int(payload["sub"]), "email": payload["email"]}
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")
