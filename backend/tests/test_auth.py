"""Tests for authentication endpoints."""
import pytest


# ── Sign up ───────────────────────────────────────────────────────────────────


@pytest.mark.anyio
async def test_signup_creates_user(client):
    r = await client.post(
        "/api/auth/signup", json={"email": "alice@test.com", "password": "secret"}
    )
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == "alice@test.com"
    assert "id" in data
    assert "access_token" in r.cookies


@pytest.mark.anyio
async def test_signup_duplicate_email_returns_400(client):
    payload = {"email": "dup@test.com", "password": "secret"}
    await client.post("/api/auth/signup", json=payload)
    r = await client.post("/api/auth/signup", json=payload)
    assert r.status_code == 400
    assert "already registered" in r.json()["detail"].lower()


# ── Sign in ───────────────────────────────────────────────────────────────────


@pytest.mark.anyio
async def test_signin_returns_cookie(client):
    await client.post(
        "/api/auth/signup", json={"email": "bob@test.com", "password": "pass123"}
    )
    r = await client.post(
        "/api/auth/signin", json={"email": "bob@test.com", "password": "pass123"}
    )
    assert r.status_code == 200
    assert "access_token" in r.cookies


@pytest.mark.anyio
async def test_signin_wrong_password_returns_401(client):
    await client.post(
        "/api/auth/signup", json={"email": "carol@test.com", "password": "correct"}
    )
    r = await client.post(
        "/api/auth/signin", json={"email": "carol@test.com", "password": "wrong"}
    )
    assert r.status_code == 401


@pytest.mark.anyio
async def test_signin_unknown_email_returns_401(client):
    r = await client.post(
        "/api/auth/signin", json={"email": "nobody@test.com", "password": "x"}
    )
    assert r.status_code == 401


# ── Sign out ──────────────────────────────────────────────────────────────────


@pytest.mark.anyio
async def test_signout_clears_cookie(client):
    await client.post(
        "/api/auth/signup", json={"email": "dave@test.com", "password": "pw"}
    )
    r = await client.post("/api/auth/signout")
    assert r.status_code == 200
    assert "access_token" not in r.cookies or r.cookies.get("access_token") == ""


# ── Me ────────────────────────────────────────────────────────────────────────


@pytest.mark.anyio
async def test_me_returns_user_when_authenticated(client):
    await client.post(
        "/api/auth/signup", json={"email": "eve@test.com", "password": "pw"}
    )
    r = await client.get("/api/auth/me")
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == "eve@test.com"
    assert "id" in data


@pytest.mark.anyio
async def test_me_returns_401_when_unauthenticated(client):
    r = await client.get("/api/auth/me")
    assert r.status_code == 401
