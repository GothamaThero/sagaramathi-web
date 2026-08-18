import React, { useEffect, useState, useCallback } from "react";
import type { IUser, ICreateUserInput, IUpdateUserInput } from "../../types/user";
import { fetchUsers, createUser, updateUser, deleteUser, API_BASE_URL } from "../../libs/api";
import { UserModal } from "../../component/UserModal";
import { useAuth } from "../../context/AuthContext";

const UsersScreen: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<IUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsers(token);
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);


  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt("Enter new password:");
    if (!newPassword) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/auth/admin/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, newPassword })
      });
      if (res.ok) {
        alert("Password reset successfully.");
      } else {
        alert("Password reset failed.");
      }
    } catch (error) {
      alert("An error occurred.");
    }
  };

  const handleSaveUser = async (data: ICreateUserInput | IUpdateUserInput) => {
    if (editingUser) {
      await updateUser(editingUser.id, data, token);
    } else {
      await createUser(data as ICreateUserInput, token);
    }
    await loadUsers();
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      setDeleteLoading(true);
      await deleteUser(deletingUser.id, token);
      setDeletingUser(null);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || "Failed to delete user.");
    } finally {
      setDeleteLoading(false);
    }
  };


  const filteredUsers = (users || []).filter(
    (u) =>
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">User Management</h1>
          <p className="text-subtle text-sm mt-0.5">Manage registered user accounts</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="px-5 py-2.5 bg-brand-1 hover:bg-brand-2 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-1/20 active:scale-95 transition-all"
        >
          Add New User
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-surface border border-brand-1/8 rounded-2xl overflow-hidden shadow-sm">

        {/* Table toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-brand-1/6">
          <div>
            <h2 className="text-sm font-semibold text-ink">All Users</h2>
            <p className="text-xs text-subtle mt-0.5">{filteredUsers.length} / {users.length} records</p>
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-surface-2 border border-brand-1/10 rounded-xl text-sm text-ink placeholder-subtle focus:outline-none focus:ring-1 focus:ring-brand-1 transition"
            />
          </div>
        </div>

        {/* States */}
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-subtle">
            <span className="text-sm font-semibold">Loading data...</span>
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center gap-4">
            <p className="text-muted text-sm text-center max-w-xs">{error}</p>
            <div className="flex gap-2">
              <button onClick={loadUsers} className="px-4 py-2 bg-brand-1 hover:bg-brand-2 text-white text-xs font-semibold rounded-lg">
                Try Again
              </button>
              {error.toLowerCase().includes("token") && (
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-lg"
                >
                  Re-login
                </button>
              )}
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-subtle">
            <p className="text-sm">{search ? `No results found for "${search}"` : "No users found"}</p>
            {search && <button onClick={() => setSearch("")} className="text-xs text-brand-1 hover:underline">Clear Search</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-1/6 bg-surface-2/60">
                  {["#", "Name", "Email", "Role", "Registered Date", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-subtle uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-1/4">
                {filteredUsers.map((targetUser) => {
                  const isTargetSuperAdmin = targetUser.role === "SUPER_ADMIN";
                  const isCurrentSuperAdmin = currentUser?.role === "SUPER_ADMIN";
                  const canManageUser = isCurrentSuperAdmin || !isTargetSuperAdmin;

                  return (
                    <tr key={targetUser.id} className="group hover:bg-brand-1/[0.02] transition-colors">
                      <td className="px-5 py-4 text-subtle text-xs font-mono">{targetUser.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-1 to-brand-5 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm shadow-brand-1/20">
                            {targetUser.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-ink">{targetUser.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">{targetUser.email}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                          targetUser.role === "SUPER_ADMIN"
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : targetUser.role === "ADMIN"
                            ? "bg-brand-1/8 text-brand-1 border-brand-1/20"
                            : "bg-surface-2 text-muted border-brand-1/8"
                        }`}>
                          {targetUser.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-subtle">
                        {new Date(targetUser.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-5 py-4">
                        {canManageUser ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setEditingUser(targetUser); setIsModalOpen(true); }}
                              className="px-3 py-1 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded text-xs font-semibold transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleResetPassword(targetUser.id)}
                              className="px-3 py-1 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 rounded text-xs font-semibold transition-colors"
                              title="Reset Password"
                            >
                              Reset PW
                            </button>
                            <button
                              onClick={() => setDeletingUser(targetUser)}
                              className="px-3 py-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded text-xs font-semibold transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-lg text-xs font-semibold select-none" title="Super Admin accounts can only be managed by Super Admin">
                            🔒 Protected
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
            <h3 className="text-lg font-bold text-ink mb-2">Confirm Delete</h3>
            <p className="text-muted text-sm mb-6">
              Account for <span className="font-semibold text-ink">{deletingUser.name}</span> will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingUser(null)} className="flex-1 py-2.5 bg-surface-2 hover:bg-brand-1/8 text-muted rounded-xl text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleDeleteUser} disabled={deleteLoading}
                className="flex-1 py-2.5 bg-brand-1 hover:bg-brand-2 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-1/20 disabled:opacity-50">
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersScreen;
