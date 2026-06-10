import React from 'react';

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
}) {
  return (
    <div className={`layout-3col animate-fade-in ${!sidebarOpen && !isMobile ? 'desktop-collapsed' : ''}`}>

      {/* Mobile Header */}
      <div className="mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={onOpenSidebar}
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <button className="mobile-logo" style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => onViewChange('hero')}>
          <span className="sidebar-logo-icon">T</span>
          Trainr
        </button>
      </div>

      {/* Backdrop for mobile */}
      {sidebarOpen && isMobile && (
        <div className="sidebar-backdrop" onClick={onCloseSidebar} />
      )}

      {/* Left Sidebar */}
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
            <i className="ti ti-calendar-check sidebar-icon" aria-hidden="true" />
            <span className="sidebar-link-text">My Plan</span>
          </div>
          <div
            className={`sidebar-link ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => { onViewChange('library'); if (isMobile) onCloseSidebar(); }}
          >
            <i className="ti ti-barbell sidebar-icon" aria-hidden="true" />
            <span className="sidebar-link-text">Exercise Library</span>
          </div>

          <div className="sidebar-section-title">Track</div>
          <div
            className={`sidebar-link ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => { onViewChange('progress'); if (isMobile) onCloseSidebar(); }}
          >
            <i className="ti ti-trending-up sidebar-icon" aria-hidden="true" />
            <span className="sidebar-link-text">Progress</span>
          </div>
          <div
            className={`sidebar-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => { onViewChange('history'); if (isMobile) onCloseSidebar(); }}
          >
            <i className="ti ti-history sidebar-icon" aria-hidden="true" />
            <span className="sidebar-link-text">History</span>
          </div>
          <div
            className={`sidebar-link ${activeTab === 'goal' ? 'active' : ''}`}
            onClick={() => { onViewChange('goal'); if (isMobile) onCloseSidebar(); }}
          >
            <i className="ti ti-target sidebar-icon" aria-hidden="true" />
            <span className="sidebar-link-text">Goal</span>
          </div>
        </div>

        <div className="sidebar-spacer" />

        <div className={`sidebar-profile ${sidebarOpen ? '' : 'collapsed'}`}>
          <div className="profile-avatar">S</div>
          <div className="profile-info">
            <div className="profile-name">Shruti Sharma</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="layout-main">
        {children}
      </main>

      {/* Right Summary Panel (optional) */}
      {summaryPanel && (
        <aside className="layout-summary">
          {summaryPanel}
        </aside>
      )}
    </div>
  );
}
