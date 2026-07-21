import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, LogOut, Store, LayoutTemplate, Settings, X, Package, Tags, Archive } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { cn } from '../../lib/utils';
import { useTheme } from '../../app/ThemeContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Orders', path: '/orders', icon: ShoppingCart },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Categories', path: '/categories', icon: Tags },
  { name: 'Inventory', path: '/inventory', icon: Archive },
  { name: 'Storefront', path: '/storefront', icon: Store },
  { name: 'Users', path: '/users', icon: Users },
];

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { glass } = useTheme();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-64 md:w-64 transition-transform duration-300 ease-in-out flex flex-col",
          "md:translate-x-0 md:m-4 md:rounded-2xl md:shadow-lg md:h-[calc(100vh-2rem)]",
          glass ? "glass-panel" : "bg-[var(--bg-panel)] border border-[var(--border-color)]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center justify-between border-b border-[var(--border-color)]/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary-dark)] flex items-center justify-center shadow-md">
               <span className="text-white font-bold text-lg leading-none">B</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-[var(--text-main)]">Bakery Admin</span>
          </div>
          <button className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-main)]" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "text-[var(--color-primary)] font-medium" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-panel-hover)]"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute inset-0 bg-[var(--color-primary)] opacity-10" />
                  )}
                  <item.icon size={18} className={cn(
                    "transition-transform group-hover:scale-110",
                    isActive ? "text-[var(--color-primary)]" : ""
                  )} />
                  <span className="relative z-10">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-[var(--border-color)]/50 space-y-1">
          <NavLink 
            to="/settings" 
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "text-[var(--color-primary)] font-medium" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-panel-hover)]"
              )}
          >
             {({ isActive }) => (
                <>
                  {isActive && <div className="absolute inset-0 bg-[var(--color-primary)] opacity-10 rounded-xl" />}
                  <Settings size={18} className="transition-transform group-hover:rotate-90" />
                  <span className="relative z-10">Settings</span>
                </>
             )}
          </NavLink>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
