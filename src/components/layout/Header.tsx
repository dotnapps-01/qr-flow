import React from 'react';
import { Search, Bell, Command, ChevronDown, Menu } from 'lucide-react';
import './Header.css';
import { Button } from '../ui/Button';

export interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="header">
      <div className="header-left">
        <Button variant="ghost" size="icon" className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu className="header-icon" />
        </Button>
        
        <div className="mobile-header-logo" style={{ alignItems: 'center', gap: '10px', marginRight: 'var(--space-4)' }}>
          <img src="/logo.png" alt="QRFLOW Logo" style={{ width: '28px', height: '28px' }} />
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
        
        <div className="workspace-switcher">
          <div className="workspace-avatar">W</div>
          <span className="workspace-name">My Workspace</span>
          <ChevronDown className="workspace-chevron" />
        </div>
      </div>
    </header>
  );
};
