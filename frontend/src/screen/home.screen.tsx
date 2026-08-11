import React from "react";
import { Link } from "react-router";

const HomeScreen: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 text-center space-y-8">
      <div className="inline-block px-4 py-1.5 bg-brand-1/20 border border-brand-1/40 rounded-full text-brand-1 text-xs font-bold uppercase tracking-widest shadow-sm">
        Sagaramathi Pirivena Management System
      </div>

      <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
        නවීන පරිශීලක කළමනාකරණ <br />
        <span className="bg-gradient-to-r from-brand-1 via-brand-3 to-brand-5 bg-clip-text text-transparent">
          පද්ධතිය වෙත සාදරයෙන් පිළිගනිමු
        </span>
      </h1>

      <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed font-normal">
        React 19, Node.js, Express, Prisma ORM, MySQL සහ Tailwind CSS තාක්ෂණික එකතුවෙන් බලගැන්වුනු පරිශීලක තොරතුරු පාලන පද්ධතිය.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          to="/dashboard"
          className="px-6 py-3.5 bg-gradient-to-r from-brand-1 to-brand-4 hover:from-brand-2 hover:to-brand-5 text-white font-bold rounded-2xl transition-all shadow-xl shadow-brand-1/30 active:scale-95 border border-brand-1/40"
        >
          පරිශීලක පුවරුවට පිවිසෙන්න (Dashboard)
        </Link>
        <Link
          to="/about"
          className="px-6 py-3.5 bg-brand-11 border border-brand-9 hover:bg-brand-10 text-slate-200 font-semibold rounded-2xl transition-colors shadow-md"
        >
          වැඩිදුර තොරතුරු (About)
        </Link>
      </div>
    </div>
  );
};

export default HomeScreen;
