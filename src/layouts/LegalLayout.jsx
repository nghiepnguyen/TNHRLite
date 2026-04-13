import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LegalLayout = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'rgb(250, 249, 246)' }}>
      {/* Custom Header for Legal Pages */}
      <header className="bg-[#FAF9F6]/85 backdrop-blur-md fixed top-0 w-full z-50 border-b border-[#1F1F1F]/5">
        <nav className="flex justify-between items-center w-full px-6 md:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-12">
            <span
              className="text-xl font-extrabold tracking-tighter text-[#1F1F1F] font-headline cursor-pointer flex items-center gap-2"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 editorial-gradient rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined !text-[18px]">shield</span>
              </div>
              HR Lite
            </span>
          </div>
          <Link to="/" className="text-sm font-bold text-primary hover:underline">Quay lại Trang chủ</Link>
        </nav>
      </header>

      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h1 className="font-headline font-extrabold text-4xl mb-12 text-on-surface tracking-tight">{title}</h1>
          <div className="prose prose-slate max-w-none text-on-surface-variant leading-relaxed space-y-8 font-light">
            {children}
          </div>
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="bg-[#F4F3F1] py-12 px-8 border-t border-[#1F1F1F]/5">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="text-lg font-bold text-[#1F1F1F] font-headline">HR Lite</span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1F1F1F]/50">© 2024 HR Lite. Bảo lưu mọi quyền.</p>
        </div>
      </footer>
    </div>
  );
};

export default LegalLayout;
