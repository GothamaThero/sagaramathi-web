import React from "react";
import { Outlet } from "react-router";
import HeaderLayout from "./header.layout";
import FooterLayout from "./footer.layout";

const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-12 text-slate-100 flex flex-col font-sans selection:bg-brand-1 selection:text-white">
      <HeaderLayout />
      <main className="flex-1">
        <Outlet />
      </main>
      <FooterLayout />
    </div>
  );
};

export default RootLayout;
