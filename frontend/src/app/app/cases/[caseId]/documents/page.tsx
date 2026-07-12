import type { SourceDocument } from '@msme-credit/shared';
import { apiFetchAll } from '@/lib/api';

function groupBySourceType(docs: SourceDocument[]): Record<string, SourceDocument[]> {
  const groups: Record<string, SourceDocument[]> = {};
  for (const doc of docs) {
    const key = doc.sourceType.toString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(doc);
  }
  return groups;
}

export default async function DocumentsPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const documents = await apiFetchAll<SourceDocument>(`/sources/${caseId}/documents`);

  if (documents.length === 0) {
    return (
      <div>
        <h1>Documents</h1>
        <p>No documents found.</p>
      </div>
    );
  }

  const grouped = groupBySourceType(documents);

  return (
    <div>
      <h1>Documents</h1>
      {Object.entries(grouped).map(([sourceType, docs]) => (
        <div key={sourceType}>
          <h2>{sourceType}</h2>
          <table>
            <thead>
              <tr><th>File Name</th><th>Type</th><th>Uploaded</th><th>Size</th></tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.documentId}>
                  <td>{doc.fileName}</td>
                  <td>{doc.documentType}</td>
                  <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                  <td>{(doc.size / 1024).toFixed(1)} KB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
