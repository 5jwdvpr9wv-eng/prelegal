"use client";

import { useEffect, useState } from "react";

interface SavedDoc {
  id: number;
  name: string;
  document_type: string;
  created_at: string;
  updated_at: string;
}

interface SavedDocWithFields extends SavedDoc {
  form_data: Record<string, string>;
}

interface MyDocumentsModalProps {
  onClose: () => void;
  onLoad: (doc: SavedDocWithFields) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DocTypeLabel({ docType }: { docType: string }) {
  const label = docType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className="text-[10px] text-slate-400 font-sans">{label}</span>
  );
}

export function MyDocumentsModal({ onClose, onLoad }: MyDocumentsModalProps) {
  const [docs, setDocs] = useState<SavedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/documents")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setDocs)
      .catch(() => setError("Failed to load documents."))
      .finally(() => setLoading(false));
  }, []);

  const handleLoad = async (doc: SavedDoc) => {
    setLoadingId(doc.id);
    try {
      const r = await fetch(`/api/documents/${doc.id}`);
      if (!r.ok) throw new Error();
      const full: SavedDocWithFields = await r.json();
      onLoad(full);
    } catch {
      setError("Failed to load document.");
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const r = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(`Delete failed: ${r.status}`);
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError("Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-paper w-full max-w-md mx-4 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule flex-none">
          <h2 className="font-serif text-[18px] font-bold text-navy">
            My Documents
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-ink transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <p className="text-[13px] text-slate-400">Loading…</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center justify-center py-12">
              <p className="text-[13px] text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && docs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <p className="text-[13px] text-slate-400 leading-relaxed">
                No saved documents yet. Complete a document and click{" "}
                <span className="font-medium text-ink">Save</span> to store it
                here.
              </p>
            </div>
          )}

          {!loading && docs.length > 0 && (
            <ul className="divide-y divide-rule">
              {docs.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink truncate">
                      {doc.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <DocTypeLabel docType={doc.document_type} />
                      <span className="text-[10px] text-slate-300">·</span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(doc.updated_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-none">
                    <button
                      onClick={() => handleLoad(doc)}
                      disabled={loadingId === doc.id}
                      className="text-[12px] font-medium text-gold hover:text-gold-hover transition-colors disabled:opacity-50"
                    >
                      {loadingId === doc.id ? "Loading…" : "Load"}
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="text-[12px] text-slate-300 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {deletingId === doc.id ? "…" : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
