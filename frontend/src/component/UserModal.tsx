import React, { useState, useEffect } from "react";
import type { IUser, ICreateUserInput, IUpdateUserInput } from "../types/user";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ICreateUserInput | IUpdateUserInput) => Promise<void>;
  userToEdit: IUser | null;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit, userToEdit }) => {
  const [title, setTitle]       = useState("Mr.");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("USER");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name); setEmail(userToEdit.email);
      setRole(userToEdit.role); setPassword("");
    } else {
      setTitle("Mr."); setName(""); setEmail(""); setPassword(""); setRole("USER");
    }
    setError(null);
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) { setError("Name and Email are required."); return; }
    if (!userToEdit && !password)      { setError("Password is required for new user."); return; }
    try {
      setLoading(true);
      const cleanName = name.trim();
      let fullName = cleanName;
      if (!userToEdit) {
        if (title === "Rev.") {
          fullName = cleanName.startsWith("Rev.") ? cleanName : `Rev. ${cleanName}`;
        } else {
          fullName = cleanName.endsWith(title) ? cleanName : `${title} ${cleanName}`;
        }
      }
      const payload: any = { name: fullName, email, role };
      if (password) payload.password = password;
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-md">

        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-ink">{userToEdit ? "Edit User Account" : "Add New User"}</h2>
              <p className="text-subtle text-xs">{userToEdit ? "Update user details" : "Create a new user account"}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost !px-3 !py-1 text-xs font-bold">
            Close
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3.5 bg-brand-1/6 border border-brand-1/20 rounded-xl">
              <p className="text-brand-1 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="form-label">Full Name</label>
            <div className="flex gap-2">
              {!userToEdit && (
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input w-28 text-sm font-semibold shrink-0 cursor-pointer bg-surface border-brand-1/20 focus:border-brand-1"
                >
                  <option value="Rev.">Rev.</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Miss">Miss</option>
                </select>
              )}
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Sunil Perera" className="form-input flex-1" />
            </div>
          </div>
          <div>
            <label className="form-label">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com" className="form-input" />
          </div>
          <div>
            <label className="form-label">
              Password
              {userToEdit && (
                <span className="text-subtle/60 text-xs font-normal ml-1.5 normal-case tracking-normal">
                  (Leave blank to keep current password)
                </span>
              )}
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={userToEdit ? "••••••••" : "Enter Password"} className="form-input" />
          </div>
          <div>
            <label className="form-label">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="form-input">
              <option value="USER">USER — Regular Member</option>
              <option value="ADMIN">ADMIN — Administrator</option>
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button onClick={handleSubmit as any} disabled={loading} className="btn-primary">
            {loading ? "Saving..." : (userToEdit ? "Update User" : "Create User")}
          </button>
        </div>
      </div>
    </div>
  );
};
