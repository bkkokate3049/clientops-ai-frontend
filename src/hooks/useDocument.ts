import { useState, useEffect, useCallback } from 'react';
import type { DocItem } from '../types/chat';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useDocuments() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDocs = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/documents`);
      if (!res.ok) throw new Error('Failed to load documents');
      const data = await res.json();
      setDocs(data.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach backend');
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    fetch(`${API_BASE}/documents`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load documents');
        return res.json();
      })
      .then((data) => {
        if (!ignore) setDocs(data.documents || []);
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Unable to reach backend');
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/ingest/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      await refreshDocs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteDoc = async (sourceName: string) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/documents/${encodeURIComponent(sourceName)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      await refreshDocs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return { docs, uploading, error, uploadFile, deleteDoc };
}
