import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel

from .database import get_db
from .deps import get_current_user

router = APIRouter()


class DocumentCreate(BaseModel):
    name: str
    document_type: str
    form_data: dict[str, str]


class DocumentUpdate(BaseModel):
    name: Optional[str] = None
    form_data: Optional[dict[str, str]] = None


def _row_to_doc(row) -> dict:
    doc = dict(row)
    doc["form_data"] = json.loads(doc["form_data"])
    return doc


@router.get("/api/documents")
async def list_documents(user: dict = Depends(get_current_user)):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, name, document_type, created_at, updated_at "
            "FROM documents WHERE user_id = ? ORDER BY updated_at DESC, id DESC",
            (user["id"],),
        ).fetchall()
    return [dict(row) for row in rows]


@router.post("/api/documents", status_code=201)
async def create_document(req: DocumentCreate, user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.execute(
            "INSERT INTO documents (user_id, name, document_type, form_data) VALUES (?, ?, ?, ?)",
            (user["id"], req.name, req.document_type, json.dumps(req.form_data)),
        )
        conn.commit()
        row = conn.execute(
            "SELECT id, name, document_type, form_data, created_at, updated_at "
            "FROM documents WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()
    return _row_to_doc(row)


@router.get("/api/documents/{doc_id}")
async def get_document(doc_id: int, user: dict = Depends(get_current_user)):
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, name, document_type, form_data, created_at, updated_at "
            "FROM documents WHERE id = ? AND user_id = ?",
            (doc_id, user["id"]),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    return _row_to_doc(row)


@router.put("/api/documents/{doc_id}")
async def update_document(
    doc_id: int, req: DocumentUpdate, user: dict = Depends(get_current_user)
):
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, name, form_data FROM documents WHERE id = ? AND user_id = ?",
            (doc_id, user["id"]),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Document not found")

        new_name = req.name if req.name is not None else row["name"]
        new_form_data = (
            json.dumps(req.form_data) if req.form_data is not None else row["form_data"]
        )

        conn.execute(
            "UPDATE documents SET name=?, form_data=?, updated_at=datetime('now') "
            "WHERE id=? AND user_id=?",
            (new_name, new_form_data, doc_id, user["id"]),
        )
        conn.commit()
        updated = conn.execute(
            "SELECT id, name, document_type, form_data, created_at, updated_at "
            "FROM documents WHERE id=?",
            (doc_id,),
        ).fetchone()
    return _row_to_doc(updated)


@router.delete("/api/documents/{doc_id}", status_code=204)
async def delete_document(doc_id: int, user: dict = Depends(get_current_user)):
    with get_db() as conn:
        row = conn.execute(
            "SELECT id FROM documents WHERE id = ? AND user_id = ?",
            (doc_id, user["id"]),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Document not found")
        conn.execute(
            "DELETE FROM documents WHERE id = ? AND user_id = ?",
            (doc_id, user["id"]),
        )
        conn.commit()
    return Response(status_code=204)
