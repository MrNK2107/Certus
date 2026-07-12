import { apiFetchAll } from '@/lib/api';

interface Team {
  id: string;
  name: string;
  branch: { code: string; name: string };
  members: { id: string; name: string; role: string }[];
  reviewerRouting: string;
}

export default async function TeamsPage() {
  const teams = await apiFetchAll<Team>('/admin/teams');

  if (teams.length === 0) {
    return (
      <div>
        <h1>Team Management</h1>
        <p>No teams configured.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Team Management</h1>
      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th>Branch</th>
            <th>Members</th>
            <th>Reviewer Routing</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id}>
              <td>{team.name}</td>
              <td>{team.branch?.code ?? '-'}</td>
              <td>{team.members?.length ?? 0}</td>
              <td>{team.reviewerRouting ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
