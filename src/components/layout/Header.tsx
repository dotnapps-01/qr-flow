import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Command, ChevronDown, Menu, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Guest';
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <Button variant="ghost" size="icon" className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu className="header-icon" />
        </Button>
        
        <div className="mobile-header-logo" style={{ alignItems: 'center', gap: '10px', marginRight: 'var(--space-4)' }}>
          <img src="/logo.png" alt="QRFLOW Logo" style={{ width: '34px', height: '34px' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800, fontSize: '18px', lineHeight: 1, letterSpacing: '-0.5px' }}>QRFLOW</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>By Dotn Apps</span>
          </div>
        </div>

        <div className="search-bar">
          <Search className="search-icon" />
          <input type="text" placeholder="Search anything..." className="search-input" />
          <div className="command-shortcut">
            <Command className="shortcut-icon" />
            <span>K</span>
          </div>
        </div>
      </div>
      
      <div className="header-right">
        <Button variant="ghost" size="icon" className="header-action-btn">
          <Bell className="header-icon" />
        </Button>
        
        {user ? (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div 
              className="workspace-switcher" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ cursor: 'pointer' }}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt={displayName} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
              ) : (
                <div className="workspace-avatar" style={{ textTransform: 'uppercase' }}>
                  {initial}
                </div>
              )}
              <span className="workspace-name">{displayName}</span>
              <ChevronDown className="workspace-chevron" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>

            {isDropdownOpen && (
              <div style={{ 
                position: 'absolute', 
                top: 'calc(100% + 8px)', 
                right: 0, 
                width: '200px', 
                backgroundColor: 'var(--bg-card)', 
                borderRadius: 'var(--radius-lg)', 
                boxShadow: 'var(--shadow-lg), 0 0 0 1px var(--border-light)', 
                padding: 'var(--space-2)',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div 
                  onClick={() => {
                    navigate('/settings');
                    setIsDropdownOpen(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '14px', color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Settings size={16} color="var(--text-muted)" />
                  Account Settings
                </div>
                
                <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '4px 0' }}></div>
                
                <div 
                  onClick={async () => {
                    await logout();
                    setIsDropdownOpen(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '14px', color: 'var(--danger)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={16} />
                  Log Out
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="workspace-switcher" style={{ cursor: 'default' }}>
             <span className="workspace-name">Guest</span>
          </div>
        )}
      </div>
    </header>
  );
};
