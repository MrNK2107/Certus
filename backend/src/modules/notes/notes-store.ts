import { v4 as uuidv4 } from 'uuid';

export interface UnderwriterNote {
  noteId: string;
  caseId: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

class NotesStore {
  private store = new Map<string, UnderwriterNote[]>();

  addNote(caseId: string, note: Omit<UnderwriterNote, 'noteId' | 'caseId' | 'createdAt'>): UnderwriterNote {
    const entry: UnderwriterNote = {
      noteId: `NOTE-${uuidv4().substring(0, 8)}`,
      caseId,
      ...note,
      createdAt: new Date().toISOString(),
    };
    const existing = this.store.get(caseId) || [];
    existing.push(entry);
    this.store.set(caseId, existing);
    return entry;
  }

  getNotes(caseId: string): UnderwriterNote[] {
    const notes = this.store.get(caseId) || [];
    return [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export const notesStore = new NotesStore();
