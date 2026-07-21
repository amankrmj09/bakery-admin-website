import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { useSelector } from 'react-redux';

export const IslandLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-transparent text-[var(--text-main)] transition-colors duration-300 font-['Outfit']">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] shadow-sm text-[var(--text-main)] hover:bg-[var(--bg-panel-hover)]"
          >
            <Menu size={20} />
          </button>
        </div>

        <main id="main-scroll-container" className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pt-16 md:pt-6 lg:pt-8">
          <div className="mx-auto max-w-7xl min-h-full flex flex-col gap-6">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
