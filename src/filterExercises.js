export const FREQUENCY_OPTIONS = [
  { key: '2', label: '2 sessions/week', desc: 'Low commitment, likely beginner', points: 1 },
  { key: '3', label: '3 sessions/week', desc: 'Standard beginner–intermediate range', points: 2 },
  { key: '4', label: '4 sessions/week', desc: 'Solidly intermediate', points: 3 },
  { key: '5', label: '5 sessions/week', desc: 'High frequency, intermediate–advanced', points: 4 },
  { key: '6', label: '6 sessions/week', desc: 'Advanced-level commitment', points: 5 },
];

export const DURATION_OPTIONS = [
  { key: 'under_6m', label: 'Under 6 months', desc: 'Still building movement patterns', points: 1 },
  { key: '6m_2y', label: '6 months – 2 years', desc: 'Comfortable, making steady progress', points: 2 },
  { key: '2y_plus', label: '2+ years', desc: 'Established base, slower gains', points: 3 },
];

export function inferLevel(frequencyKey, durationKey) {
  const freqOpt = FREQUENCY_OPTIONS.find(o => o.key === frequencyKey);
  const durOpt = DURATION_OPTIONS.find(o => o.key === durationKey);

  const freqPoints = freqOpt ? freqOpt.points : 1;
  const durPoints = durOpt ? durOpt.points : 1;

  const sum = freqPoints + durPoints; 

  const score = Math.round((sum / 8) * 10);

  let level = 'beginner';
  if (score >= 4 && score <= 7) level = 'intermediate';
  if (score >= 8) level = 'expert';

  return { level, score };
}

export function getDayCount(frequencyKey) {
  const parsed = parseInt(frequencyKey, 10);
  return isNaN(parsed) ? 3 : parsed;
}

const LEVEL_ORDER = ['beginner', 'intermediate', 'expert'];
export function allowedLevels(level) {
  const idx = LEVEL_ORDER.indexOf(level);
  return LEVEL_ORDER.slice(0, idx + 1);
}

export const INJURY_MUSCLES = {
  'Knees':      ['quadriceps', 'hamstrings', 'calves'],
  'Lower Back': ['lower back'],
  'Shoulders':  ['shoulders', 'traps'],
  'Wrists':     ['forearms'],
  'Neck':       ['neck', 'traps'],
  'Hips':       ['glutes', 'abductors', 'adductors'],
};

export function excludedMuscles(injuries) {
  const muscles = new Set();
  injuries.forEach((inj) => {
    (INJURY_MUSCLES[inj] || []).forEach((m) => muscles.add(m));
  });
  return muscles;
}

export const EQUIPMENT_OPTIONS = [
  { label: 'No equipment (bodyweight)', values: ['body only'] },
  { label: 'Dumbbells',        values: ['dumbbell'] },
  { label: 'Barbell',          values: ['barbell', 'e-z curl bar'] },
  { label: 'Kettlebells',      values: ['kettlebells'] },
  { label: 'Resistance bands', values: ['bands'] },
  { label: 'Cable machine',    values: ['cable'] },
  { label: 'Gym machines',     values: ['machine'] },
  { label: 'Medicine ball',    values: ['medicine ball'] },
  { label: 'Foam roller',      values: ['foam roll'] },
];

export function equipmentApiValues(selectedLabels) {
  const base = new Set(['body only', 'other', null]);
  selectedLabels.forEach((label) => {
    const opt = EQUIPMENT_OPTIONS.find((o) => o.label === label);
    if (opt) opt.values.forEach((v) => base.add(v));
  });
  return base;
}

export function filterExercises(allExercises, { level, equipmentLabels, injuries }) {
  const levels   = allowedLevels(level);
  const equipSet = equipmentApiValues(equipmentLabels);
  const badMuscles = excludedMuscles(injuries);

  return allExercises.filter((ex) => {
    if (!levels.includes(ex.level)) return false;
    if (!equipSet.has(ex.equipment)) return false;
    const allMuscles = [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])];
    if (allMuscles.some((m) => badMuscles.has(m))) return false;
    return true;
  });
}
