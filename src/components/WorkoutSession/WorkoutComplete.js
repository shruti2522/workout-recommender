import React, { useEffect, useState, useMemo } from 'react';
import { calculateStreak, XP_PER_SESSION, getLevelProgress } from '../../utils/xp';
import { ChevronLeft } from 'lucide-react';

export default function WorkoutComplete({
	elapsed,
	dayLabel,
	onBackToPlan,
	onHome,
	onViewChange,
	history = [],
	savedPlan = null,
	xp = 0,
}) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => setVisible(true), 60);
		return () => clearTimeout(t);
	}, []);

	function formatTime(s) {
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return `${m}m ${sec}s`;
	}

	const streak = useMemo(() => calculateStreak(history), [history]);

	const { thisWeekCount, daysCommitted } = useMemo(() => {
		const today = new Date();
		const dayOfWeek = today.getDay();
		const weekStart = new Date(today);
		weekStart.setDate(today.getDate() - dayOfWeek);
		weekStart.setHours(0, 0, 0, 0);
		const startStr = weekStart.toISOString().slice(0, 10);
		const count = (history || []).filter(h => h.date >= startStr).length;
		return { thisWeekCount: count, daysCommitted: 3 };
	}, [history]);

	const xpGained = XP_PER_SESSION;
	const { level } = getLevelProgress(xp);

	const nextDay = useMemo(() => {
		if (!savedPlan) return null;
		return savedPlan.find(d => !d.completed && d.label !== dayLabel) || null;
	}, [savedPlan, dayLabel]);

	const weekComplete = thisWeekCount >= daysCommitted;

	return (
		<div className="complete-page animate-fade-in">
			<div className={`complete-card ${visible ? 'visible' : ''}`}>

				<div className="complete-left">
					<h1 className="complete-title">Session Done!</h1>
					<p className="complete-day-label">{dayLabel}</p>

					<div className="complete-xp-banner">
						<span className="complete-xp-pill">+{xpGained} XP</span>
						<span className="complete-xp-level">Lv{level.index + 1} {level.name}</span>
					</div>

					<div className="complete-stats">
						<div className="complete-stat">
							<span className="complete-stat-value">{formatTime(elapsed)}</span>
							<span className="complete-stat-label">Duration</span>
						</div>
						<div className="complete-stat-divider" />
						<div className="complete-stat">
							<span className="complete-stat-value">
								{streak > 0 ? `${streak}` : '–'}
							</span>
							<span className="complete-stat-label">Day Streak</span>
						</div>
						<div className="complete-stat-divider" />
						<div className="complete-stat">
							<span className="complete-stat-value">
								{thisWeekCount}/{daysCommitted}
							</span>
							<span className="complete-stat-label">This Week</span>
						</div>
					</div>

					{weekComplete ? (
						<div className="complete-week-banner complete-week-done">
							<span>Week target complete — you crushed it!</span>
						</div>
					) : (
						<div className="complete-week-banner">
							<span>
								{daysCommitted - thisWeekCount} more session{daysCommitted - thisWeekCount !== 1 ? 's' : ''} to hit your weekly goal
							</span>
						</div>
					)}

					{streak >= 3 && (
						<p className="complete-streak-msg">
							{streak > 7
								? `${streak}-day streak — you're unstoppable!`
								: streak > 3
									? `${streak}-day streak — incredible momentum!`
									: `${streak}-day streak — keep the chain going!`}
						</p>
					)}
				</div>

				<div className="complete-right">
					{nextDay && (
						<div className="complete-next-preview">
							<div className="complete-next-label">Up next</div>
							<div className="complete-next-name">{nextDay.label}</div>
							<div className="complete-next-meta">
								{nextDay.exercises?.length ?? 0} exercises
							</div>
						</div>
					)}

					<div className="complete-actions">
						<button
							id="back-to-plan-btn"
							className="btn btn-primary btn-lg"
							onClick={onBackToPlan}
							style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
						>
							<ChevronLeft size={16} /> Back to Plan
						</button>
						{onViewChange && (
							<button
								className="btn btn-secondary"
								onClick={() => onViewChange('progress')}
							>
								View Progress
							</button>
						)}
						<button
							className="btn btn-ghost"
							onClick={onHome}
						>
							Start Over
						</button>
					</div>
				</div>

			</div>
		</div>
	);
}
