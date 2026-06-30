"""Tests for the AI chat endpoints and field extraction logic."""
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.chat import GENERIC_GREETING, GREETING, NDAFields, get_greeting
from app.documents import REGISTRY
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


def test_get_greeting_with_doc_type_returns_specific_greeting():
    msg = get_greeting("pilot")
    assert "Pilot" in msg


def test_get_greeting_with_unknown_doc_type_returns_generic():
    msg = get_greeting("nonexistent_type")
    assert msg == GENERIC_GREETING


def test_greeting_backward_compat_alias():
    assert GREETING == GENERIC_GREETING


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


def test_registry_has_all_expected_doc_types():
    expected = {
        "mutual_nda", "mutual_nda_coverpage", "cloud_service_agreement",
        "design_partner", "sla", "professional_services", "data_processing",
        "software_license", "partnership", "pilot", "business_associate", "ai_addendum",
    }
    assert expected.issubset(set(REGISTRY.keys()))


def test_registry_configs_have_required_attributes():
    for key, config in REGISTRY.items():
        assert config.name, f"{key} missing name"
        assert config.fields, f"{key} missing fields"
        assert config.required_field_keys, f"{key} missing required_field_keys"
        assert config.greeting, f"{key} missing greeting"
        assert config.chat_system_prompt, f"{key} missing chat_system_prompt"
        assert config.extract_system_prompt, f"{key} missing extract_system_prompt"
        for rk in config.required_field_keys:
            field_keys = {f.key for f in config.fields}
            assert rk in field_keys, f"{key}: required key '{rk}' not in fields"


# ── Endpoint: GET /api/catalog ────────────────────────────────────────────────


@pytest.mark.anyio
async def test_catalog_endpoint_returns_all_types(client):
    response = await client.get("/api/catalog")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    doc_types = {item["doc_type"] for item in data}
    assert "mutual_nda" in doc_types
    assert "pilot" in doc_types
    assert "ai_addendum" in doc_types
    assert len(data) == len(REGISTRY)


# ── Endpoint: GET /api/chat/greeting ─────────────────────────────────────────


@pytest.mark.anyio
async def test_greeting_endpoint_returns_message(client):
    response = await client.get("/api/chat/greeting")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == GENERIC_GREETING


@pytest.mark.anyio
async def test_greeting_endpoint_with_doc_type(client):
    response = await client.get("/api/chat/greeting?document_type=pilot")
    assert response.status_code == 200
    data = response.json()
    assert "Pilot" in data["message"]


# ── Endpoint: POST /api/chat/message ─────────────────────────────────────────


def _make_text_chunk(content: str):
    chunk = MagicMock()
    chunk.choices = [MagicMock()]
    chunk.choices[0].delta.content = content
    return chunk


def _make_fields_response(fields: dict):
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
    """Verify /api/chat/message returns SSE with text chunks, fields, and done (NDA drafting mode)."""

    async def mock_stream():
        for chunk in [_make_text_chunk("Great, "), _make_text_chunk("noted!")]:
            yield chunk

    with patch("app.chat.acompletion") as mock_completion:
        stream_mock = AsyncMock()
        stream_mock.__aiter__ = lambda self: mock_stream()
        mock_completion.side_effect = [
            stream_mock,
            _make_fields_response(FULL_NDA_FIELDS),
        ]

        response = await client.post(
            "/api/chat/message",
            json={
                "message": "Acme Corp",
                "history": [{"role": "assistant", "content": "What is the first party name?"}],
                "document_type": "mutual_nda",
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
    async def mock_stream():
        yield _make_text_chunk("Hello!")

    with patch("app.chat.acompletion") as mock_completion:
        stream_mock = AsyncMock()
        stream_mock.__aiter__ = lambda self: mock_stream()
        mock_completion.side_effect = [
            stream_mock,
            _make_fields_response({k: None for k in NDAFields.model_fields}),
        ]

        response = await client.post(
            "/api/chat/message",
            json={"message": "Hi", "history": [], "document_type": "mutual_nda"},
        )

    assert response.status_code == 200


@pytest.mark.anyio
async def test_chat_message_requires_message_field(client):
    response = await client.post("/api/chat/message", json={"history": []})
    assert response.status_code == 422


@pytest.mark.anyio
async def test_chat_message_detection_mode_emits_detection_event(client):
    """Without document_type, AI should detect doc type and emit detection event."""

    async def mock_stream():
        yield _make_text_chunk("I can help you with a Pilot Agreement!")

    with patch("app.chat.acompletion") as mock_completion:
        stream_mock = AsyncMock()
        stream_mock.__aiter__ = lambda self: mock_stream()
        mock_completion.side_effect = [
            stream_mock,
            _make_fields_response({"document_type": "pilot"}),
        ]

        response = await client.post(
            "/api/chat/message",
            json={"message": "I need a pilot agreement", "history": []},
        )

    assert response.status_code == 200
    events = []
    for line in response.text.strip().split("\n\n"):
        line = line.strip()
        if line.startswith("data: "):
            events.append(json.loads(line[6:]))

    detection_events = [e for e in events if e["type"] == "detection"]
    done_events = [e for e in events if e["type"] == "done"]

    assert len(detection_events) == 1
    assert detection_events[0]["document_type"] == "pilot"
    assert detection_events[0]["name"] == REGISTRY["pilot"].name
    assert len(done_events) == 1


@pytest.mark.anyio
async def test_chat_message_detection_mode_no_event_when_unclear(client):
    """When AI can't determine doc type, no detection event is emitted."""

    async def mock_stream():
        yield _make_text_chunk("What kind of document do you need?")

    with patch("app.chat.acompletion") as mock_completion:
        stream_mock = AsyncMock()
        stream_mock.__aiter__ = lambda self: mock_stream()
        mock_completion.side_effect = [
            stream_mock,
            _make_fields_response({"document_type": None}),
        ]

        response = await client.post(
            "/api/chat/message",
            json={"message": "Hello", "history": []},
        )

    assert response.status_code == 200
    events = []
    for line in response.text.strip().split("\n\n"):
        line = line.strip()
        if line.startswith("data: "):
            events.append(json.loads(line[6:]))

    detection_events = [e for e in events if e["type"] == "detection"]
    done_events = [e for e in events if e["type"] == "done"]

    assert len(detection_events) == 0
    assert len(done_events) == 1


@pytest.mark.anyio
async def test_chat_message_unknown_doc_type_returns_error(client):
    response = await client.post(
        "/api/chat/message",
        json={"message": "Hello", "history": [], "document_type": "not_a_real_type"},
    )
    assert response.status_code == 200
    events = []
    for line in response.text.strip().split("\n\n"):
        line = line.strip()
        if line.startswith("data: "):
            events.append(json.loads(line[6:]))

    error_events = [e for e in events if e["type"] == "error"]
    done_events = [e for e in events if e["type"] == "done"]

    assert len(error_events) == 1
    assert len(done_events) == 1


@pytest.mark.anyio
async def test_chat_message_pilot_doc_type_emits_pilot_fields(client):
    """Drafting mode works for non-NDA doc types."""
    pilot_fields = {f.key: None for f in REGISTRY["pilot"].fields}
    pilot_fields["providerName"] = "Acme Inc."

    async def mock_stream():
        yield _make_text_chunk("Great, Acme Inc. it is!")

    with patch("app.chat.acompletion") as mock_completion:
        stream_mock = AsyncMock()
        stream_mock.__aiter__ = lambda self: mock_stream()
        mock_completion.side_effect = [
            stream_mock,
            _make_fields_response(pilot_fields),
        ]

        response = await client.post(
            "/api/chat/message",
            json={
                "message": "Acme Inc.",
                "history": [{"role": "assistant", "content": "What is the provider name?"}],
                "document_type": "pilot",
            },
        )

    assert response.status_code == 200
    events = []
    for line in response.text.strip().split("\n\n"):
        line = line.strip()
        if line.startswith("data: "):
            events.append(json.loads(line[6:]))

    fields_events = [e for e in events if e["type"] == "fields"]
    assert len(fields_events) == 1
    assert fields_events[0]["fields"]["providerName"] == "Acme Inc."
