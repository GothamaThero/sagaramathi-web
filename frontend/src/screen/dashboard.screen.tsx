import React, { useEffect, useState } from "react";
import type { IUser, ICreateUserInput, IUpdateUserInput } from "../types/user";
import { fetchUsers, createUser, updateUser, deleteUser } from "../libs/api";
import { UserModal } from "../component/UserModal";

const DashboardScreen: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);

  // Delete Confirm State
  const [deletingUser, setDeletingUser] = useState<IUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "පරිශීලකයින් ලැයිස්තුව ලබා ගැනීමට නොහැකි විය.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: IUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
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

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const userCount = users.filter((u) => u.role === "USER").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-11 via-brand-10 to-brand-12 border border-brand-8 p-6 rounded-2xl shadow-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            පරිශීලක කළමනාකරණය (User Dashboard)
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            පරිශීලකයින් එකතු කිරීම, වෙනස් කිරීම සහ ඉවත් කිරීම මෙතැනින් සිදු කරන්න.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-1 to-brand-3 hover:from-brand-2 hover:to-brand-4 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-1/30 active:scale-95 border border-brand-1/40"
        >
          <span className="text-xl leading-none">+</span> නව පරිශීලකයෙක් ඇතුළත් කරන්න
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-brand-11 border border-brand-9 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              මුළු පරිශීලකයින් (Total)
            </p>
            <h3 className="text-3xl font-black text-white mt-1">{users.length}</h3>
          </div>
          <div className="w-12 h-12 bg-brand-1/15 border border-brand-1/30 text-brand-1 rounded-xl flex items-center justify-center text-xl font-bold">
            👥
          </div>
        </div>

        <div className="bg-brand-11 border border-brand-9 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              පරිපාලකයින් (Admins)
            </p>
            <h3 className="text-3xl font-black text-brand-1 mt-1">{adminCount}</h3>
          </div>
          <div className="w-12 h-12 bg-brand-3/20 border border-brand-3/30 text-brand-2 rounded-xl flex items-center justify-center text-xl font-bold">
            👑
          </div>
        </div>

        <div className="bg-brand-11 border border-brand-9 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              සාමාන්‍ය පරිශීලකයින් (Users)
            </p>
            <h3 className="text-3xl font-black text-slate-200 mt-1">{userCount}</h3>
          </div>
          <div className="w-12 h-12 bg-brand-5/20 border border-brand-5/30 text-slate-300 rounded-xl flex items-center justify-center text-xl font-bold">
            👤
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-brand-11/80 border border-brand-9 p-4 rounded-xl shadow-md">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            placeholder="නම හෝ Email මගින් සෙවුම..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-brand-12 border border-brand-9 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-1"
          />
          <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
        </div>
        <div className="text-slate-400 text-xs font-medium">
          පෙන්නුම් කරන්නේ {filteredUsers.length} න් {users.length} ක් පමණි
        </div>
      </div>

      {/* Main Users Table */}
      <div className="bg-brand-11 border border-brand-9 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block animate-spin text-3xl mb-2">⌛</div>
            <p className="font-medium">දත්ත ලෝඩ් වෙමින් පවතී...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-brand-1">
            <p className="mb-3 font-semibold">{error}</p>
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-brand-10 hover:bg-brand-9 text-white rounded-xl text-sm font-medium"
            >
              නැවත උත්සාහ කරන්න
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-lg font-medium">පරිශීලකයින් කිසිවෙක් හමු නොවීය.</p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-2 text-sm text-brand-1 hover:underline font-semibold"
              >
                සෙවුම ඉවත් කරන්න
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-brand-12 text-slate-300 uppercase text-xs tracking-wider border-b border-brand-9 font-bold">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">නම</th>
                  <th className="px-6 py-4">විද්‍යුත් තැපෑල (Email)</th>
                  <th className="px-6 py-4">කාර්යභාරය (Role)</th>
                  <th className="px-6 py-4">එකතු කළ දිනය</th>
                  <th className="px-6 py-4 text-right">ක්‍රියාමාර්ග (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-9">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-brand-10/50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs font-semibold">#{user.id}</td>
                    <td className="px-6 py-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-1 to-brand-5 text-white flex items-center justify-center font-black text-sm shadow-md shadow-brand-1/20 border border-brand-1/40">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-xs font-extrabold tracking-wider ${
                          user.role === "ADMIN"
                            ? "bg-brand-1/20 text-brand-1 border border-brand-1/40 shadow-sm"
                            : "bg-brand-6/30 text-slate-200 border border-brand-6/50"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs font-medium">
                      {new Date(user.createdAt).toLocaleDateString("si-LK")}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="px-3.5 py-1.5 bg-brand-10 hover:bg-brand-9 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-brand-8"
                      >
                        සංස්කරණය (Edit)
                      </button>
                      <button
                        onClick={() => setDeletingUser(user)}
                        className="px-3.5 py-1.5 bg-brand-1/20 hover:bg-brand-1/40 text-brand-1 border border-brand-1/40 rounded-xl text-xs font-semibold transition-all"
                      >
                        ඉවත් කරන්න (Delete)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveUser}
        userToEdit={editingUser}
      />

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-brand-11 border border-brand-8 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white">තහවුරු කරන්න</h3>
            <p className="text-slate-300 text-sm">
              <span className="font-semibold text-white">{deletingUser.name}</span> පරිශීලකයා පද්ධතියෙන් ඉවත් කිරීමට ඔබට විශ්වාසද?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-brand-10 hover:bg-brand-9 text-slate-300 rounded-xl text-sm font-medium"
              >
                නැත
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="px-4 py-2 bg-brand-1 hover:bg-brand-2 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-1/30 disabled:opacity-50"
              >
                {deleteLoading ? "ඉවත් කරමින්..." : "ඔව්, ඉවත් කරන්න"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardScreen;
