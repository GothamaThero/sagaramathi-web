import React from "react";

const AboutScreen: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-extrabold text-ink">අප ගැන (About Sagaramathi Web)</h1>
      <p className="text-muted leading-relaxed">
        සාගරමතී පිරිවෙන් වෙබ් අඩවිය සහ පරිශීලක පාලන පද්ධතිය නවීනතම වෙබ්
        තාක්ෂණයන් (Full Stack Web Development) යොදා ගනිමින් නිර්මාණය කර ඇත.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
        <div className="bg-surface border border-brand-1/8 p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-brand-1 mb-2">Frontend</h3>
          <p className="text-subtle text-sm">React 19, React Router 8, Vite, Tailwind CSS v4</p>
        </div>
        <div className="bg-surface border border-brand-1/8 p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-brand-3 mb-2">Backend</h3>
          <p className="text-subtle text-sm">Node.js, Express 5, Prisma ORM 7, MySQL, TypeScript</p>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;
