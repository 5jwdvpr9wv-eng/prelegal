import json
import os
from typing import AsyncGenerator, List, Optional

from litellm import acompletion
from pydantic import BaseModel

from .documents import REGISTRY, make_fields_model

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

# ── Detection prompts ─────────────────────────────────────────────────────────

_DOC_LIST = "\n".join(
    f"- {config.name} (key: {key})" for key, config in REGISTRY.items()
)

DETECTION_SYSTEM_PROMPT = (
    "You are a professional legal assistant at Prelegal, a platform for creating standard legal documents. "
    "Your job is to understand what legal document the user needs and guide them to create it.\n\n"
    f"Available document types:\n{_DOC_LIST}\n\n"
    "Rules:\n"
    "- Be friendly and professional.\n"
    "- Help the user identify which of the available documents they need.\n"
    "- If the user's need doesn't clearly match an available document type, "
    "explain that you cannot generate that specific type and suggest the closest available alternative.\n"
    "- Once you understand what they need, confirm the document type and say you'll start gathering the details.\n"
    "- Keep responses concise (2-3 sentences max)."
)

_DOC_KEYS = "\n".join(f'  "{key}"' for key in REGISTRY)

DETECTION_EXTRACT_PROMPT = (
    "Given the following conversation, determine which document type the user wants to create.\n\n"
    "Return a JSON object with exactly one key: \"document_type\".\n"
    "Set it to one of these exact string values if the user's intent is clear:\n"
    f"{_DOC_KEYS}\n\n"
    "Set \"document_type\" to null if:\n"
    "- The user has not yet clearly stated what document they want, OR\n"
    "- The user wants a document type not in the list above.\n\n"
    "Return only the JSON object, nothing else."
)

GENERIC_GREETING = (
    "Hi! I'm here to help you draft legal agreements. "
    "I can create Mutual NDAs, Cloud Service Agreements, Pilot Agreements, "
    "Design Partner Agreements, and more. "
    "What kind of document do you need today?"
)

# Backward-compat alias used by tests
GREETING = GENERIC_GREETING


class DetectionResult(BaseModel):
    document_type: Optional[str] = None


class ChatMessage(BaseModel):
    role: str
    content: str


# Backward-compat export so existing tests can import NDAFields
NDAFields = make_fields_model(REGISTRY["mutual_nda"])


def get_greeting(document_type: Optional[str] = None) -> str:
    if document_type is not None:
        config = REGISTRY.get(document_type)
        if config:
            return config.greeting
    return GENERIC_GREETING


# ── Internal stream helpers ───────────────────────────────────────────────────

async def _stream_detecting(
    message: str,
    history: List[ChatMessage],
    api_key: Optional[str],
) -> AsyncGenerator[str, None]:
    """Handle the detecting phase: stream a response, then try to identify doc type."""
    messages = [{"role": "system", "content": DETECTION_SYSTEM_PROMPT}]
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": message})

    accumulated = ""
    stream = await acompletion(
        model=MODEL,
        messages=messages,
        stream=True,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
        api_key=api_key,
    )
    async for chunk in stream:
        text = chunk.choices[0].delta.content or ""
        if text:
            accumulated += text
            yield f"data: {json.dumps({'type': 'text', 'content': text})}\n\n"

    conversation_text = "\n".join(
        f"{m['role'].upper()}: {m['content']}"
        for m in messages + [{"role": "assistant", "content": accumulated}]
        if m["role"] != "system"
    )

    try:
        detect_resp = await acompletion(
            model=MODEL,
            messages=[
                {"role": "system", "content": DETECTION_EXTRACT_PROMPT},
                {"role": "user", "content": f"Conversation:\n\n{conversation_text}"},
            ],
            response_format=DetectionResult,
            reasoning_effort="low",
            extra_body=EXTRA_BODY,
            api_key=api_key,
        )
        result = DetectionResult.model_validate_json(detect_resp.choices[0].message.content)
        if result.document_type and result.document_type in REGISTRY:
            config = REGISTRY[result.document_type]
            yield f"data: {json.dumps({'type': 'detection', 'document_type': result.document_type, 'name': config.name})}\n\n"
    except Exception:
        pass  # No detection event — frontend stays in detecting phase
    finally:
        yield f"data: {json.dumps({'type': 'done'})}\n\n"


async def _stream_drafting(
    message: str,
    history: List[ChatMessage],
    doc_type: str,
    api_key: Optional[str],
) -> AsyncGenerator[str, None]:
    """Handle the drafting phase: stream a response, then extract fields."""
    config = REGISTRY.get(doc_type)
    if config is None:
        yield f"data: {json.dumps({'type': 'error', 'message': f'Unknown document type: {doc_type}'})}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
        return

    messages = [{"role": "system", "content": config.chat_system_prompt}]
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": message})

    accumulated = ""
    stream = await acompletion(
        model=MODEL,
        messages=messages,
        stream=True,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
        api_key=api_key,
    )
    async for chunk in stream:
        text = chunk.choices[0].delta.content or ""
        if text:
            accumulated += text
            yield f"data: {json.dumps({'type': 'text', 'content': text})}\n\n"

    conversation_text = "\n".join(
        f"{m['role'].upper()}: {m['content']}"
        for m in messages + [{"role": "assistant", "content": accumulated}]
        if m["role"] != "system"
    )

    try:
        FieldsModel = make_fields_model(config)
        fields_resp = await acompletion(
            model=MODEL,
            messages=[
                {"role": "system", "content": config.extract_system_prompt},
                {"role": "user", "content": f"Extract fields from this conversation:\n\n{conversation_text}"},
            ],
            response_format=FieldsModel,
            reasoning_effort="low",
            extra_body=EXTRA_BODY,
            api_key=api_key,
        )
        fields = FieldsModel.model_validate_json(fields_resp.choices[0].message.content)
        fields_dict = {k: (v if v is not None else "") for k, v in fields.model_dump().items()}
        yield f"data: {json.dumps({'type': 'fields', 'fields': fields_dict})}\n\n"
    except Exception:
        pass  # Skip fields update on extraction failure; preview stays unchanged
    finally:
        yield f"data: {json.dumps({'type': 'done'})}\n\n"


# ── Public API ────────────────────────────────────────────────────────────────

async def stream_chat(
    message: str,
    history: List[ChatMessage],
    document_type: Optional[str] = None,
) -> AsyncGenerator[str, None]:
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if document_type is None:
        async for event in _stream_detecting(message, history, api_key):
            yield event
    else:
        async for event in _stream_drafting(message, history, document_type, api_key):
            yield event
