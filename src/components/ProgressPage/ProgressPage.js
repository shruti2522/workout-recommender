import React, { useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import WeeklyHabitRing from './WeeklyHabitRing';
import {
	Flame, Clock, CalendarOff, Dumbbell, Zap as ZapIcon,
	Leaf, Sword, Trophy, TrendingUp, CheckCircle,
} from 'lucide-react';
import { LEVELS, getLevelProgress, calculateStreak } from '../../utils/xp';

const LEVEL_ICON_MAP = {
	seedling: Leaf,
	zap: ZapIcon,
	flame: Flame,
	sword: Sword,
	trophy: Trophy,
};

function RecentSessions({ history }) {
	const sessions = useMemo(() => {
		if (!history) return [];
		return [...history].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
	}, [history]);

	if (sessions.length === 0) return null;

	return (
		<div className="recent-sessions-wrap">
			{sessions.map((session, i) => (
				<div key={i} className="recent-session-card">
					<div className="rsc-header">
						<span className="rsc-date">
							{new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
						</span>
						<CheckCircle className="rsc-icon" size={16} />
					</div>
					<div className="rsc-title">{session.dayLabel}</div>
					<div className="rsc-stats">
						<div className="rsc-stat">
							<Clock size={14} />
							<span>{Math.round((session.elapsed || 0) / 60)}m</span>
						</div>
						<div className="rsc-stat">
							<Dumbbell size={14} />
							<span>{session.totalSets || 0} sets</span>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

function MuscleBar({ muscle, percentage }) {
	return (
		<div className="prog-muscle-row">
			<span className="prog-muscle-name">{muscle}</span>
			<div className="prog-muscle-track">
				<div className="prog-muscle-fill" style={{ width: `${percentage}%` }} />
			</div>
			<span className="prog-muscle-pct">{percentage}%</span>
		</div>
	);
}

function XPLevelBar({ xp }) {
	const { level, pct, current, needed } = getLevelProgress(xp || 0);
	const nextLevel = LEVELS[level.index + 1];

	let totalProgressPct = 0;
	if (level.index === LEVELS.length - 1) {
		totalProgressPct = 100;
	} else {
		const segmentWidth = 100 / (LEVELS.length - 1);
		totalProgressPct = (level.index + (pct / 100)) * segmentWidth;
	}

	return (
		<div className="xp-level-bar-card">
			<div className="xp-level-bar-header" style={{ marginBottom: '24px' }}>
				<div className="xp-level-info">
					<div className="xp-level-badge" style={{ background: `${level.color}22`, border: `1px solid ${level.color}44` }}>
						<span style={{ color: level.color, fontWeight: '700', fontSize: '0.8rem' }}>Lv{level.index + 1} {level.name}</span>
					</div>
					<span className="xp-total">{xp} XP</span>
				</div>
				{nextLevel && (
					<span className="xp-next-label">
						{needed - current} XP to {nextLevel.name}
					</span>
				)}
			</div>
			
			<div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '12px' }}>
				<div style={{ position: 'absolute', top: '20px', left: '30px', right: '30px', height: '4px', background: 'var(--border-subtle)', zIndex: 0, borderRadius: '2px' }} />
				<div style={{ position: 'absolute', top: '20px', left: '30px', right: '30px', height: '4px', zIndex: 0 }}>
					<div style={{ width: `${totalProgressPct}%`, height: '100%', background: '#3b82f6', borderRadius: '2px', transition: 'width 0.5s ease', boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)' }} />
				</div>
				
				{LEVELS.map(lvl => {
					const isUnlocked = xp >= lvl.minXP;
					const Icon = LEVEL_ICON_MAP[lvl.icon] || Leaf;
					return (
						<div key={lvl.index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, width: '60px' }}>
							<div style={{ width: '44px', height: '44px', borderRadius: '50%', background: isUnlocked ? '#3b82f6' : 'var(--bg-base)', border: `2px solid ${isUnlocked ? '#fff' : 'var(--border-subtle)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', boxShadow: isUnlocked ? '0 0 10px rgba(59, 130, 246, 0.4)' : 'none' }}>
								<Icon size={20} color={isUnlocked ? '#fff' : 'var(--text-muted)'} />
							</div>
							<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
								<span style={{ fontSize: '0.75rem', fontWeight: '700', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>{lvl.name}</span>
								<span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{lvl.minXP} XP</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default function ProgressPage({
	savedPlan,
	history,
	xp = 0,
	completedQuests = [],
	habitContract,
	onViewChange,
	sidebarOpen,
	onToggleSidebar,
	isMobile,
	onOpenSidebar,
	onCloseSidebar,
	theme = 'dark',
	onToggleTheme,
}) {
	const streak = useMemo(() => calculateStreak(history || []), [history]);
	const daysPerWeek = habitContract?.daysPerWeek ?? 3;

	const totalStats = useMemo(() => {
		let sets = 0, reps = 0, mins = 0;
		(history ?? []).forEach(h => {
			sets += h.totalSets ?? 0;
			reps += h.totalReps ?? 0;
			mins += Math.round((h.elapsed ?? 0) / 60);
		});
		return { sets, reps, mins };
	}, [history]);

	const completedDays = useMemo(() => savedPlan?.filter(d => d.completed) ?? [], [savedPlan]);

	const muscleCoverage = useMemo(() => {
		const counts = {};
		completedDays.forEach(day => {
			(day.exercises ?? []).forEach(ex => {
				(ex.primaryMuscles ?? []).forEach(m => {
					const key = m.charAt(0).toUpperCase() + m.slice(1);
					counts[key] = (counts[key] ?? 0) + (ex.sets ?? 1);
				});
			});
		});
		const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
		return Object.entries(counts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 6)
			.map(([muscle, count]) => ({ muscle, percentage: Math.round((count / total) * 100) }));
	}, [completedDays]);

	const consistentWeeks = useMemo(() => {
		if (!history || history.length === 0) return 0;
		const weekMap = {};
		history.forEach(h => {
			const date = new Date(h.date);
			const weekStart = new Date(date);
			weekStart.setDate(date.getDate() - date.getDay());
			const weekKey = weekStart.toISOString().slice(0, 10);
			weekMap[weekKey] = (weekMap[weekKey] || 0) + 1;
		});
		return Object.values(weekMap).filter(count => count >= daysPerWeek).length;
	}, [history, daysPerWeek]);

	const momentumMsg = useMemo(() => {
		if (streak === 0 && (history?.length ?? 0) === 0) return null;
		if (streak >= 14) return { icon: null, text: `${streak} day streak, you're on fire! Don't stop now.`, accent: 'var(--accent-primary)' };
		if (streak >= 7) return { icon: null, text: `${streak} day streak, incredible consistency!`, accent: 'var(--accent-primary)' };
		if (streak >= 3) return { icon: null, text: `${streak} day streak, you're building momentum!`, accent: 'var(--accent-success)' };
		if (streak >= 1) return { icon: null, text: `${streak} day streak, keep showing up!`, accent: 'var(--accent-success)' };
		return { icon: null, text: "Ready to start a new streak?", accent: '#9ca3af' };
	}, [streak, history]);

	return (
		<DashboardLayout
			activeTab="progress"
			onViewChange={onViewChange}
			sidebarOpen={sidebarOpen}
			onToggleSidebar={onToggleSidebar}
			isMobile={isMobile}
			onOpenSidebar={onOpenSidebar}
			onCloseSidebar={onCloseSidebar}
			theme={theme}
			onToggleTheme={onToggleTheme}
			xp={xp}
		>
			<div className="inner-page animate-fade-in">
				<div className="inner-page-header">
					<h1 className="inner-page-title">Progress</h1>
					<p className="inner-page-subtitle">Your progress, week by week.</p>
				</div>

				{momentumMsg && (
					<div className="prog-momentum-msg" style={{ borderLeftColor: momentumMsg.accent }}>
						<span style={{ fontSize: '1.2rem' }}>{momentumMsg.icon}</span>
						<span style={{ color: momentumMsg.accent, fontWeight: '600', fontSize: '0.9rem' }}>{momentumMsg.text}</span>
					</div>
				)}

				<div className="prog-hero-row">
					<div className="prog-habit-hero">
						<div className="prog-habit-hero-label">This Week's Habit</div>
						<WeeklyHabitRing
							history={history || []}
							daysPerWeek={daysPerWeek}
							startDate={habitContract?.confirmedAt}
							size="lg"
							showLabel
						/>
					</div>

					<div className="prog-stats-grid">
						{[
							{ label: 'Day Streak', value: streak, unit: streak === 1 ? 'day' : 'days', icon: Flame, accent: streak > 0 },
							{ label: 'Sessions Done', value: history?.length ?? 0, unit: 'total', icon: CheckCircle, accent: false },
							{ label: 'Consistent Weeks', value: consistentWeeks, unit: 'weeks', icon: TrendingUp, accent: false },
							{ label: 'Time Trained', value: totalStats.mins, unit: 'min', icon: Clock, accent: false },
						].map(s => {
							const IconComponent = s.icon;
							return (
								<div key={s.label} className={`prog-stat-card ${s.accent ? 'prog-stat-accent' : ''}`}>
									<IconComponent className="prog-stat-icon" size={22} />
									<div className="prog-stat-val">
										{s.value}<span className="prog-stat-unit"> {s.unit}</span>
									</div>
									<div className="prog-stat-label">{s.label}</div>
								</div>
							);
						})}
					</div>
				</div>

				<XPLevelBar xp={xp} />

				<div className="prog-section-card" style={{ paddingRight: 0, paddingLeft: 0, overflow: 'hidden' }}>
					<div className="prog-section-header" style={{ padding: '0 16px' }}>
						<span className="prog-section-title">Recent Sessions</span>
						<span className="prog-section-sub">Your latest completed workouts</span>
					</div>
					{history && history.length > 0 ? (
						<div style={{ padding: '0 16px' }}>
							<RecentSessions history={history} />
						</div>
					) : (
						<div className="prog-empty" style={{ margin: '0 16px' }}>
							<CalendarOff className="prog-empty-icon" size={32} />
							<p>No sessions recorded yet. Complete your first workout to start tracking!</p>
						</div>
					)}
				</div>

				<div className="prog-section-card">
					<div className="prog-section-header">
						<span className="prog-section-title">Muscles Trained</span>
						<span className="prog-section-sub">Across {completedDays.length} completed session{completedDays.length !== 1 ? 's' : ''}</span>
					</div>
					{muscleCoverage.length > 0 ? (
						<div className="prog-muscles">
							{muscleCoverage.map(m => <MuscleBar key={m.muscle} {...m} />)}
						</div>
					) : (
						<div className="prog-empty">
							<Dumbbell className="prog-empty-icon" size={32} />
							<p>Complete sessions to see muscle coverage.</p>
						</div>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
}
