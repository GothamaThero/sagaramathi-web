import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export const ProfileScreen = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState({ name: "", phone: "", address: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.data.name || "",
          phone: data.data.phone || "",
          address: data.data.address || ""
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...profile };
      if (passwords.newPassword) {
        payload.currentPassword = passwords.currentPassword;
        payload.newPassword = passwords.newPassword;
      }
      
      const res = await fetch("http://localhost:3000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage("Profile updated successfully!");
        setPasswords({ currentPassword: "", newPassword: "" });
      } else {
        setMessage(data.message || "Failed to update profile");
      }
    } catch (e) {
      setMessage("Error updating profile");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-brand-1/10 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-brand-1">Profile (පැතිකඩ)</h2>
      {message && <p className="mb-4 text-green-600 font-semibold">{message}</p>}
      
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Name (නම)</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 border rounded-xl"
            value={profile.name}
            onChange={e => setProfile({...profile, name: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1">Phone (දුරකථන අංකය)</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 border rounded-xl"
            value={profile.phone}
            onChange={e => setProfile({...profile, phone: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1">Address (ලිපිනය)</label>
          <textarea 
            className="w-full px-4 py-2 border rounded-xl"
            value={profile.address}
            onChange={e => setProfile({...profile, address: e.target.value})}
          />
        </div>
        
        <h3 className="text-xl font-bold mt-8 mb-4 border-t pt-6">Change Password (මුරපදය වෙනස් කිරීම)</h3>
        
        <div>
          <label className="block text-sm font-semibold mb-1">Current Password (වත්මන් මුරපදය)</label>
          <input 
            type="password" 
            className="w-full px-4 py-2 border rounded-xl"
            value={passwords.currentPassword}
            onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1">New Password (නව මුරපදය)</label>
          <input 
            type="password" 
            className="w-full px-4 py-2 border rounded-xl"
            value={passwords.newPassword}
            onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
          />
        </div>
        
        <button type="submit" className="w-full py-3 bg-brand-1 text-white font-bold rounded-xl mt-6">
          Update Profile (යාවත්කාලීන කරන්න)
        </button>
      </form>
    </div>
  );
};
