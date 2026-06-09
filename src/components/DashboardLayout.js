import React from 'react';

export default function DashboardLayout({ children, activeTab, onViewChange, summaryPanel }) {
  return (
    <div className="layout-3col animate-fade-in">
      {/* Left Sidebar */}
      <aside className="layout-sidebar">
        <a href="/" className="sidebar-logo" style={{textDecoration: "none"}} onClick={(e) => { e.preventDefault(); onViewChange('hero'); }}>
          <span className="sidebar-logo-icon">FS</span>
          FitSuggest
        </a>
        
        <div className="sidebar-section-title">Training</div>
        <div 
          className={`sidebar-link ${activeTab === 'plan' ? 'active' : ''}`}
          onClick={() => onViewChange('results')}
        >
          <span>My Plan</span>
        </div>
        <div 
          className={`sidebar-link ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => onViewChange('library')}
        >
          <span>Exercise Library</span>
        </div>
        <div className="sidebar-link">Schedule</div>
        
        <div className="sidebar-section-title">Track</div>
        <div className="sidebar-link">
          <span>Progress</span>
        </div>
        <div className="sidebar-link">History</div>
        <div className="sidebar-link">Goals</div>
        
        <div className="sidebar-spacer" />
        <div className="sidebar-link" onClick={() => onViewChange('wizard')}>Preferences</div>
        <div className="sidebar-link">Profile</div>
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
