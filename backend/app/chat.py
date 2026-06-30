import json
import os
from typing import AsyncGenerator, List, Optional

from litellm import acompletion
from pydantic import BaseModel

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

CHAT_SYSTEM_PROMPT = """You are a professional legal assistant helping a user create a Mutual Non-Disclosure Agreement (NDA). Your job is to gather the necessary information through friendly, conversational questions.

Rules:
- Ask about one thing at a time. Never ask multiple questions in one message.
- Keep responses concise (2-3 sentences max). Be professional but approachable.
- Do not mention technical field names like "party1Name" or "effectiveDate" — use natural language.
- When you have all required fields, confirm the key details clearly and tell the user their document is ready to download.

Required fields to collect (in a natural conversational order):
1. Legal name of Party 1 (the user's company or themselves)
2. Legal name of Party 2 (the other party)
3. Purpose of the NDA (what confidential information will be used for)
4. Effective date (when the agreement starts)
5. MNDA term (how long the agreement lasts, e.g. "2 years from the Effective Date")
6. Term of confidentiality (how long confidentiality obligations last after the agreement ends, e.g. "3 years following expiration or termination")
7. Governing law (US state whose laws govern the agreement)
8. Jurisdiction (city and state for courts, e.g. "Wilmington, Delaware")

Optional fields (ask after getting the required party name, but don't dwell on them):
- For each party: postal address, email for notices, signatory name and title

Suggested flow: start with Party 1 name → Party 2 name → purpose → effective date → term → confidentiality period → governing law → jurisdiction. Then optionally ask about signatories."""

EXTRACT_SYSTEM_PROMPT = """You are a data extraction assistant. Given a conversation about creating a Mutual NDA, extract any field values that have been clearly stated.

Return a JSON object with exactly these keys. Use null for fields not yet mentioned or unclear:
{
  "party1Name": "Legal name of first party, or null",
  "party1Address": "Postal address of first party, or null",
  "party1Email": "Email of first party, or null",
  "party1SignatoryName": "Name of person signing for party 1, or null",
  "party1SignatoryTitle": "Title of person signing for party 1, or null",
  "party2Name": "Legal name of second party, or null",
  "party2Address": "Postal address of second party, or null",
  "party2Email": "Email of second party, or null",
  "party2SignatoryName": "Name of person signing for party 2, or null",
  "party2SignatoryTitle": "Title of person signing for party 2, or null",
  "purpose": "Purpose of the NDA — what confidential information will be used for, or null",
  "effectiveDate": "Effective date in YYYY-MM-DD format, or null",
  "mndaTerm": "Duration of agreement e.g. '2 years from Effective Date', or null",
  "termOfConfidentiality": "Confidentiality period after termination e.g. '3 years following expiration or termination', or null",
  "governingLaw": "US state name only e.g. 'Delaware', or null",
  "jurisdiction": "City and state for courts e.g. 'Wilmington, Delaware', or null"
}

Rules:
- Extract only values explicitly stated in the conversation. Do not guess or infer.
- For effectiveDate, convert any mentioned date to YYYY-MM-DD format.
- For governingLaw, use only the state name (e.g. "California", not "the State of California").
- Return the full JSON object every time — include all keys even if null."""


class NDAFields(BaseModel):
    party1Name: Optional[str] = None
    party1Address: Optional[str] = None
    party1Email: Optional[str] = None
    party1SignatoryName: Optional[str] = None
    party1SignatoryTitle: Optional[str] = None
    party2Name: Optional[str] = None
    party2Address: Optional[str] = None
    party2Email: Optional[str] = None
    party2SignatoryName: Optional[str] = None
    party2SignatoryTitle: Optional[str] = None
    purpose: Optional[str] = None
    effectiveDate: Optional[str] = None
    mndaTerm: Optional[str] = None
    termOfConfidentiality: Optional[str] = None
    governingLaw: Optional[str] = None
    jurisdiction: Optional[str] = None


class ChatMessage(BaseModel):
    role: str
    content: str


GREETING = (
    "Hi! I'm here to help you create a Mutual Non-Disclosure Agreement. "
    "Let's start with the basics — what's the full legal name of the first party "
    "(that's your company, or your own name if you're an individual)?"
)


def get_greeting() -> str:
    return GREETING


async def stream_chat(
    message: str, history: List[ChatMessage]
) -> AsyncGenerator[str, None]:
    api_key = os.environ.get("OPENROUTER_API_KEY")

    # Build the full message list for the chat model
    messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": message})

    # Stream the conversational response
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

    # Build conversation text for field extraction (excludes system prompt)
    all_messages = messages + [{"role": "assistant", "content": accumulated}]
    conversation_text = "\n".join(
        f"{m['role'].upper()}: {m['content']}"
        for m in all_messages
        if m["role"] != "system"
    )

    # Run structured-output extraction — field updates are best-effort; the
    # done event is always emitted so the frontend is never left locked.
    try:
        fields_resp = await acompletion(
            model=MODEL,
            messages=[
                {"role": "system", "content": EXTRACT_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Extract NDA fields from this conversation:\n\n{conversation_text}",
                },
            ],
            response_format=NDAFields,
            reasoning_effort="low",
            extra_body=EXTRA_BODY,
            api_key=api_key,
        )
        fields = NDAFields.model_validate_json(fields_resp.choices[0].message.content)
        fields_dict = {k: (v if v is not None else "") for k, v in fields.model_dump().items()}
        yield f"data: {json.dumps({'type': 'fields', 'fields': fields_dict})}\n\n"
    except Exception:
        pass  # Skip fields update on extraction failure; preview stays unchanged
    finally:
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
