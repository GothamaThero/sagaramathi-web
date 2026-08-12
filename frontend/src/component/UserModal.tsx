import React, { useState, useEffect } from "react";
import type { IUser, ICreateUserInput, IUpdateUserInput } from "../types/user";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ICreateUserInput | IUpdateUserInput) => Promise<void>;
  userToEdit: IUser | null;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit, userToEdit }) => {
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
      setName(""); setEmail(""); setPassword(""); setRole("USER");
    }
    setError(null);
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) { setError("නම සහ Email ඇතුළත් කිරීම අනිවාර්ය වේ."); return; }
    if (!userToEdit && !password)      { setError("නව user කෙනෙකු සඳහා Password අවශ්‍ය වේ."); return; }
    try {
      setLoading(true);
      const payload: any = { name, email, role };
      if (password) payload.password = password;
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "දෝෂයකි. නැවත උත්සාහ කරන්න.");
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
            <div className="w-8 h-8 rounded-lg bg-brand-1/8 border border-brand-1/15 flex items-center justify-center">
              <svg className="w-4 h-4 text-brand-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {userToEdit
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                }
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">{userToEdit ? "User Update" : "නව User"}</h2>
              <p className="text-subtle text-xs">{userToEdit ? "User details update කරන්න" : "නව user account සාදන්න"}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost !p-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-brand-1/6 border border-brand-1/20 rounded-xl">
              <svg className="w-4 h-4 text-brand-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-brand-1 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="form-label">නම (Name)</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="සුනිල් පෙරේරා" className="form-input" />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com" className="form-input" />
          </div>
          <div>
            <label className="form-label">
              Password
              {userToEdit && (
                <span className="text-subtle/60 text-xs font-normal ml-1.5 normal-case tracking-normal">
                  (හිස්ව තැබුවහොත් වෙනස් නොවේ)
                </span>
              )}
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={userToEdit ? "xxxxxxxx" : "Password ඇතුළත් කරන්න"} className="form-input" />
          </div>
          <div>
            <label className="form-label">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="form-input">
              <option value="USER">👤 USER — සාමාන්‍ය පරිශීලක</option>
              <option value="ADMIN">👑 ADMIN — පරිපාලක</option>
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-ghost">
            අවලංගු
          </button>
          <button onClick={handleSubmit as any} disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                සුරකිමින්...
              </>
            ) : (userToEdit ? "Update කරන්න" : "ඇතුළත් කරන්න")}
          </button>
        </div>
      </div>
    </div>
  );
};
