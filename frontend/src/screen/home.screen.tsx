import React from "react";
import { Link } from "react-router";

const HomeScreen: React.FC = () => {
  const features = [
    { icon: "👤", title: "User Management", desc: "පරිශීලකයින් Create, Read, Update, Delete කිරීමට" },
    { icon: "🔐", title: "Secure Passwords", desc: "bcrypt encryption සහිත ආරක්ෂිත password hashing" },
    { icon: "⚡", title: "Real-time Updates", desc: "Instant UI updates without page reload" },
    { icon: "🔍", title: "Live Search", desc: "නම හෝ email මගින් ක්ෂණිකව සොයා ගැනීම" },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-1/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-1/8 border border-brand-1/15 rounded-full text-brand-1 text-xs font-semibold uppercase tracking-widest mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-1 animate-pulse" />
          Sagaramathi Pirivena · Management System
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-ink tracking-tight leading-[1.1] mb-6">
          නවීන පරිශීලක<br />
          <span className="bg-gradient-to-r from-brand-1 via-[#e0004a] to-brand-3 bg-clip-text text-transparent">
            කළමනාකරණ පද්ධතිය
          </span>
        </h1>

        <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          React 19, Express, Prisma ORM සහ MySQL — Full Stack Management System
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="group flex items-center gap-2.5 px-7 py-3.5 bg-brand-1 hover:bg-brand-2 text-white font-semibold rounded-xl shadow-xl shadow-brand-1/25 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h8" />
            </svg>
            Dashboard වෙත පිවිසෙන්න
          </Link>
          <Link
            to="/about"
            className="flex items-center gap-2 px-7 py-3.5 bg-surface border border-brand-1/15 hover:border-brand-1/30 text-ink font-semibold rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all"
          >
            වැඩිදුර ඉගෙන ගන්න
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="group bg-surface border border-brand-1/8 hover:border-brand-1/25 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-brand-1/8"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-ink font-bold text-sm mb-1 group-hover:text-brand-1 transition-colors">{f.title}</h3>
              <p className="text-subtle text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="relative border-t border-brand-1/8">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { label: "Full-Stack", value: "React + Node" },
              { label: "Database", value: "MySQL + Prisma" },
              { label: "Security", value: "bcrypt Hash" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-ink font-bold text-lg">{s.value}</div>
                <div className="text-subtle text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
