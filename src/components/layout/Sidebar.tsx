import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusSquare, 
  FolderOpen, 
  LayoutTemplate, 
  BarChart3, 
  Settings, 
  Users, 
  CreditCard,
  QrCode
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'New QR', path: '/builder', icon: PlusSquare },
  { name: 'My QR Codes', path: '/projects', icon: FolderOpen },
  { name: 'Templates', path: '/templates', icon: LayoutTemplate },
  { name: 'Stats', path: '/stats', icon: BarChart3 },
];

const bottomNavItems = [
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Users', path: '/users', icon: Users },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  
  return (
    <aside className={clsx('sidebar', { 'open': isOpen })}>
      <div className="sidebar-header">
        <div className="logo">
          <img src="/logo.png" alt="QRFLOW Logo" className="logo-img" style={{ mixBlendMode: 'multiply' }} />
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
            <span className="logo-text" style={{ lineHeight: 1 }}>QRFLOW</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: 'normal', marginTop: '2px' }}>By Dotn Apps</span>
          </div>
        </div>
      </div>
      
      <div className="sidebar-scrollable">
        <nav className="sidebar-nav">
          <div className="nav-section-title">Menu</div>
          {navItems.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path} 
              onClick={onClose}
              className={({ isActive }) => clsx('nav-item', { 'nav-item-active': isActive })}
            >
              <item.icon className="nav-icon" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <nav className="sidebar-nav sidebar-bottom-nav">
          <div className="nav-section-title">Workspace</div>
          {bottomNavItems.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => clsx('nav-item', { 'nav-item-active': isActive })}
            >
              <item.icon className="nav-icon" />
              <span>{item.name}</span>
            </NavLink>
          ))}
          
          <div style={{ 
            marginTop: 'var(--space-4)', 
            padding: 'var(--space-3)', 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: 'var(--radius-md)', 
            fontSize: '11px', 
            color: 'var(--text-muted)', 
            textAlign: 'center', 
            lineHeight: '1.4' 
          }}>
            This app is free for now<br/>by <strong style={{ color: 'var(--text-primary)' }}>Dotn Apps</strong>
            
            <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              {user ? (
                <button 
                  onClick={async () => {
                    await logout();
                  }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', width: '100%' }}
                >
                  Log Out
                </button>
              ) : (
                <NavLink 
                  to="/login"
                  onClick={onClose}
                  style={{ display: 'block', background: 'transparent', border: 'none', color: 'var(--primary-btn-bg)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}
                >
                  Log In
                </NavLink>
              )}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};
