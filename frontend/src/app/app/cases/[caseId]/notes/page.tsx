'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiFetchAll, apiPost } from '@/lib/api';

interface Note {
  noteId: string;
  caseId: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetchAll<Note>(`/notes/${caseId}`).then((data) => {
      setNotes(data);
      setLoading(false);
    });
  }, [caseId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    const newNote = await apiPost<Note>(`/notes/${caseId}`, { content: content.trim() });
    if (newNote) {
      setNotes((prev) => [newNote, ...prev]);
      setContent('');
    }
  }

  return (
    <div>
      <h1>Notes</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="note-content">Add a note</label>
          <textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </div>
        <button type="submit" disabled={!content.trim()}>Add Note</button>
      </form>

      <div>
        {loading ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p>No notes yet.</p>
        ) : (
          notes.map((note) => (
            <div key={note.noteId}>
              <strong>{note.author}</strong> — {new Date(note.createdAt).toLocaleDateString()}
              <p>{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
