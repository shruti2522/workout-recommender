import React, { useMemo, useState } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';

import { getLevelProgress, ALL_BADGES, RARITY_STYLES } from '../../utils/xp';
import {
	Flame, Activity, Calendar, Dumbbell, Target, Shield,
	Thermometer, Star, Sunrise, Zap, Crown, RefreshCw,
	RefreshCcw, Lock,
} from 'lucide-react';

const ICON_MAP = {
	flame: Flame, activity: Activity, calendar: Calendar, dumbbell: Dumbbell,
	target: Target, shield: Shield, thermometer: Thermometer, star: Star,
	sunrise: Sunrise, zap: Zap, crown: Crown, 'refresh-cw': RefreshCw,
};

const GOAL_META = {
	build_muscle: { label: 'Build Muscle', icon: Dumbbell, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
	lose_weight: { label: 'Lose Weight', icon: Flame, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
	improve_endurance: { label: 'Improve Endurance', icon: Activity, color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
	increase_flexibility: { label: 'Increase Flexibility', icon: Target, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
	general_fitness: { label: 'General Fitness', icon: Zap, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

const AREA_META = {
	upper_body: { label: 'Upper Body', muscles: 'Chest, Back, Shoulders & Arms' },
	lower_body: { label: 'Lower Body', muscles: 'Quads, Hamstrings, Glutes & Calves' },
	core: { label: 'Core & Abs', muscles: 'Abdominals, Obliques & Stability' },
	full_body: { label: 'Full Body', muscles: 'Balanced across all muscle groups' },
};

const FREQ_LABELS = {
	'2': '2 days / week', '3': '3 days / week',
	'4': '4 days / week', '5': '5 days / week', '6': '6 days / week',
};

const DURATION_LABELS = {
	under_6m: 'Just starting out (under 6m)',
	returning: 'Returning after a break',
	'6m_2y': 'A year or two',
	'2y_plus': 'Several years',
};

function MilestoneJourney({ milestones, title }) {
	return (
		<div className="milestone-list" style={{ marginBottom: '24px' }}>
			<div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px' }}>{title}</div>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
				{milestones.map((m, i) => (
					<div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', opacity: m.done ? 0.6 : 1 }}>
						<div style={{
							width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
							border: m.done ? 'none' : '1.5px solid var(--border-subtle)',
							background: m.done ? 'var(--text-muted)' : 'transparent',
							display: 'flex', alignItems: 'center', justifyContent: 'center'
						}}>
							{m.done && (
								<svg width="10" height="10" viewBox="0 0 12 12" fill="none">
									<polyline points="2,6 5,9 10,3" stroke="var(--bg-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							)}
						</div>
						<div style={{ flex: 1 }}>
							<div style={{ fontSize: '0.9rem', color: m.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: m.done ? 'line-through' : 'none' }}>
								{m.text}
							</div>
							{m.active && !m.done && (
								<div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Working on this right now</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default function GoalPage({
	prefs,
	savedPlan,
	habitContract,
	momentum = {},
	history = [],
	streak = 0,
	onReset,
	onViewChange,
	sidebarOpen,
	onToggleSidebar,
	isMobile,
	onOpenSidebar,
	onCloseSidebar,
	unlockedBadgeIds = [],
	xp = 0,
	theme = 'dark',
	onToggleTheme,
	onUpdatePrefs,
	onUpdateHabitContract,
}) {
	const [activeMilestoneTab, setActiveMilestoneTab] = useState('short');
	const { level } = getLevelProgress(xp);
	const goalMeta = GOAL_META[prefs?.goal] || { label: prefs?.goal || 'Not set', icon: Target, color: '#64748b', bg: 'rgba(100,116,139,0.12)' };

	const totalSessions = history?.length ?? 0;
	const currentStreak = streak || 0;
	const daysPerWeek = habitContract?.daysPerWeek ?? parseInt(prefs?.frequency) ?? 3;

	const consistentWeeks = useMemo(() => {
		if (!history || history.length === 0) return 0;
		const weekMap = {};
		history.forEach(h => {
			const date = new Date(h.date);
			const weekStart = new Date(date);
			const dayOffset = (date.getDay() + 6) % 7;
			weekStart.setDate(date.getDate() - dayOffset);
			const weekKey = weekStart.toISOString().slice(0, 10);
			weekMap[weekKey] = (weekMap[weekKey] || 0) + 1;
		});
		return Object.values(weekMap).filter(count => count >= daysPerWeek).length;
	}, [history, daysPerWeek]);

	const thisWeekCount = useMemo(() => {
		const today = new Date();
		const dayOffset = (today.getDay() + 6) % 7;
		const weekStart = new Date(today);
		weekStart.setDate(today.getDate() - dayOffset);
		weekStart.setHours(0, 0, 0, 0);
		const startStr = weekStart.toISOString().slice(0, 10);
		return (history || []).filter(h => h.date >= startStr).length;
	}, [history]);

	const habitSummary = useMemo(() => {
		const remaining = Math.max(0, daysPerWeek - thisWeekCount);
		if (thisWeekCount >= daysPerWeek) return { text: 'Week complete! You hit your target.', accent: 'var(--accent-success)' };
		if (remaining === 1) return { text: `1 more session this week to hit your goal.`, accent: '#f59e0b' };
		return { text: `${remaining} more sessions this week to hit your ${daysPerWeek}× goal.`, accent: 'var(--text-secondary)' };
	}, [daysPerWeek, thisWeekCount]);

	const etaMessage = useMemo(() => {
		if (totalSessions === 0) return null;
		const sessionsPerWeek = daysPerWeek;
		const goal = prefs?.goal || 'general_fitness';
		const targetSessions = goal === 'lose_weight' ? 15 : goal === 'increase_flexibility' ? 10 : 12;
		const remaining = Math.max(0, targetSessions - totalSessions);
		if (remaining === 0) return '✓ First major milestone reached!';
		const weeksLeft = Math.ceil(remaining / sessionsPerWeek);
		return `At your pace, ~${weeksLeft} week${weeksLeft !== 1 ? 's' : ''} to your first major milestone.`;
	}, [totalSessions, daysPerWeek, prefs?.goal]);

	const { shortTermGoals, longTermGoals } = useMemo(() => {
		const shortItems = [
			{ text: 'Complete first workout', done: totalSessions >= 1 },
			{ text: `Earn your first 50 XP`, done: xp >= 50 },
			{ text: `Hit your weekly target (${daysPerWeek} sessions)`, done: thisWeekCount >= daysPerWeek || consistentWeeks >= 1 },
			{ text: `Unlock your first badge`, done: unlockedBadgeIds.length >= 1 },
			{ text: `Build a 3-day streak`, done: currentStreak >= 3 },
			{ text: `Reach the 'Athlete' rank (150 XP)`, done: xp >= 150 },
		];

		const longItems = [
			{ text: `Maintain consistency for 3 weeks`, done: consistentWeeks >= 3 },
			{ text: `Unlock 5 achievement badges`, done: unlockedBadgeIds.length >= 5 },
			{ text: `Complete 25 total sessions`, done: totalSessions >= 25 },
			{ text: `Reach the 'Warrior' rank (400 XP)`, done: xp >= 400 },
			{ text: `Maintain consistency for 12 weeks`, done: consistentWeeks >= 12 },
			{ text: `Achieve a 30-day streak`, done: currentStreak >= 30 },
			{ text: `Unlock 10 achievement badges`, done: unlockedBadgeIds.length >= 10 },
			{ text: `Reach the 'Legend' rank (1400 XP)`, done: xp >= 1400 },
			{ text: `Complete 100 total sessions`, done: totalSessions >= 100 },
		];

		let foundActive = false;
		const processList = (items) => items.map(m => {
			const active = !m.done && !foundActive;
			if (active) foundActive = true;
			return { ...m, active };
		});

		return {
			shortTermGoals: processList(shortItems),
			longTermGoals: processList(longItems)
		};
	}, [totalSessions, currentStreak, daysPerWeek, consistentWeeks, xp, unlockedBadgeIds.length, thisWeekCount]);

	const targetAreas = prefs?.targetAreas ?? [];
	
	const injuries = prefs?.injuries ?? [];

	const [isEditingProfile, setIsEditingProfile] = useState(false);
	const [editPrefs, setEditPrefs] = useState(prefs || {});

	const handleEditProfileClick = () => {
		setEditPrefs(prefs || {});
		setIsEditingProfile(true);
	};

	const handleSaveProfileClick = () => {
		const toSave = { ...editPrefs };
		if (toSave.injuriesRaw !== undefined) {
			toSave.injuries = toSave.injuriesRaw.split(',').map(s => s.trim()).filter(Boolean);
			delete toSave.injuriesRaw;
		}
		if (onUpdatePrefs) onUpdatePrefs(toSave);
		if (habitContract && onUpdateHabitContract) {
			onUpdateHabitContract({
				...habitContract,
				daysPerWeek: parseInt(editPrefs.frequency) || 3,
				sessionLength: parseInt((editPrefs.sessionDuration || '45_60').split('_')[0]) || 45
			});
		}
		setIsEditingProfile(false);
	};

	const toggleArrayItem = (key, val) => {
		setEditPrefs(prev => {
			const arr = prev[key] || [];
			if (arr.includes(val)) return { ...prev, [key]: arr.filter(x => x !== val) };
			return { ...prev, [key]: [...arr, val] };
		});
	};

	return (
		<DashboardLayout
			activeTab="goal"
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

				<div className="inner-page-header" style={{ marginBottom: '24px' }}>
					<h1 className="inner-page-title">My Goal</h1>
					<p className="inner-page-subtitle">
						Lv{level.index + 1} {level.name} <span style={{ opacity: 0.3 }}>|</span> {xp} XP <span style={{ opacity: 0.3 }}>|</span> <span style={{ color: habitSummary.accent }}>{habitSummary.text}</span>
					</p>
					{etaMessage && (
						<p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '500' }}>
							{etaMessage}
						</p>
					)}
				</div>

				<div style={{ marginBottom: '28px' }}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
						<div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>
							Training Profile
						</div>
						{!isEditingProfile ? (
							<button onClick={handleEditProfileClick} className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer' }}>Edit</button>
						) : (
							<button onClick={handleSaveProfileClick} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.75rem', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save Changes</button>
						)}
					</div>

					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
						{}
						<div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '20px 24px', border: '1px solid var(--border-subtle)' }}>
							{!isEditingProfile ? (
								<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
									<div>
										<div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Primary Goal</div>
										<div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{goalMeta.label}</div>
									</div>
									<div>
										<div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Frequency</div>
										<div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{FREQ_LABELS[prefs?.frequency] ?? prefs?.frequency}</div>
									</div>
									<div>
										<div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Experience</div>
										<div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{DURATION_LABELS[prefs?.duration] ?? prefs?.duration}</div>
									</div>
									<div>
										<div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Session Length</div>
										<div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{(prefs?.sessionDuration || '').replace('_', '–')} min</div>
									</div>
									<div>
										<div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Injuries / Restrictions</div>
										<div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
											{Array.isArray(prefs?.injuries) && prefs.injuries.length > 0 
												? prefs.injuries.join(', ') 
												: (prefs?.injuries || 'None')}
										</div>
									</div>
								</div>
							) : (
								<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
									<div>
										<label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>Primary Goal</label>
										<select value={editPrefs.goal || ''} onChange={e => setEditPrefs({...editPrefs, goal: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
											{Object.entries(GOAL_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
										</select>
									</div>
									<div>
										<label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>Frequency</label>
										<select value={editPrefs.frequency || ''} onChange={e => setEditPrefs({...editPrefs, frequency: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
											{Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
										</select>
									</div>
									<div>
										<label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>Experience</label>
										<select value={editPrefs.duration || ''} onChange={e => setEditPrefs({...editPrefs, duration: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
											{Object.entries(DURATION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
										</select>
									</div>
									<div>
										<label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>Session Length</label>
										<select value={editPrefs.sessionDuration || ''} onChange={e => setEditPrefs({...editPrefs, sessionDuration: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
											<option value="20_30">20–30 min</option>
											<option value="30_45">30–45 min</option>
											<option value="45_60">45–60 min</option>
											<option value="60_90">1+ hours</option>
										</select>
									</div>
									<div>
										<label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>Injuries / Restrictions</label>
										<input 
											type="text" 
											placeholder="e.g. Knee pain, lower back (comma separated)"
											value={editPrefs.injuriesRaw !== undefined ? editPrefs.injuriesRaw : (Array.isArray(editPrefs.injuries) ? editPrefs.injuries.join(', ') : (editPrefs.injuries || ''))} 
											onChange={e => setEditPrefs({...editPrefs, injuriesRaw: e.target.value})} 
											style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
										/>
									</div>
								</div>
							)}
						</div>

						{}
						<div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '20px 24px', border: '1px solid var(--border-subtle)' }}>
							{!isEditingProfile ? (
								<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
									<div>
										<div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>Focus Areas</div>
										<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
											{targetAreas.length > 0 ? targetAreas.map(key => (
												<span key={key} style={{ padding: '4px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
													{AREA_META[key]?.label || key}
												</span>
											)) : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Body</span>}
										</div>
									</div>
									<div>
										<div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>Equipment</div>
										<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
											{prefs?.equipment?.map(eq => (
												<span key={eq} style={{ padding: '4px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
													{eq}
												</span>
											))}
											{(!prefs?.equipment?.length) && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None specified</span>}
										</div>
									</div>
								</div>
							) : (
								<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
									<div>
										<label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>Focus Areas</label>
										<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
											{Object.keys(AREA_META).map(area => {
												const active = (editPrefs.targetAreas||[]).includes(area);
												return (
												<button key={area} onClick={() => toggleArrayItem('targetAreas', area)} style={{ padding: '6px 14px', borderRadius: '20px', border: active ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)', background: active ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-elevated)', color: active ? 'var(--accent-primary)' : 'var(--text-primary)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
													{AREA_META[area].label}
												</button>
											)})}
										</div>
									</div>
									<div>
										<label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>Equipment</label>
										<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
											{['No equipment (bodyweight)', 'Dumbbells', 'Gym machines', 'Barbell', 'Cables', 'Resistance bands'].map(eq => {
												const active = (editPrefs.equipment||[]).includes(eq);
												return (
												<button key={eq} onClick={() => toggleArrayItem('equipment', eq)} style={{ padding: '6px 14px', borderRadius: '20px', border: active ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)', background: active ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-elevated)', color: active ? 'var(--accent-primary)' : 'var(--text-primary)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
													{eq}
												</button>
											)})}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="prog-section-card">
					<div className="prog-section-header" style={{ marginBottom: '20px' }}>
						<span className="prog-section-title">Milestones</span>
						<div style={{ display: 'flex', gap: '8px', background: 'var(--bg-elevated)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
							<button 
								onClick={() => setActiveMilestoneTab('short')}
								style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', background: activeMilestoneTab === 'short' ? 'var(--bg-surface)' : 'transparent', color: activeMilestoneTab === 'short' ? 'var(--text-primary)' : 'var(--text-muted)', border: 'none', boxShadow: activeMilestoneTab === 'short' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}
							>
								Short-Term
							</button>
							<button 
								onClick={() => setActiveMilestoneTab('long')}
								style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', background: activeMilestoneTab === 'long' ? 'var(--bg-surface)' : 'transparent', color: activeMilestoneTab === 'long' ? 'var(--text-primary)' : 'var(--text-muted)', border: 'none', boxShadow: activeMilestoneTab === 'long' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}
							>
								Long-Term
							</button>
						</div>
					</div>
					{activeMilestoneTab === 'short' ? (
						<MilestoneJourney milestones={shortTermGoals} title="Short-term Goals (Weekly)" />
					) : (
						<MilestoneJourney milestones={longTermGoals} title="Long-term Goals (Lifetime)" />
					)}
				</div>

				<div className="prog-section-card">
					<div className="prog-section-header">
						<span className="prog-section-title">Achievements</span>
						<span className="prog-section-sub">{unlockedBadgeIds.length} / {ALL_BADGES.length} unlocked</span>
					</div>
					<div className="goal-badges-grid">
						{ALL_BADGES.map(badge => {
							const isUnlocked = unlockedBadgeIds.includes(badge.id);
							const style = RARITY_STYLES[badge.rarity];
							const BadgeIcon = ICON_MAP[badge.icon] || Star;
							return (
								<div key={badge.id} className={`goal-badge-card ${isUnlocked ? 'unlocked' : ''}`}
									style={isUnlocked ? { background: style.bg, borderColor: style.border } : {}}
									title={badge.desc}
								>
									<div className="goal-badge-icon-wrap"
										style={isUnlocked ? { background: style.bg, borderColor: style.border, color: style.color } : {}}
									>
										{isUnlocked ? <BadgeIcon size={22} /> : <Lock size={16} color="var(--text-muted)" />}
									</div>
									<div className="goal-badge-name" style={isUnlocked ? { color: 'var(--text-primary)' } : {}}>
										{badge.name}
									</div>
									<div className="goal-badge-desc" style={isUnlocked ? { color: style.color } : {}}>
										{badge.desc}
									</div>
								</div>
							);
						})}
					</div>
				</div>

				<div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
					<button className="btn btn-primary" onClick={() => onViewChange('results')}>
						View My Plan
					</button>
					<button className="btn btn-secondary" onClick={onReset} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
						<RefreshCcw size={16} /> Rebuild Plan
					</button>
				</div>
			</div>
		</DashboardLayout>
	);
}
