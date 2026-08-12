import React, { useEffect, useState } from "react";
import type { IUser, ICreateUserInput, IUpdateUserInput } from "../types/user";
import { fetchUsers, createUser, updateUser, deleteUser } from "../libs/api";
import { UserModal } from "../component/UserModal";

const UsersScreen: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<IUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "දත්ත ලබා ගැනීමට නොහැකි විය.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt("අලුත් මුරපදය ඇතුලත් කරන්න (Enter new password):");
    if (!newPassword) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/auth/admin/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, newPassword })
      });
      if (res.ok) {
        alert("මුරපදය සාර්ථකව වෙනස් කරන ලදී. (Password reset successfully)");
      } else {
        alert("මුරපදය වෙනස් කිරීම අසාර්ථකයි.");
      }
    } catch (error) {
      alert("දෝෂයක් මතු විය.");
    }
  };

  const handleSaveUser = async (data: ICreateUserInput | IUpdateUserInput) => {
    if (editingUser) {
      await updateUser(editingUser.id, data);
    } else {
      await createUser(data as ICreateUserInput);
    }
    await loadUsers();
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      setDeleteLoading(true);
      await deleteUser(deletingUser.id);
      setDeletingUser(null);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || "ඉවත් කිරීම අසාර්ථක විය.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">පරිශීලකයින් කළමනාකරණය</h1>
          <p className="text-subtle text-sm mt-0.5">User accounts manage කරන්න</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-1 hover:bg-brand-2 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-1/20 active:scale-95 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          නව පරිශීලකයෙකු
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-surface border border-brand-1/8 rounded-2xl overflow-hidden shadow-sm">

        {/* Table toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-brand-1/6">
          <div>
            <h2 className="text-sm font-semibold text-ink">සියලුම පරිශීලකයින්</h2>
            <p className="text-xs text-subtle mt-0.5">{filteredUsers.length} / {users.length} records</p>
          </div>
          <div className="relative w-full sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="සොයන්න..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-2 border border-brand-1/10 rounded-xl text-sm text-ink placeholder-subtle focus:outline-none focus:ring-1 focus:ring-brand-1 transition"
            />
          </div>
        </div>

        {/* States */}
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-subtle">
            <svg className="w-8 h-8 animate-spin text-brand-1" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">දත්ත ලෝඩ් වෙමින්...</span>
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-1/8 border border-brand-1/15 flex items-center justify-center text-xl">⚠️</div>
            <p className="text-muted text-sm text-center max-w-xs">{error}</p>
            <button onClick={loadUsers} className="px-4 py-2 bg-brand-1 hover:bg-brand-2 text-white text-xs font-semibold rounded-lg">
              නැවත උත්සාහ කරන්න
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-subtle">
            <div className="text-4xl opacity-40">🔍</div>
            <p className="text-sm">{search ? `"${search}" සඳහා ප්‍රතිඵල නැත` : "පරිශීලකයින් නොමැත"}</p>
            {search && <button onClick={() => setSearch("")} className="text-xs text-brand-1 hover:underline">සෙවුම ඉවත් කරන්න</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-1/6 bg-surface-2/60">
                  {["#", "නම", "Email", "Role", "ලියාපදිංචි දිනය", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-subtle uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-1/4">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-brand-1/[0.02] transition-colors">
                    <td className="px-5 py-4 text-subtle text-xs font-mono">{user.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-1 to-brand-5 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm shadow-brand-1/20">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-ink">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                        user.role === "ADMIN"
                          ? "bg-brand-1/8 text-brand-1 border-brand-1/20"
                          : "bg-surface-2 text-muted border-brand-1/8"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-subtle">
                      {new Date(user.createdAt).toLocaleDateString("si-LK")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                          className="px-3 py-1 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded text-xs font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="px-3 py-1 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 rounded text-xs font-semibold transition-colors"
                          title="Reset Password"
                        >
                          Reset PW
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="px-3 py-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded text-xs font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSaveUser} userToEdit={editingUser} />

      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm p-4">
          <div className="bg-surface border border-brand-1/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-brand-1/8 border border-brand-1/15 flex items-center justify-center text-xl mb-4">🗑️</div>
            <h3 className="text-lg font-bold text-ink mb-2">ඉවත් කිරීම තහවුරු කරන්න</h3>
            <p className="text-muted text-sm mb-6">
              <span className="font-semibold text-ink">{deletingUser.name}</span> ගේ ගිණුම ස්ථිරවම ඉවත් කෙරේ. මෙය undo කළ නොහැක.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingUser(null)} className="flex-1 py-2.5 bg-surface-2 hover:bg-brand-1/8 text-muted rounded-xl text-sm font-medium">
                අවලංගු
              </button>
              <button onClick={handleDeleteUser} disabled={deleteLoading}
                className="flex-1 py-2.5 bg-brand-1 hover:bg-brand-2 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-1/20 disabled:opacity-50">
                {deleteLoading ? "ඉවත් කරමින්..." : "ඔව්, ඉවත් කරන්න"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersScreen;
