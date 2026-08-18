import React from "react";

const FooterLayout: React.FC = () => {
  return (
    <footer className="border-t border-brand-1/10 bg-surface/50 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-subtle text-center sm:text-left">
        <p className="leading-tight whitespace-nowrap">
          &copy; 2026{" "}
          <span className="text-brand-1 font-extrabold">Sāgaramati Pirivena</span>
          {" "}· All rights reserved.
        </p>
        <p className="leading-tight flex flex-wrap justify-center sm:justify-end items-center gap-1">
          <span>Designed &amp; Developed by</span>{" "}
          <strong className="text-brand-1 font-extrabold whitespace-nowrap">Gothamavansalankara Thero</strong>
          <span className="mx-0.5">|</span>
          <span className="whitespace-nowrap">EXONIT (Pvt) Ltd.</span>
        </p>
      </div>
    </footer>
  );
};

export default FooterLayout;
