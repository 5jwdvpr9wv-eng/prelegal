"""Tests for the AI chat endpoints and field extraction logic."""
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.chat import GREETING, NDAFields, get_greeting
from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        yield c


# ── Unit tests ────────────────────────────────────────────────────────────────


def test_get_greeting_returns_string():
    msg = get_greeting()
    assert isinstance(msg, str)
    assert len(msg) > 0


def test_nda_fields_defaults_to_none():
    fields = NDAFields()
    assert fields.party1Name is None
    assert fields.party2Name is None
    assert fields.effectiveDate is None


def test_nda_fields_accepts_values():
    fields = NDAFields(party1Name="Acme Corp", party2Name="Globex Inc")
    assert fields.party1Name == "Acme Corp"
    assert fields.party2Name == "Globex Inc"
    assert fields.purpose is None


def test_nda_fields_validate_json():
    payload = '{"party1Name": "Acme Corp", "party2Name": null, "party1Address": null, "party1Email": null, "party1SignatoryName": null, "party1SignatoryTitle": null, "party2Address": null, "party2Email": null, "party2SignatoryName": null, "party2SignatoryTitle": null, "purpose": null, "effectiveDate": null, "mndaTerm": null, "termOfConfidentiality": null, "governingLaw": null, "jurisdiction": null}'
    fields = NDAFields.model_validate_json(payload)
    assert fields.party1Name == "Acme Corp"
    assert fields.party2Name is None


# ── Endpoint: GET /api/chat/greeting ─────────────────────────────────────────


@pytest.mark.anyio
async def test_greeting_endpoint_returns_message(client):
    response = await client.get("/api/chat/greeting")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == GREETING


# ── Endpoint: POST /api/chat/message ─────────────────────────────────────────


def _make_text_chunk(content: str):
    """Build a mock litellm streaming chunk."""
    chunk = MagicMock()
    chunk.choices = [MagicMock()]
    chunk.choices[0].delta.content = content
    return chunk


def _make_fields_response(fields: dict):
    """Build a mock litellm structured-output response."""
    resp = MagicMock()
    resp.choices = [MagicMock()]
    resp.choices[0].message.content = json.dumps(fields)
    return resp


FULL_NDA_FIELDS = {
    "party1Name": "Acme Corp",
    "party1Address": None,
    "party1Email": None,
    "party1SignatoryName": None,
    "party1SignatoryTitle": None,
    "party2Name": None,
    "party2Address": None,
    "party2Email": None,
    "party2SignatoryName": None,
    "party2SignatoryTitle": None,
    "purpose": None,
    "effectiveDate": None,
    "mndaTerm": None,
    "termOfConfidentiality": None,
    "governingLaw": None,
    "jurisdiction": None,
}


@pytest.mark.anyio
async def test_chat_message_streams_text_and_fields(client):
    """Verify that /api/chat/message returns SSE with text chunks, fields, and done."""

    async def mock_stream():
        for chunk in [_make_text_chunk("Great, "), _make_text_chunk("noted!")]:
            yield chunk

    with (
        patch("app.chat.acompletion") as mock_completion,
    ):
        # First call (streaming): async generator
        stream_mock = AsyncMock()
        stream_mock.__aiter__ = lambda self: mock_stream()
        mock_completion.side_effect = [
            stream_mock,  # streaming chat call
            _make_fields_response(FULL_NDA_FIELDS),  # field extraction call
        ]

        response = await client.post(
            "/api/chat/message",
            json={
                "message": "Acme Corp",
                "history": [
                    {"role": "assistant", "content": "What is the first party name?"}
                ],
            },
        )

    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]

    events = []
    for line in response.text.strip().split("\n\n"):
        line = line.strip()
        if line.startswith("data: "):
            events.append(json.loads(line[6:]))

    text_events = [e for e in events if e["type"] == "text"]
    fields_events = [e for e in events if e["type"] == "fields"]
    done_events = [e for e in events if e["type"] == "done"]

    assert len(text_events) >= 1
    full_text = "".join(e["content"] for e in text_events)
    assert "Great" in full_text

    assert len(fields_events) == 1
    assert fields_events[0]["fields"]["party1Name"] == "Acme Corp"

    assert len(done_events) == 1


@pytest.mark.anyio
async def test_chat_message_empty_history(client):
    """Chat endpoint accepts an empty history list."""

    async def mock_stream():
        yield _make_text_chunk("Hello!")

    with patch("app.chat.acompletion") as mock_completion:
        stream_mock = AsyncMock()
        stream_mock.__aiter__ = lambda self: mock_stream()
        mock_completion.side_effect = [
            stream_mock,
            _make_fields_response(
                {k: None for k in NDAFields.model_fields}
            ),
        ]

        response = await client.post(
            "/api/chat/message",
            json={"message": "Hi", "history": []},
        )

    assert response.status_code == 200


@pytest.mark.anyio
async def test_chat_message_requires_message_field(client):
    """Sending without the 'message' field returns a 422 validation error."""
    response = await client.post(
        "/api/chat/message",
        json={"history": []},
    )
    assert response.status_code == 422
