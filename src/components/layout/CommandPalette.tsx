import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileCode2, LayoutDashboard, Settings, UserPlus, CreditCard, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './CommandPalette.css';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const actions = [
    { id: 'new-qr', title: 'Create New QR Code', icon: FileCode2, route: '/builder' },
    { id: 'dashboard', title: 'Go to Dashboard', icon: LayoutDashboard, route: '/projects' },
    { id: 'settings', title: 'Account Settings', icon: Settings, route: '/settings' },
    { id: 'billing', title: 'Billing & Plan', icon: CreditCard, route: '/settings' },
    { id: 'invite', title: 'Invite Team Member', icon: UserPlus, route: '/users' },
  ];

  const filteredActions = actions.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const action = filteredActions[selectedIndex];
        if (action) {
          handleSelect(action.route);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose]);

  const handleSelect = (route: string) => {
    navigate(route);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="command-overlay" onClick={onClose}>
      <div className="command-modal" onClick={e => e.stopPropagation()}>
        <div className="command-header">
          <Search className="command-search-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="command-input"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button className="command-close" onClick={onClose}>
            <span style={{ fontSize: '10px', fontWeight: 600 }}>ESC</span>
          </button>
        </div>
        
        <div className="command-body">
          {filteredActions.length > 0 ? (
            <div className="command-section">
              <div className="command-section-title">Quick Actions</div>
              {filteredActions.map((action, index) => (
                <div 
                  key={action.id}
                  className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSelect(action.route)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="command-item-left">
                    <action.icon size={16} />
                    <span>{action.title}</span>
                  </div>
                  {index === selectedIndex && (
                    <ChevronRight size={16} className="command-item-right" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="command-empty">
              No results found for "{search}"
            </div>
          )}
        </div>
        
        <div className="command-footer">
          <div className="command-footer-hint">
            <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
            <span><kbd>↵</kbd> to select</span>
          </div>
        </div>
      </div>
    </div>
  );
};
