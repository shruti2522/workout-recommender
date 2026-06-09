import { GEMINI_API_KEY, GEMINI_API_URL } from '../utils/config';

const SESSION_DURATION_LABELS = {
  '20_30':   '20–30 minutes (quick session)',
  '30_45':   '30–45 minutes (efficient session)',
  '45_60':   '45–60 minutes (standard session)',
  '60_90':   '60–90 minutes (extended session)',
  '90_plus': '90+ minutes (high-volume session)',
};

const WEEKLY_TIME_LABELS = {
  'under_2h': 'under 2 hours / week',
  '2_4h':     '2–4 hours / week',
  '4_6h':     '4–6 hours / week',
  '6_plus':   '6+ hours / week',
};

function buildPrompt(prefs, filteredExercises) {
  const { frequency, duration, goal, targetAreas, equipment, injuries, level, score, sessionDuration, weeklyTime } = prefs;

  const GOAL_CATEGORIES = {
    build_muscle:        ['strength', 'powerlifting', 'olympic weightlifting'],
    lose_weight:         ['cardio', 'plyometrics', 'strength'],
    improve_endurance:   ['cardio', 'stretching', 'strength'],
    increase_flexibility:['stretching', 'strength'],
    general_fitness:     ['strength', 'cardio', 'stretching'],
  };
  const TARGET_MUSCLES = {
    upper_body: ['chest','shoulders','biceps','triceps','lats','upper back','traps','forearms'],
    lower_body: ['quadriceps','hamstrings','glutes','calves','abductors','adductors'],
    core:       ['abdominals','obliques','lower back'],
    full_body:  [],
  };

  const goalCats = GOAL_CATEGORIES[goal] || ['strength'];
  const targetMuscles = new Set(
    (targetAreas || []).flatMap((a) => TARGET_MUSCLES[a] || [])
  );

  const scored = filteredExercises.map((ex) => {
    let score = 0;
    if (goalCats.includes(ex.category)) score += 2;
    if (targetMuscles.size === 0 || (ex.primaryMuscles || []).some((m) => targetMuscles.has(m))) score += 1;
    
    if (ex.category === 'stretching') score += 1.5; 
    
    return { ex, score };
  });

  scored.sort((a, b) => b.score - a.score || Math.random() - 0.5);

  const exerciseList = scored.slice(0, 100).map(({ ex }) => ({
    id: ex.id,
    name: ex.name,
    primaryMuscles: ex.primaryMuscles,
    category: ex.category,
  }));

  const dayCount = parseInt(frequency, 10) || 3;

  const sessionLabel = SESSION_DURATION_LABELS[sessionDuration] || '45–60 minutes (standard session)';
  const weeklyLabel  = WEEKLY_TIME_LABELS[weeklyTime]  || '4–6 hours / week';

  const EXERCISE_VOLUMES = {
    '20_30':   '4-5',
    '30_45':   '6-7',
    '45_60':   '7-9',
    '60_90':   '9-11',
    '90_plus': '11-14',
  };
  const volumeTarget = EXERCISE_VOLUMES[sessionDuration] || '7-9';

  return `You are an expert personal trainer and physical therapist. Create a highly customized ${dayCount}-day workout plan for this user.

USER PROFILE:
- Fitness level: ${level} (score ${score}/10)
- Training frequency: ${frequency} days/week
- Weekly time budget: ${weeklyLabel}
- Target session length: ${sessionLabel}
- Target exercise volume: Exactly ${volumeTarget} exercises per day.
- Training experience: ${duration.replace(/_/g, ' ')}
- Primary goal: ${goal}
- Target body areas: ${targetAreas.length > 0 ? targetAreas.join(', ') : 'Full Body'}
- Available equipment: ${equipment.length > 0 ? equipment.join(', ') : 'Bodyweight only'}
- Injuries/sensitivities to avoid: ${injuries.length > 0 ? injuries.join(', ') : 'None'}

AVAILABLE EXERCISES (choose from these only, reference by id):
${JSON.stringify(exerciseList, null, 2)}

INSTRUCTIONS:
1. Create exactly ${dayCount} training days.
2. VOLUME REQUIREMENT: You MUST assign exactly ${volumeTarget} total exercises per day. Do not assign fewer, or the session will be too short for the user's selected time commitment.
3. 3-PHASE STRUCTURE: Every single day MUST be structured in this exact chronological order:
   - Phase 1 (Warm-up): 1-2 dynamic stretching, mobility, or light cardio exercises.
   - Phase 2 (Main): The bulk of the exercises (${goal === 'increase_flexibility' ? 'deep stretching' : 'strength/cardio'}). Compound movements first, isolation last.
   - Phase 3 (Cool-down): 1-2 static stretching exercises to aid recovery.
4. Completely tailor the main exercises to the user's primary goal and target areas. DO NOT rely on standard Push/Pull/Legs splits unless it perfectly fits the goal.
5. Assign realistic sets and reps (or duration in seconds):
   - For strength/hypertrophy: use reps (e.g., 8-12)
   - For cardio/stretching/planks (Warm-ups & Cool-downs): use durationSeconds (e.g., 45s or 60s)
   - Include appropriate restSeconds between sets.
6. Write a concise, motivating coaching note for each exercise (1 sentence, focus on form or key benefit).
7. Only use exercises from the provided list (match by id). Do NOT invent new exercises.

RESPOND WITH VALID JSON ONLY. No markdown, no explanation. Use this exact schema:
{
  "days": [
    {
      "dayNumber": 1,
      "label": "Full Body Mobility & Core",
      "focus": "Hip openers, shoulder mobility, and core stability",
      "exercises": [
        {
          "id": "exercise_id_here",
          "phase": "warmup | main | cooldown",
          "sets": 2,
          "reps": null,
          "durationSeconds": 45,
          "restSeconds": 15,
          "note": "Breathe deeply and sink lower into the stretch on each exhale."
        }
      ]
    }
  ]
}`;
}

function mergePlanWithExercises(generatedPlan, filteredExercises) {
  const exerciseMap = new Map(filteredExercises.map((ex) => [ex.id, ex]));

  return generatedPlan.days.map((day) => {
    const exercises = day.exercises
      .map((genEx) => {
        const fullEx = exerciseMap.get(genEx.id);
        if (!fullEx) return null; 
        return {
          ...fullEx,
          sets: genEx.sets,
          reps: genEx.reps,
          durationSeconds: genEx.durationSeconds,
          restSeconds: genEx.restSeconds,
          note: genEx.note,
        };
      })
      .filter(Boolean);

    return {
      key: day.label.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_' + day.dayNumber,
      dayNumber: day.dayNumber,
      label: day.label,
      focus: day.focus,
      exercises,
    };
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function extractJSON(raw) {
  let text = raw.replace(/```(?:json)?\s*/gi, '').trim();

  try { return JSON.parse(text); } catch (_) {}

  const start = text.indexOf('{');
  if (start !== -1) {
    let depth = 0;
    for (let i = start; i < text.length; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') {
        depth--;
        if (depth === 0) {
          try { return JSON.parse(text.slice(start, i + 1)); } catch (_) { break; }
        }
      }
    }
  }

  return null;
}

const MAX_RETRIES = 3;

export async function generatePlan(prefs, filteredExercises, signal) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PASTE_YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('API key is missing or invalid. Please add your Gemini API key to .env.local and restart the server.');
  }

  const prompt = buildPrompt(prefs, filteredExercises);

  let lastError = new Error('Plan generation failed after multiple attempts. Please try again.');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (response.status === 400 || response.status === 401 || response.status === 403) {
        const errText = await response.text();
        console.error('Gemini API Error:', errText);
        throw new Error(`Failed to generate plan. Status: ${response.status}. Check your API key or quota.`);
      }

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Gemini attempt ${attempt} failed (${response.status}):`, errText);
        lastError = new Error(`Failed to generate plan. Status: ${response.status}.`);
        if (attempt < MAX_RETRIES) { await sleep(600 * attempt); continue; }
        throw lastError;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        console.warn(`Gemini attempt ${attempt}: empty response body, retrying…`);
        lastError = new Error('Received an empty response from the server.');
        if (attempt < MAX_RETRIES) { await sleep(600 * attempt); continue; }
        throw lastError;
      }

      const generatedPlan = extractJSON(rawText);

      if (!generatedPlan?.days || !Array.isArray(generatedPlan.days) || generatedPlan.days.length === 0) {
        console.warn(`Gemini attempt ${attempt}: JSON parse/structure failed, retrying…\nRaw:`, rawText.slice(0, 300));
        lastError = new Error('The server returned an improperly formatted plan.');
        if (attempt < MAX_RETRIES) { await sleep(600 * attempt); continue; }
        throw lastError;
      }

      const plan = mergePlanWithExercises(generatedPlan, filteredExercises);

      if (plan.length === 0 || plan.every((day) => day.exercises.length === 0)) {
        console.warn(`Gemini attempt ${attempt}: no exercises mapped, retrying…`);
        lastError = new Error('The server failed to map any exercises. Please try again.');
        if (attempt < MAX_RETRIES) { await sleep(600 * attempt); continue; }
        throw lastError;
      }

      return plan;

    } catch (err) {
      if (err.name === 'AbortError') throw err;
      if (err.message.startsWith('Failed to generate plan. Status: 4')) throw err;
      console.warn(`Gemini attempt ${attempt} threw unexpectedly:`, err.message);
      lastError = err;
      if (attempt < MAX_RETRIES) { await sleep(600 * attempt); continue; }
      throw lastError;
    }
  }

  throw lastError;
}
