
import React from 'react';
import { Theme, ViewMode, AppColor, ToolMode } from '../types';
import { t } from '../services/translations';

interface HeaderProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  toolMode: ToolMode;
  onToolModeChange: (mode: ToolMode) => void;
  colorScheme: AppColor;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentTheme, 
  onThemeChange, 
  currentView, 
  onViewChange,
  toolMode,
  onToolModeChange,
  colorScheme,
  onOpenSettings
}) => {
  const themes: Theme[] = ['light', 'dark'];
  const nav = t.nav;

  // Color specific styles
  const colorStyles: Record<AppColor, { pill: string; activeText: string }> = {
    blue: { pill: 'bg-blue-600 ring-blue-600', activeText: 'text-white' },
    orange: { pill: 'bg-orange-500 ring-orange-500', activeText: 'text-white' },
    green: { pill: 'bg-green-600 ring-green-600', activeText: 'text-white' },
    indigo: { pill: 'bg-indigo-600 ring-indigo-600', activeText: 'text-white' },
    rose: { pill: 'bg-rose-500 ring-rose-500', activeText: 'text-white' },
    red: { pill: 'bg-red-600 ring-red-600', activeText: 'text-white' },
  };

  const currentColorStyle = colorStyles[colorScheme] || colorStyles.blue;

  // Helper to calculate pill position for Theme
  const getPillPosition = () => {
    const index = themes.indexOf(currentTheme);
    // w-12 (3rem) per button
    switch (index) {
        case 0: return 'translate-x-0';
        case 1: return 'translate-x-[3rem]';
        default: return 'translate-x-0';
    }
  };

  const getThemeIcon = (theme: Theme) => {
    switch (theme) {
      case 'light':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
        );
      case 'dark':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
             <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        );
    }
  };

  return (
    <header className="bg-t-surface border-b border-t-border sticky top-0 z-20 shadow-sm transition-all duration-300 py-3">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
            {/* Main Navigation with Sliding Animation */}
            <nav className="relative flex items-center gap-1 bg-t-surface-alt/50 p-1 rounded-full border border-t-border/50">
                
                {/* Sliding Background Indicator */}
                <div 
                    className={`
                        absolute top-1 bottom-1 left-1 w-20 rounded-full shadow-sm ring-1 
                        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                        ${currentView === 'profile' ? 'translate-x-[5.25rem]' : 'translate-x-0'}
                        ${currentColorStyle.pill}
                    `}
                />

                <button
                    type="button"
                    onClick={() => onViewChange('checker')}
                    className={`
                        relative z-10 w-20 py-1.5 rounded-full text-xs font-semibold text-center transition-colors duration-200 select-none
                        ${currentView === 'checker' ? currentColorStyle.activeText : 'text-t-muted hover:text-t-text'}
                    `}
                >
                    {nav.tools}
                </button>
                <button
                    type="button"
                    onClick={() => onViewChange('profile')}
                    className={`
                        relative z-10 w-20 py-1.5 rounded-full text-xs font-semibold text-center transition-colors duration-200 select-none
                        ${currentView === 'profile' ? currentColorStyle.activeText : 'text-t-muted hover:text-t-text'}
                    `}
                >
                    {nav.profile}
                </button>
            </nav>

            {/* Sub-Navigation (Writing/Study) - Only visible in Checker view */}
            {currentView === 'checker' && (
              <div className="hidden sm:flex items-center gap-1 bg-t-surface-alt/30 p-1 rounded-full border border-t-border/30 ml-2 animate-fade-in">
                  <button
                      onClick={() => onToolModeChange('writing')}
                      className={`
                          px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200
                          ${toolMode === 'writing' ? 'bg-t-surface text-t-text shadow-sm border border-t-border/50' : 'text-t-muted hover:text-t-text'}
                      `}
                  >
                      {nav.writing}
                  </button>
                  <button
                      onClick={() => onToolModeChange('study')}
                      className={`
                          px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200
                          ${toolMode === 'study' ? 'bg-t-surface text-t-text shadow-sm border border-t-border/50' : 'text-t-muted hover:text-t-text'}
                      `}
                  >
                      {nav.study}
                  </button>
              </div>
            )}
        </div>

        {/* Theme and Settings */}
        <div className="flex items-center justify-end gap-3">
            
            <div className="relative flex items-center bg-t-surface-alt p-1 rounded-full border border-t-border transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                
                {/* Sliding Pill for Active Theme */}
                <div 
                    className={`
                        absolute top-1 bottom-1 left-1 w-12 rounded-full bg-t-surface shadow-sm ring-1 ring-t-border
                        transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                        ${getPillPosition()}
                    `}
                />

                {themes.map((theme) => {
                    const isActive = currentTheme === theme;
                    
                    let activeColorClass = 'text-t-text';
                    if (isActive) {
                        if (theme === 'light') activeColorClass = 'text-yellow-500';
                        if (theme === 'dark') activeColorClass = 'text-blue-500';
                    }

                    return (
                    <button
                        key={theme}
                        type="button"
                        onClick={() => onThemeChange(theme)}
                        title={`${theme} theme`}
                        className={`
                        relative z-10 w-12 py-1.5 text-xs font-semibold capitalize text-center transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center justify-center select-none
                        ${isActive ? activeColorClass : 'text-t-muted hover:text-t-text'}
                        `}
                    >
                        <div className={`transition-transform duration-700 ease-in-out ${isActive ? 'rotate-[360deg]' : 'rotate-0'}`}>
                            {getThemeIcon(theme)}
                        </div>
                    </button>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={onOpenSettings}
                className="p-2 rounded-full text-t-muted hover:text-t-text hover:bg-t-surface-alt transition-all duration-300 select-none"
                title="API Settings"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
            </button>

        </div>
      </div>
    </header>
  );
};
