import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { AmoudiMark } from '@/components/branding/AmoudiMark';
import { IGrid, IUsers, IFile, ICard, IChart, ILogout } from '@/components/ui/Icons';

interface NavItem {
  id: string;
  to: string;
  label: string;
  icon: React.ReactNode;
  financeOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', to: '/dashboard', label: 'Dashboard', icon: <IGrid size={18} /> },
  { id: 'non-iatas', to: '/non-iatas', label: 'Non-IATAs', icon: <IUsers size={18} /> },
  { id: 'sales-reports', to: '/sales-reports', label: 'Sales Reports', icon: <IFile size={18} /> },
  { id: 'payments', to: '/payments', label: 'Payments', icon: <ICard size={18} /> },
  { id: 'reports', to: '/reports', label: 'Reports', icon: <IChart size={18} /> },
];

interface SidebarProps {
  onCloseMobile?: () => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile, collapsed = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isFinance = user?.role === 'FINANCE';

  return (
    <aside
      className={`${collapsed ? 'w-20' : 'w-60'} flex-shrink-0 flex flex-col h-screen sticky top-0 z-30 select-none transition-all duration-200`}
      style={{ backgroundColor: '#0F2E22' }}
    >
      {/* Brand Header */}
      <div
        className={`px-4 py-5 border-b border-white/10 flex items-center ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <AmoudiMark size={34} onDark={true} />
          {!collapsed && (
            <div>
              <div className="font-josefin font-bold text-white text-sm leading-none tracking-widest">
                AMOUDI
              </div>
              <div
                className="text-xs mt-1 leading-none font-medium"
                style={{ color: '#CBA326' }}
              >
                Finance Management
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          if (item.financeOnly && !isFinance) {
            return null;
          }

          return (
            <NavLink
              key={item.id}
              to={item.to}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => `
                w-full flex items-center ${
                  collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
                } rounded-md text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'font-semibold'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
              `}
              style={({ isActive }) =>
                isActive
                  ? {
                      backgroundColor: 'rgba(203, 163, 38, 0.18)',
                      color: '#CBA326',
                    }
                  : undefined
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Information & Logout */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {!collapsed ? (
          <div className="px-3 py-2 rounded-md bg-white/5">
            <div className="text-white text-sm font-medium truncate">
              {user?.fullName || user?.username || 'User'}
            </div>
            <div className="text-xs text-white/50 flex items-center gap-1.5 mt-0.5">
              <span>{user?.role === 'FINANCE' ? 'Finance Team' : 'General Manager'}</span>
              <span>·</span>
              <span className="text-emerald-400">Active</span>
            </div>
          </div>
        ) : (
          <div
            className="flex justify-center py-1 text-xs text-white/70 font-semibold"
            title={user?.fullName || user?.username || 'User'}
          >
            {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
          </div>
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign out' : undefined}
          className={`w-full flex items-center ${
            collapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3.5 py-2'
          } rounded-md text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer`}
        >
          <ILogout size={18} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
};
