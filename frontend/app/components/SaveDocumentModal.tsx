"use client";

import { useEffect, useRef, useState } from "react";

interface SaveDocumentModalProps {
  defaultName: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

export function SaveDocumentModal({
  defaultName,
  onClose,
  onSave,
}: SaveDocumentModalProps) {
  const [name, setName] = useState(defaultName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onSave(name.trim());
    } catch {
      setError("Failed to save. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-paper w-full max-w-xs mx-4 p-6">
        <h3 className="font-serif text-[17px] font-bold text-navy mb-4">
          Name your document
        </h3>

        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") onClose();
          }}
          placeholder="e.g. Acme-Globex NDA 2026"
          className="form-input mb-4"
        />

        {error && (
          <p className="text-[12px] text-red-500 mb-3">{error}</p>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-slate-400 hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="px-4 py-2 text-[13px] font-semibold bg-navy text-white rounded-md disabled:opacity-50 hover:bg-navy/90 transition-colors"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
