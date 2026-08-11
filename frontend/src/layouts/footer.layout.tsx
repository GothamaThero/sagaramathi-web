import React from "react";

const FooterLayout: React.FC = () => {
  return (
    <footer className="bg-brand-12 border-t border-brand-11 py-6 text-center text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-300 font-medium">
          &copy; 2026 <span className="text-brand-1 font-semibold">Sagaramati Pirivena</span> | සියලුම හිමිකම් ඇවිරිණි.
        </p>
        <p className="text-xs text-slate-500">
          Powered by React 19, Express, Prisma & Tailwind CSS
        </p>
      </div>
    </footer>
  );
};

export default FooterLayout;
