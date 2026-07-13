import { SourceType, SourceLinkStatus, FetchStatus } from './enums';

export interface SourceConnection {
  sourceLinkId: string;
  caseId: string;
  sourceType: SourceType;
  status: SourceLinkStatus;
  lastSyncedAt?: string;
  freshness?: number;
  quality?: number;
  errorCode?: string;
}

export interface SourceFetch {
  fetchId: string;
  caseId: string;
  sourceType: SourceType;
  status: FetchStatus;
  startedAt: string;
  completedAt?: string;
  retryCount: number;
  vendorReference?: string;
  payloadVersion?: string;
}

export interface SourceDocument {
  documentId: string;
  caseId: string;
  sourceType: SourceType;
  fileName: string;
  uploadedAt: string;
  documentType: string;
  size: number;
}

export interface SourcePayload {
  payloadId: string;
  caseId: string;
  sourceType: SourceType;
  rawData: Record<string, unknown>;
  ingestedAt: string;
  payloadVersion: string;
}
