import React, { useState, useEffect } from "react";
import type { IUser, ICreateUserInput, IUpdateUserInput } from "../types/user";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ICreateUserInput | IUpdateUserInput) => Promise<void>;
  userToEdit: IUser | null;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userToEdit,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setRole(userToEdit.role);
      setPassword("");
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setRole("USER");
    }
    setError(null);
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("කරුණාකර නම සහ ඉමේල් ලිපිනය ඇතුළත් කරන්න.");
      return;
    }

    if (!userToEdit && !password) {
      setError("නව පරිශීලකයෙකු සඳහා මුරපදයක් (Password) අවශ්‍ය වේ.");
      return;
    }

    try {
      setLoading(true);
      const payload: any = { name, email, role };
      if (password) {
        payload.password = password;
      }
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "අසාර්ථක විය. නැවත උත්සාහ කරන්න.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="bg-brand-11 border border-brand-8 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-9 bg-brand-12/80">
          <h2 className="text-xl font-bold text-white">
            {userToEdit ? "පරිශීලක තොරතුරු යාවත්කාලීන කරන්න" : "නව පරිශීලකයෙකු ඇතුළත් කරන්න"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-semibold leading-none focus:outline-none"
          >
            &times;
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-brand-1/20 border border-brand-1/50 rounded-lg text-brand-1 font-medium text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              සම්පූර්ණ නම (Name)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="උදා: සුනිල් පෙරේරා"
              className="w-full px-4 py-2.5 bg-brand-12 border border-brand-9 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              විද්‍යුත් තැපෑල (Email)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2.5 bg-brand-12 border border-brand-9 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              මුරපදය (Password){userToEdit && " (වෙනස් නොකරන්නේ නම් හිස්ව තබන්න)"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-brand-12 border border-brand-9 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              කාර්යභාරය (Role)
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-brand-12 border border-brand-9 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-1"
            >
              <option value="USER">USER (සාමාන්‍ය පරිශීලක)</option>
              <option value="ADMIN">ADMIN (පරිපාලක)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-brand-9">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-brand-10 hover:bg-brand-9 text-slate-300 rounded-xl transition-colors text-sm font-medium"
            >
              අවලංගු කරන්න
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-brand-1 to-brand-3 hover:from-brand-2 hover:to-brand-4 text-white rounded-xl transition-all text-sm font-semibold shadow-md shadow-brand-1/30 disabled:opacity-50"
            >
              {loading ? "සුරකිමින්..." : userToEdit ? "යාවත්කාලීන කරන්න" : "ඇතුළත් කරන්න"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
