"""Tests for document CRUD endpoints."""
import pytest


@pytest.fixture
async def auth_client(client):
    """Client that has signed up and has a valid session cookie."""
    await client.post(
        "/api/auth/signup",
        json={"email": "user@test.com", "password": "password"},
    )
    return client


SAMPLE_DOC = {
    "name": "Acme-Globex NDA",
    "document_type": "mutual_nda",
    "form_data": {"party1Name": "Acme Corp", "party2Name": "Globex Inc"},
}


# ── Auth guard ────────────────────────────────────────────────────────────────


@pytest.mark.anyio
async def test_list_documents_requires_auth(client):
    r = await client.get("/api/documents")
    assert r.status_code == 401


@pytest.mark.anyio
async def test_create_document_requires_auth(client):
    r = await client.post("/api/documents", json=SAMPLE_DOC)
    assert r.status_code == 401


@pytest.mark.anyio
async def test_get_document_requires_auth(client):
    r = await client.get("/api/documents/1")
    assert r.status_code == 401


@pytest.mark.anyio
async def test_update_document_requires_auth(client):
    r = await client.put("/api/documents/1", json={"name": "New Name"})
    assert r.status_code == 401


@pytest.mark.anyio
async def test_delete_document_requires_auth(client):
    r = await client.delete("/api/documents/1")
    assert r.status_code == 401


# ── Create ────────────────────────────────────────────────────────────────────


@pytest.mark.anyio
async def test_create_document_returns_201(auth_client):
    r = await auth_client.post("/api/documents", json=SAMPLE_DOC)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Acme-Globex NDA"
    assert data["document_type"] == "mutual_nda"
    assert data["form_data"]["party1Name"] == "Acme Corp"
    assert "id" in data
    assert "created_at" in data


# ── List ──────────────────────────────────────────────────────────────────────


@pytest.mark.anyio
async def test_list_documents_returns_empty_initially(auth_client):
    r = await auth_client.get("/api/documents")
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.anyio
async def test_list_documents_after_create(auth_client):
    await auth_client.post("/api/documents", json=SAMPLE_DOC)
    r = await auth_client.get("/api/documents")
    assert r.status_code == 200
    docs = r.json()
    assert len(docs) == 1
    assert docs[0]["name"] == "Acme-Globex NDA"
    assert "form_data" not in docs[0]


@pytest.mark.anyio
async def test_list_documents_ordered_by_updated_at_desc(auth_client):
    await auth_client.post(
        "/api/documents",
        json={**SAMPLE_DOC, "name": "First"},
    )
    await auth_client.post(
        "/api/documents",
        json={**SAMPLE_DOC, "name": "Second"},
    )
    r = await auth_client.get("/api/documents")
    docs = r.json()
    assert docs[0]["name"] == "Second"
    assert docs[1]["name"] == "First"


# ── Get ───────────────────────────────────────────────────────────────────────


@pytest.mark.anyio
async def test_get_document_returns_form_data(auth_client):
    create_r = await auth_client.post("/api/documents", json=SAMPLE_DOC)
    doc_id = create_r.json()["id"]

    r = await auth_client.get(f"/api/documents/{doc_id}")
    assert r.status_code == 200
    assert r.json()["form_data"]["party2Name"] == "Globex Inc"


@pytest.mark.anyio
async def test_get_document_404_for_nonexistent(auth_client):
    r = await auth_client.get("/api/documents/9999")
    assert r.status_code == 404


@pytest.mark.anyio
async def test_get_document_404_for_other_users_doc(client):
    """User A cannot access User B's document."""
    await client.post(
        "/api/auth/signup", json={"email": "a@test.com", "password": "pw"}
    )
    create_r = await client.post("/api/documents", json=SAMPLE_DOC)
    doc_id = create_r.json()["id"]

    await client.post("/api/auth/signout")
    await client.post(
        "/api/auth/signup", json={"email": "b@test.com", "password": "pw"}
    )

    r = await client.get(f"/api/documents/{doc_id}")
    assert r.status_code == 404


# ── Update ────────────────────────────────────────────────────────────────────


@pytest.mark.anyio
async def test_update_document_name(auth_client):
    create_r = await auth_client.post("/api/documents", json=SAMPLE_DOC)
    doc_id = create_r.json()["id"]

    r = await auth_client.put(f"/api/documents/{doc_id}", json={"name": "Updated Name"})
    assert r.status_code == 200
    assert r.json()["name"] == "Updated Name"


@pytest.mark.anyio
async def test_update_document_form_data(auth_client):
    create_r = await auth_client.post("/api/documents", json=SAMPLE_DOC)
    doc_id = create_r.json()["id"]

    new_fields = {"party1Name": "New Corp", "party2Name": "Other Inc"}
    r = await auth_client.put(f"/api/documents/{doc_id}", json={"form_data": new_fields})
    assert r.status_code == 200
    assert r.json()["form_data"]["party1Name"] == "New Corp"


@pytest.mark.anyio
async def test_update_document_404_for_nonexistent(auth_client):
    r = await auth_client.put("/api/documents/9999", json={"name": "x"})
    assert r.status_code == 404


# ── Delete ────────────────────────────────────────────────────────────────────


@pytest.mark.anyio
async def test_delete_document_returns_204(auth_client):
    create_r = await auth_client.post("/api/documents", json=SAMPLE_DOC)
    doc_id = create_r.json()["id"]

    r = await auth_client.delete(f"/api/documents/{doc_id}")
    assert r.status_code == 204

    r2 = await auth_client.get(f"/api/documents/{doc_id}")
    assert r2.status_code == 404


@pytest.mark.anyio
async def test_delete_document_404_for_nonexistent(auth_client):
    r = await auth_client.delete("/api/documents/9999")
    assert r.status_code == 404
