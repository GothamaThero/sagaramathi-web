import React from "react";

const FooterLayout: React.FC = () => {
  return (
    <footer className="border-t border-brand-1/8 py-6">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-subtle">
        <p>
          &copy; 2026{" "}
          <span className="text-brand-1 font-semibold">Sagaramati Pirivena</span>
          {" "}· All rights reserved.
        </p>
        <p>
          Designed &amp; Developed by{" "}
          <strong className="text-brand-1 font-bold">Gothamavansalankara Thero</strong>
          {" "}| EXONIT (Pvt) Ltd.
        </p>
      </div>
    </footer>
  );
};

export default FooterLayout;
