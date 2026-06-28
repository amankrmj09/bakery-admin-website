import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { LayoutDashboard, ShoppingCart, Users, LogOut, Store, Moon, Sun } from 'lucide-react';

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.dashboard);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/bakery-settings', label: 'Bakery & Products', icon: Store },
    { to: '/users', label: 'Users', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-background p-2.5 gap-2.5 overflow-hidden text-foreground">
      {/* Sidebar Island */}
      <aside className="w-64 flex-shrink-0 bg-card rounded-xl border border-border flex flex-col shadow-sm overflow-hidden transition-colors duration-200">
        <div className="flex h-16 items-center px-6 border-b border-border bg-card">
          <Store className="h-6 w-6 text-primary-500 mr-2" />
          <span className="text-lg font-semibold tracking-tight text-foreground">Bakery Admin</span>
        </div>
        <div className="flex flex-col flex-1 py-4 overflow-y-auto">
          <nav className="flex-1 space-y-1.5 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500/10 text-primary-500'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col gap-2.5 overflow-hidden">
        {/* Top Header Island */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between bg-card rounded-xl border border-border px-6 shadow-sm transition-colors duration-200">
          <h1 className="text-lg font-medium text-foreground tracking-tight">Admin Portal</h1>
          <div className="flex items-center space-x-6">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.firstName || user?.username || 'Admin'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto rounded-xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
