import React from 'react';
import { CalendarCheck, Dumbbell, TrendingUp, History, Target } from 'lucide-react';
import { getLevelProgress } from '../../utils/xp';

export default function DashboardLayout({
  children,
  activeTab,
  onViewChange,
  summaryPanel,
  sidebarOpen,
  onToggleSidebar,
  isMobile,
  onOpenSidebar,
  onCloseSidebar,
  xp = 0,
  theme = 'dark',
  onToggleTheme,
}) {
  const { level } = getLevelProgress(xp);
  return (
    <div className={`layout-3col animate-fade-in ${!sidebarOpen && !isMobile ? 'desktop-collapsed' : ''}`}>

      
      <div className="mobile-header">
        <button className="mobile-logo" style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => onViewChange('hero')}>
          <span className="sidebar-logo-icon">T</span>
          Trainr
        </button>
        <button
          onClick={onToggleTheme}
          className="mobile-theme-toggle"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          {theme === 'dark' ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      </div>

      <aside className={`layout-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button
            className="sidebar-logo"
            style={{ textDecoration: 'none', display: sidebarOpen ? 'flex' : 'none', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={() => { onViewChange('hero'); if (isMobile) onCloseSidebar(); }}
          >
            <span className="sidebar-logo-icon">T</span>
            <span className="sidebar-logo-text">Trainr</span>
          </button>
          {isMobile ? (
            <button className="sidebar-close-btn" onClick={onCloseSidebar} aria-label="Close menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          ) : (
            <button className="sidebar-toggle-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
            </button>
          )}
        </div>

        <div className="sidebar-nav">
          <div className="sidebar-section-title">Training</div>
          <div
            className={`sidebar-link ${activeTab === 'plan' ? 'active' : ''}`}
            onClick={() => { onViewChange('results'); if (isMobile) onCloseSidebar(); }}
          >
            <CalendarCheck size={20} className="sidebar-icon" />
            <span className="sidebar-link-text">My Plan</span>
          </div>
          <div
            className={`sidebar-link ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => { onViewChange('library'); if (isMobile) onCloseSidebar(); }}
          >
            <Dumbbell size={20} className="sidebar-icon" />
            <span className="sidebar-link-text">Exercise Library</span>
          </div>

          <div className="sidebar-section-title">Track</div>
          <div
            className={`sidebar-link ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => { onViewChange('progress'); if (isMobile) onCloseSidebar(); }}
          >
            <TrendingUp size={20} className="sidebar-icon" />
            <span className="sidebar-link-text">Progress</span>
          </div>
          <div
            className={`sidebar-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => { onViewChange('history'); if (isMobile) onCloseSidebar(); }}
          >
            <History size={20} className="sidebar-icon" />
            <span className="sidebar-link-text">History</span>
          </div>
          <div
            className={`sidebar-link ${activeTab === 'goal' ? 'active' : ''}`}
            onClick={() => { onViewChange('goal'); if (isMobile) onCloseSidebar(); }}
          >
            <Target size={20} className="sidebar-icon" />
            <span className="sidebar-link-text">Goal</span>
          </div>
        </div>

        <div className="sidebar-spacer" />

        <button
          onClick={onToggleTheme}
          className="sidebar-theme-toggle"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
          <span className="sidebar-link-text">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className={`sidebar-profile ${sidebarOpen ? '' : 'collapsed'}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <div className="profile-avatar">S</div>
            <div className="profile-info">
              <div className="profile-name">Shruti Sharma</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600', marginTop: '2px' }}>
                Lv{level.index + 1} {level.name}
              </div>
            </div>
          </div>
          {(!sidebarOpen && !isMobile) && (
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '700', marginTop: '4px', textAlign: 'center' }}>
              Lv{level.index + 1}
            </div>
          )}
        </div>
      </aside>

      <main className="layout-main">
        {children}
      </main>

      {summaryPanel && (
        <aside className="layout-summary">
          {summaryPanel}
        </aside>
      )}

      {isMobile && (
        <nav className="bottom-nav">
          <div className={`bottom-nav-item ${activeTab === 'plan' ? 'active' : ''}`} onClick={() => onViewChange('results')}>
            <CalendarCheck size={22} />
            <span>Plan</span>
          </div>
          <div className={`bottom-nav-item ${activeTab === 'library' ? 'active' : ''}`} onClick={() => onViewChange('library')}>
            <Dumbbell size={22} />
            <span>Library</span>
          </div>
          <div className={`bottom-nav-item ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => onViewChange('progress')}>
            <TrendingUp size={22} />
            <span>Progress</span>
          </div>
          <div className={`bottom-nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => onViewChange('history')}>
            <History size={22} />
            <span>History</span>
          </div>
          <div className={`bottom-nav-item ${activeTab === 'goal' ? 'active' : ''}`} onClick={() => onViewChange('goal')}>
            <Target size={22} />
            <span>Goal</span>
          </div>
        </nav>
      )}
    </div>
  );
}