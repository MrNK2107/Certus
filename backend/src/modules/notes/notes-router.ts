import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuditActionType } from '../../shared';
import { notesStore } from './notes-store';
import { auditStore } from '../audit/audit-store';
import { wrapAsync, AppError } from '../../middleware';

const router = Router();

router.get('/:caseId', wrapAsync(async (req: Request, res: Response) => {
  const notes = notesStore.getNotes(req.params.caseId);
  res.json(notes);
}));

router.post('/:caseId', wrapAsync(async (req: Request, res: Response) => {
  const { caseId } = req.params;
  const { content } = req.body as { content?: string };
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'content is required');
  }
  const author = (req.headers['x-user'] as string) || 'System';
  const note = notesStore.addNote(caseId, { author, content });
  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    caseId,
    actor: author,
    action: AuditActionType.NOTE_ADDED,
    objectType: 'UnderwriterNote',
    objectId: note.noteId,
    timestamp: note.createdAt,
    requestId: req.requestId,
    versionContext: {},
  });
  res.status(201).json(note);
}));

export default router;
