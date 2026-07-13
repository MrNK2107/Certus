import { ConsentArtifact, ConsentStatus } from '../../shared';
import { mockDataStore } from '../../data/mock-data';

export class ConsentStore {
  findByCase(caseId: string): ConsentArtifact[] {
    return Array.from(mockDataStore.consents.values()).filter(c => c.caseId === caseId);
  }

  findById(consentId: string): ConsentArtifact | undefined {
    return mockDataStore.consents.get(consentId);
  }

  create(consent: ConsentArtifact): ConsentArtifact {
    mockDataStore.consents.set(consent.consentId, consent);
    return consent;
  }

  revoke(consentId: string): ConsentArtifact {
    const existing = mockDataStore.consents.get(consentId);
    if (!existing) {
      throw Object.assign(new Error('Consent not found'), { statusCode: 404, code: 'CONSENT_NOT_FOUND' });
    }
    if (existing.status === ConsentStatus.REVOKED) {
      throw Object.assign(new Error('Consent already revoked'), { statusCode: 400, code: 'ALREADY_REVOKED' });
    }
    const updated: ConsentArtifact = {
      ...existing,
      status: ConsentStatus.REVOKED,
      revokedAt: new Date().toISOString(),
      version: existing.version + 1,
    };
    mockDataStore.consents.set(consentId, updated);
    return updated;
  }

  amend(consentId: string, amendments: Partial<ConsentArtifact>): ConsentArtifact {
    const existing = mockDataStore.consents.get(consentId);
    if (!existing) {
      throw Object.assign(new Error('Consent not found'), { statusCode: 404, code: 'CONSENT_NOT_FOUND' });
    }
    if (existing.status === ConsentStatus.REVOKED) {
      throw Object.assign(new Error('Cannot amend revoked consent'), { statusCode: 400, code: 'CANNOT_AMEND_REVOKED' });
    }
    const amendedId = `${consentId}-v${existing.version + 1}`;
    const amended: ConsentArtifact = {
      ...existing,
      ...amendments,
      consentId: amendedId,
      caseId: existing.caseId,
      sourceType: existing.sourceType,
      status: ConsentStatus.AMENDED,
      amendedFrom: consentId,
      version: existing.version + 1,
      createdAt: new Date().toISOString(),
    };
    mockDataStore.consents.set(amendedId, amended);
    return amended;
  }

  findByCaseAndSource(caseId: string, sourceType: string): ConsentArtifact[] {
    return Array.from(mockDataStore.consents.values()).filter(
      c => c.caseId === caseId && c.sourceType === sourceType
    );
  }
}

export const consentStore = new ConsentStore();
