import { useCallback, useEffect, useState, type FC, type FormEvent } from 'react';
import { Shield, Users, Building2, FolderLock } from 'lucide-react';
import { buildApiUrl } from '../lib/api';
import type { AdminOverviewData, TeamRole, UserRole } from '../types';

interface AdminProps {
  onDataChanged?: () => void | Promise<void>;
}

const userRoles: UserRole[] = ['ADMIN', 'MEMBER'];
const teamRoles: TeamRole[] = ['LEAD', 'MEMBER'];

const Admin: FC<AdminProps> = ({ onDataChanged }) => {
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('MEMBER');

  const [newTeamName, setNewTeamName] = useState('');

  const [membershipUserId, setMembershipUserId] = useState('');
  const [membershipTeamId, setMembershipTeamId] = useState('');
  const [membershipRole, setMembershipRole] = useState<TeamRole>('MEMBER');

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl('/admin/overview'));
      if (!response.ok) {
        throw new Error('Failed to fetch admin overview');
      }

      const data: AdminOverviewData = await response.json();
      setOverview(data);

      setMembershipUserId((previousUserId) => previousUserId || data.users[0]?.id || '');
      setMembershipTeamId((previousTeamId) => previousTeamId || data.teams[0]?.id || '');
    } catch (loadError) {
      console.error(loadError);
      setError('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const refreshAfterMutation = async () => {
    await loadOverview();
    if (onDataChanged) {
      await onDataChanged();
    }
  };

  const handleCreateUser = async (event: FormEvent) => {
    event.preventDefault();

    if (!newUserName.trim() || !newUserEmail.trim()) {
      return;
    }

    await fetch(buildApiUrl('/admin/users'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        role: newUserRole,
      }),
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('MEMBER');

    await refreshAfterMutation();
  };

  const handleCreateTeam = async (event: FormEvent) => {
    event.preventDefault();

    if (!newTeamName.trim()) {
      return;
    }

    await fetch(buildApiUrl('/admin/teams'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTeamName.trim() }),
    });

    setNewTeamName('');

    await refreshAfterMutation();
  };

  const handleAssignMembership = async (event: FormEvent) => {
    event.preventDefault();

    if (!membershipUserId || !membershipTeamId) {
      return;
    }

    await fetch(buildApiUrl('/admin/memberships'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: membershipUserId,
        teamId: membershipTeamId,
        role: membershipRole,
      }),
    });

    await refreshAfterMutation();
  };

  const handleBoardTeamUpdate = async (boardId: string, teamId: string) => {
    await fetch(buildApiUrl(`/admin/boards/${boardId}/team`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: teamId || null }),
    });

    await refreshAfterMutation();
  };

  const handleUserRoleUpdate = async (userId: string, role: UserRole) => {
    await fetch(buildApiUrl(`/admin/users/${userId}/role`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });

    await refreshAfterMutation();
  };

  if (loading) {
    return <div className="text-zinc-500">Loading admin controls...</div>;
  }

  if (error || !overview) {
    return <div className="text-red-500">{error ?? 'Unable to load admin data.'}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Admin Menu</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage users, roles, teams, and board visibility.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <article className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Users</h2>
          </div>

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              value={newUserName}
              onChange={(event) => setNewUserName(event.target.value)}
              placeholder="Name"
              className="md:col-span-1 px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm"
            />
            <input
              value={newUserEmail}
              onChange={(event) => setNewUserEmail(event.target.value)}
              placeholder="Email"
              type="email"
              className="md:col-span-2 px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm"
            />
            <select
              value={newUserRole}
              onChange={(event) => setNewUserRole(event.target.value as UserRole)}
              className="px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm"
            >
              {userRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="md:col-span-4 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              Add User
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Teams</th>
                </tr>
              </thead>
              <tbody>
                {overview.users.map((user) => (
                  <tr key={user.id} className="border-b border-zinc-100 dark:border-zinc-900">
                    <td className="py-2 pr-2">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{user.name}</div>
                      <div className="text-xs text-zinc-500">{user.email}</div>
                    </td>
                    <td className="py-2">
                      <select
                        value={user.role}
                        onChange={(event) => {
                          void handleUserRoleUpdate(user.id, event.target.value as UserRole);
                        }}
                        className="px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-semibold"
                      >
                        {userRoles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 text-xs text-zinc-500">
                      {user.memberships.length > 0
                        ? user.memberships.map((membership) => `${membership.team.name} (${membership.role})`).join(', ')
                        : 'No team'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Teams</h2>
          </div>

          <form onSubmit={handleCreateTeam} className="flex gap-3">
            <input
              value={newTeamName}
              onChange={(event) => setNewTeamName(event.target.value)}
              placeholder="New team name"
              className="flex-1 px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              Create Team
            </button>
          </form>

          <form onSubmit={handleAssignMembership} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={membershipUserId}
              onChange={(event) => setMembershipUserId(event.target.value)}
              className="px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm"
            >
              {overview.users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>

            <select
              value={membershipTeamId}
              onChange={(event) => setMembershipTeamId(event.target.value)}
              className="px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm"
            >
              {overview.teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <select
              value={membershipRole}
              onChange={(event) => setMembershipRole(event.target.value as TeamRole)}
              className="px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm"
            >
              {teamRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white text-sm font-medium"
            >
              Assign User
            </button>
          </form>

          <div className="space-y-2">
            {overview.teams.map((team) => (
              <div
                key={team.id}
                className="border border-zinc-200 dark:border-zinc-800 rounded-md p-3 bg-zinc-50/50 dark:bg-zinc-900/20"
              >
                <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{team.name}</div>
                <div className="text-xs text-zinc-500 mt-1">
                  {team.memberships.length > 0
                    ? team.memberships.map((membership) => `${membership.user.name} (${membership.role})`).join(', ')
                    : 'No members yet'}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2">
          <FolderLock className="w-4 h-4 text-zinc-400" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Board Visibility</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-2">Board</th>
                <th className="py-2">Visible Team</th>
              </tr>
            </thead>
            <tbody>
              {overview.boards.map((board) => (
                <tr key={board.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 font-medium text-zinc-900 dark:text-zinc-100">{board.title}</td>
                  <td className="py-2">
                    <select
                      value={board.teamId ?? ''}
                      onChange={(event) => {
                        void handleBoardTeamUpdate(board.id, event.target.value);
                      }}
                      className="px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm"
                    >
                      <option value="">All Users</option>
                      {overview.teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Admin;
