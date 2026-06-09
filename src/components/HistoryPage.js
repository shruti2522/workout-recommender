import React from 'react';
import DashboardLayout from './DashboardLayout';

function formatDuration(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function HistoryCard({ entry, index }) {
  const isRecent = index === 0;
  return (
    <div className={`history-card ${isRecent ? 'history-card-recent' : ''}`}>
      <div className="history-card-left">
        <div className="history-card-date">{formatDate(entry.date)}</div>
        <div className="history-card-label">{entry.dayLabel || 'Workout'}</div>
        {entry.muscles && entry.muscles.length > 0 && (
          <div className="history-card-muscles">
            {entry.muscles.slice(0, 4).map(m => (
              <span key={m} className="history-muscle-chip">{m}</span>
            ))}
          </div>
        )}
      </div>
      <div className="history-card-right">
        <div className="history-stat">
          <span className="history-stat-val">{formatDuration(entry.elapsed)}</span>
          <span className="history-stat-label">Duration</span>
        </div>
        <div className="history-stat">
          <span className="history-stat-val">{entry.totalSets ?? '—'}</span>
          <span className="history-stat-label">Sets</span>
        </div>
        <div className="history-stat">
          <span className="history-stat-val">{entry.exercises ?? '—'}</span>
          <span className="history-stat-label">Exercises</span>
        </div>
        {isRecent && <span className="history-recent-badge">Latest</span>}
      </div>
    </div>
  );
}

export default function HistoryPage({
  history,
  onViewChange,
  sidebarOpen,
  onToggleSidebar,
  isMobile,
  onOpenSidebar,
  onCloseSidebar,
}) {
  const sorted = [...(history ?? [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalTime = sorted.reduce((sum, h) => sum + (h.elapsed ?? 0), 0);
  const totalSets = sorted.reduce((sum, h) => sum + (h.totalSets ?? 0), 0);
  const avgDuration = sorted.length > 0 ? Math.round(totalTime / sorted.length / 60) : 0;

  return (
    <DashboardLayout
      activeTab="history"
      onViewChange={onViewChange}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={onToggleSidebar}
      isMobile={isMobile}
      onOpenSidebar={onOpenSidebar}
      onCloseSidebar={onCloseSidebar}
    >
      <div className="inner-page animate-fade-in">
        <div className="inner-page-header">
          <h1 className="inner-page-title">History</h1>
          <p className="inner-page-subtitle">Every session you've completed, logged automatically.</p>
        </div>

        {sorted.length > 0 ? (
          <>
            <div className="history-stats-row">
              {[
                { label: 'Total Sessions', value: sorted.length, icon: 'ti-history' },
                { label: 'Total Time', value: formatDuration(totalTime), icon: 'ti-clock' },
                { label: 'Total Sets', value: totalSets, icon: 'ti-repeat' },
                { label: 'Avg Session', value: `${avgDuration}m`, icon: 'ti-trending-up' },
              ].map(s => (
                <div key={s.label} className="history-summary-card">
                  <i className={`ti ${s.icon} history-summary-icon`} />
                  <div className="history-summary-val">{s.value}</div>
                  <div className="history-summary-label">{s.label}</div>
                </div>
              ))}
            </div>

			{/*session list*/}

            <div className="history-list">
              {sorted.map((entry, i) => (
                <HistoryCard key={entry.date + i} entry={entry} index={i} />
              ))}
            </div>
          </>
        ) : (
          <div className="history-empty">
            <div className="history-empty-icon">
              <i className="ti ti-history" />
            </div>
            <h2 className="history-empty-title">No sessions yet</h2>
            <p className="history-empty-sub">
              Complete your first workout and it'll appear here automatically.
            </p>
            <button className="btn btn-primary" onClick={() => onViewChange('results')}>
              <i className="ti ti-play" /> Go to My Plan
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
