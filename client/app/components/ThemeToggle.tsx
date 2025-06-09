"use client";

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {  
    toggleTheme();
  };

  return (
    <button 
      type="button"
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 9999,
        backgroundColor: theme === 'light' ? 'white' : '#1f2937',
        color: theme === 'light' ? '#374151' : '#f9fafb',
        border: `2px solid ${theme === 'light' ? '#d1d5db' : '#6b7280'}`,
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '18px',
        transition: 'all 0.2s ease'
      }}
      onClick={handleToggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
} 