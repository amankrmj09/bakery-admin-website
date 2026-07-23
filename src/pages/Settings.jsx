import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStoreSettings, updateStoreSettings } from '../store/slices/dashboardSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useTheme } from '../app/ThemeContext';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useScrollTop } from '../hooks/useScrollTop';
import TaxSettings from '../components/settings/TaxSettings';

export default function Settings() {
  const dispatch = useDispatch();
  const isScrolled = useScrollTop();
  const { settings } = useSelector((state) => state.dashboard);
  const { theme, setTheme, glass, toggleGlass } = useTheme();
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);

  useEffect(() => {
    dispatch(fetchStoreSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings.data) {
      setIsAcceptingOrders(settings.data.isAcceptingOrders);
    }
  }, [settings.data]);

  const handleToggleOrders = async () => {
    const newValue = !isAcceptingOrders;
    setIsAcceptingOrders(newValue);
    try {
      await dispatch(updateStoreSettings({
        id: settings.data?.id,
        isAcceptingOrders: newValue
      })).unwrap();
      toast.success(newValue ? 'Store is now accepting orders' : 'Order taking paused');
    } catch (e) {
      toast.error('Failed to update store settings');
      setIsAcceptingOrders(!newValue);
    }
  };

  return (
    <div className="flex flex-col min-h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-8 max-w-4xl mx-auto">
      <div className={cn(
        "sticky top-0 z-30 flex justify-between items-center flex-wrap gap-4 transition-all duration-300",
        isScrolled 
          ? "bg-[var(--bg-panel)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-md rounded-2xl px-6 py-4 mt-2" 
          : "bg-transparent border-transparent py-2"
      )}>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] mb-1">Settings</h1>
          <p className="text-[var(--text-muted)] text-sm">Manage your preferences, appearance, and store status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance & Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium text-[var(--text-main)]">Theme Preference</h4>
              <p className="text-sm text-[var(--text-muted)] mb-3 mt-1">
                Toggle between light and dark modes, or sync with your system.
              </p>
              <div className="flex space-x-2 bg-[var(--bg-panel-hover)] p-1 rounded-lg w-fit border border-[var(--border-color)]">
                {['light', 'dark', 'system'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      if (theme !== t) setTheme(t);
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                      theme === t 
                        ? 'bg-[var(--color-primary)] text-white shadow' 
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-[var(--text-main)]">Glassmorphism UI</h4>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Enable frosted glass panels and animated background.
                  </p>
                </div>
                <button
                  onClick={toggleGlass}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    glass ? 'bg-[var(--color-primary)]' : 'bg-[var(--bg-panel-hover)] border border-[var(--border-color)]'
                  }`}
                >
                  <span className="sr-only">Toggle glass mode</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      glass ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-panel-hover)]">
              <div>
                <h4 className="font-medium text-[var(--text-main)]">Accepting Orders</h4>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Toggle whether customers can place new orders on the frontend.
                </p>
              </div>
              <button
                onClick={handleToggleOrders}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  isAcceptingOrders ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              >
                <span className="sr-only">Toggle order taking</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAcceptingOrders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <TaxSettings />
    </div>
  );
}
