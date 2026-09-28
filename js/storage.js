/**
 * FitPulse Storage Module
 * Manages localStorage persistence, queries, backups, and defaults.
 */

const STORAGE_KEYS = {
  WORKOUTS: 'fitpulse_workouts_v1',
  SETTINGS: 'fitpulse_settings_v1',
  CUSTOM_EXERCISES: 'fitpulse_custom_exercises_v1'
};

const DEFAULT_SETTINGS = {
  weightUnit: 'kg',      // 'kg' | 'lbs'
  distanceUnit: 'km',    // 'km' | 'mi'
  theme: 'dark',         // 'dark' | 'light'
  soundEnabled: true,
  vibrateEnabled: true,
  defaultRestSeconds: 60
};

const PRESET_EXERCISES = [
  { name: 'Barbell Bench Press', muscle: 'Chest' },
  { name: 'Incline Dumbbell Press', muscle: 'Chest' },
  { name: 'Push-Ups', muscle: 'Chest' },
  { name: 'Chest Flyes (Cable/Dumbbell)', muscle: 'Chest' },
  { name: 'Dips (Chest/Triceps)', muscle: 'Chest' },

  { name: 'Barbell Squat', muscle: 'Legs' },
  { name: 'Leg Press', muscle: 'Legs' },
  { name: 'Romanian Deadlift', muscle: 'Legs' },
  { name: 'Walking Lunges', muscle: 'Legs' },
  { name: 'Leg Extension', muscle: 'Legs' },
  { name: 'Hamstring Curl', muscle: 'Legs' },
  { name: 'Calf Raises', muscle: 'Legs' },

  { name: 'Deadlift (Conventional/Sumo)', muscle: 'Back' },
  { name: 'Pull-Ups / Chin-Ups', muscle: 'Back' },
  { name: 'Lat Pulldown', muscle: 'Back' },
  { name: 'Barbell Bent-Over Row', muscle: 'Back' },
  { name: 'Seated Cable Row', muscle: 'Back' },
  { name: 'Single-Arm Dumbbell Row', muscle: 'Back' },

  { name: 'Overhead Barbell Press (OHP)', muscle: 'Shoulders' },
  { name: 'Dumbbell Shoulder Press', muscle: 'Shoulders' },
  { name: 'Lateral Raises', muscle: 'Shoulders' },
  { name: 'Face Pulls', muscle: 'Shoulders' },
  { name: 'Rear Delt Flyes', muscle: 'Shoulders' },

  { name: 'Barbell Bicep Curl', muscle: 'Arms' },
  { name: 'Incline Dumbbell Curl', muscle: 'Arms' },
  { name: 'Hammer Curls', muscle: 'Arms' },
  { name: 'Tricep Rope Pushdown', muscle: 'Arms' },
  { name: 'Skull Crushers (Lying Tricep Ext)', muscle: 'Arms' },

  { name: 'Hanging Leg Raises', muscle: 'Core' },
  { name: 'Plank', muscle: 'Core' },
  { name: 'Cable Woodchoppers', muscle: 'Core' },
  { name: 'Ab Rollout', muscle: 'Core' }
];

const PRESET_CARDIO = [
  'Outdoor Running',
  'Treadmill Run',
  'Outdoor Cycling',
  'Stationary Bike',
  'Rowing Machine',
  'Jump Rope',
  'Elliptical',
  'Stair Climber',
  'Swimming',
  'Brisk Walking',
  'HIIT Workout',
  'Other Cardio'
];

class StorageManager {
  static getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(data);
      if (parsed.defaultRestSeconds === 90) {
        parsed.defaultRestSeconds = 60;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      console.error('Error reading settings from localStorage:', e);
      return { ...DEFAULT_SETTINGS };
    }
  }

  static saveSettings(settings) {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Error saving settings:', e);
      return settings;
    }
  }

  static getAllWorkouts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Error reading workouts from localStorage:', e);
      return {};
    }
  }

  static getDayWorkout(dateStr) {
    const workouts = this.getAllWorkouts();
    if (workouts[dateStr]) {
      return workouts[dateStr];
    }
    // Return a pristine new workout schema for this date
    return {
      date: dateStr,
      routineName: '',
      isRestDay: false,
      exercises: [],
      cardio: [],
      generalNotes: '',
      energyLevel: 0,
      bodyWeight: ''
    };
  }

  static saveDayWorkout(dateStr, dayData) {
    try {
      const workouts = this.getAllWorkouts();
      // Ensure date consistency
      dayData.date = dateStr;
      dayData.updatedAt = new Date().toISOString();
      workouts[dateStr] = dayData;
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
      return dayData;
    } catch (e) {
      console.error('Error saving day workout:', e);
      throw e;
    }
  }

  static deleteDayWorkout(dateStr) {
    try {
      const workouts = this.getAllWorkouts();
      if (workouts[dateStr]) {
        delete workouts[dateStr];
        localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
      }
      return true;
    } catch (e) {
      console.error('Error deleting workout for date:', dateStr, e);
      return false;
    }
  }

  static getExerciseLibrary() {
    try {
      const customData = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
      const custom = customData ? JSON.parse(customData) : [];
      return [...PRESET_EXERCISES, ...custom];
    } catch (e) {
      return [...PRESET_EXERCISES];
    }
  }

  static addCustomExercise(name, muscle) {
    if (!name || !name.trim()) return null;
    const cleanName = name.trim();
    try {
      const customData = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
      const custom = customData ? JSON.parse(customData) : [];
      if (!custom.some(e => e.name.toLowerCase() === cleanName.toLowerCase())) {
        const item = { name: cleanName, muscle: muscle || 'Other' };
        custom.push(item);
        localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(custom));
        return item;
      }
    } catch (e) {
      console.error('Error adding custom exercise:', e);
    }
    return null;
  }

  static getCardioPresets() {
    return PRESET_CARDIO;
  }

  static getAllDatesWithData() {
    const workouts = this.getAllWorkouts();
    return Object.keys(workouts).filter(date => {
      const day = workouts[date];
      if (!day) return false;
      const hasExercises = Array.isArray(day.exercises) && day.exercises.length > 0;
      const hasCardio = Array.isArray(day.cardio) && day.cardio.length > 0;
      const isRest = !!day.isRestDay;
      const hasNotes = !!(day.generalNotes && day.generalNotes.trim());
      return hasExercises || hasCardio || isRest || hasNotes;
    });
  }

  static getPreviousPerformance(exerciseName, excludeDate = null) {
    const workouts = this.getAllWorkouts();
    const sortedDates = Object.keys(workouts).sort().reverse();
    const targetName = exerciseName.trim().toLowerCase();

    for (const date of sortedDates) {
      if (excludeDate && date === excludeDate) continue;
      const day = workouts[date];
      if (!day || !day.exercises) continue;

      const found = day.exercises.find(ex => ex.name.trim().toLowerCase() === targetName);
      if (found && found.sets && found.sets.length > 0) {
        // Return summary of the best or completed sets
        const completedSets = found.sets.filter(s => s.completed);
        const setPool = completedSets.length > 0 ? completedSets : found.sets;
        const setSummary = setPool.map(s => `${s.weight || 0}×${s.reps || 0}`).join(', ');
        return {
          date: date,
          setsCount: found.sets.length,
          summary: setSummary,
          rawSets: found.sets
        };
      }
    }
    return null;
  }

  static getExerciseRecords() {
    const workouts = this.getAllWorkouts();
    const records = {}; // { exerciseName: { maxWeight, maxRepsAtMaxWeight, maxVolumeSet, date } }

    Object.keys(workouts).forEach(date => {
      const day = workouts[date];
      if (!day || !day.exercises) return;

      day.exercises.forEach(ex => {
        const name = ex.name.trim();
        if (!name) return;

        if (!records[name]) {
          records[name] = { maxWeight: 0, repsAtMax: 0, bestVolume: 0, date: date };
        }

        if (Array.isArray(ex.sets)) {
          ex.sets.forEach(set => {
            const w = parseFloat(set.weight) || 0;
            const r = parseInt(set.reps, 10) || 0;
            const vol = w * r;

            if (w > records[name].maxWeight) {
              records[name].maxWeight = w;
              records[name].repsAtMax = r;
              records[name].date = date;
            } else if (w === records[name].maxWeight && r > records[name].repsAtMax) {
              records[name].repsAtMax = r;
              records[name].date = date;
            }

            if (vol > records[name].bestVolume) {
              records[name].bestVolume = vol;
            }
          });
        }
      });
    });

    return records;
  }

  static getGlobalStats() {
    const workouts = this.getAllWorkouts();
    const dates = Object.keys(workouts).sort();

    let totalWorkouts = 0;
    let totalSets = 0;
    let totalCompletedSets = 0;
    let totalWeightVolume = 0;
    let totalCardioMinutes = 0;
    let totalCardioDistance = 0;
    let totalCardioCalories = 0;
    let restDaysCount = 0;

    dates.forEach(d => {
      const day = workouts[d];
      if (!day) return;

      if (day.isRestDay) {
        restDaysCount++;
        return;
      }

      const hasExercises = day.exercises && day.exercises.length > 0;
      const hasCardio = day.cardio && day.cardio.length > 0;

      if (hasExercises || hasCardio) {
        totalWorkouts++;
      }

      if (hasExercises) {
        day.exercises.forEach(ex => {
          if (Array.isArray(ex.sets)) {
            totalSets += ex.sets.length;
            ex.sets.forEach(s => {
              if (s.completed) totalCompletedSets++;
              const w = parseFloat(s.weight) || 0;
              const r = parseInt(s.reps, 10) || 0;
              totalWeightVolume += (w * r);
            });
          }
        });
      }

      if (hasCardio) {
        day.cardio.forEach(c => {
          totalCardioMinutes += parseFloat(c.duration) || 0;
          totalCardioDistance += parseFloat(c.distance) || 0;
          totalCardioCalories += parseFloat(c.calories) || 0;
        });
      }
    });

    // Compute Streak
    let currentStreak = 0;
    const today = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;

    let checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Check if today has workout; if not, check from yesterday to not break ongoing streak
    const formatDate = (dateObj) => dateObj.toISOString().split('T')[0];
    const todayStr = formatDate(checkDate);
    
    const isDayActive = (dateStr) => {
      const w = workouts[dateStr];
      if (!w) return false;
      return (w.exercises && w.exercises.length > 0) || (w.cardio && w.cardio.length > 0) || w.isRestDay;
    };

    if (!isDayActive(todayStr)) {
      // Check yesterday
      checkDate = new Date(checkDate.getTime() - oneDayMs);
    }

    while (isDayActive(formatDate(checkDate))) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - oneDayMs);
    }

    return {
      totalWorkouts,
      totalSets,
      totalCompletedSets,
      totalWeightVolume: Math.round(totalWeightVolume),
      totalCardioMinutes: Math.round(totalCardioMinutes),
      totalCardioDistance: parseFloat(totalCardioDistance.toFixed(2)),
      totalCardioCalories: Math.round(totalCardioCalories),
      restDaysCount,
      currentStreak
    };
  }

  static exportBackupJSON() {
    const backup = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      workouts: this.getAllWorkouts(),
      settings: this.getSettings(),
      customExercises: (() => {
        try {
          return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES) || '[]');
        } catch(e) { return []; }
      })()
    };
    return JSON.stringify(backup, null, 2);
  }

  static exportDayWorkoutJSON(dateStr) {
    const day = this.getDayWorkout(dateStr);
    const settings = this.getSettings();

    let totalSets = 0;
    let completedSets = 0;
    let weightVolume = 0;

    const formattedExercises = (day.exercises || []).map(ex => {
      const formattedSets = (ex.sets || []).map((s, idx) => {
        if (s.completed) completedSets++;
        totalSets++;
        const w = parseFloat(s.weight) || 0;
        const r = parseInt(s.reps, 10) || 0;
        weightVolume += (w * r);

        return {
          setNumber: idx + 1,
          type: s.type || 'working',
          weight: s.weight !== undefined && s.weight !== '' ? Number(s.weight) : null,
          reps: s.reps !== undefined && s.reps !== '' ? Number(s.reps) : null,
          completed: !!s.completed
        };
      });

      return {
        name: ex.name,
        targetMuscle: ex.targetMuscle || 'Other',
        notes: ex.notes || '',
        sets: formattedSets
      };
    });

    let cardioMinutes = 0;
    let cardioDistance = 0;
    let cardioCalories = 0;

    const formattedCardio = (day.cardio || []).map(c => {
      const dur = parseFloat(c.duration) || 0;
      const dist = parseFloat(c.distance) || 0;
      const cal = parseFloat(c.calories) || 0;
      cardioMinutes += dur;
      cardioDistance += dist;
      cardioCalories += cal;

      return {
        type: c.type || 'Cardio',
        durationMinutes: c.duration ? Number(c.duration) : 0,
        distance: c.distance ? Number(c.distance) : 0,
        distanceUnit: settings.distanceUnit || 'km',
        calories: c.calories ? Number(c.calories) : 0,
        intensity: c.intensity || 'Moderate',
        notes: c.notes || ''
      };
    });

    const exportPayload = {
      app: 'FitPulse',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      date: dateStr,
      routineName: day.routineName || (day.isRestDay ? 'Rest & Recovery Day' : 'Workout'),
      isRestDay: !!day.isRestDay,
      summary: {
        totalExercises: formattedExercises.length,
        totalSets: totalSets,
        completedSets: completedSets,
        totalWeightVolume: Math.round(weightVolume),
        weightUnit: settings.weightUnit || 'kg',
        totalCardioMinutes: Math.round(cardioMinutes),
        totalCardioDistance: parseFloat(cardioDistance.toFixed(2)),
        distanceUnit: settings.distanceUnit || 'km',
        totalCardioCalories: Math.round(cardioCalories)
      },
      exercises: formattedExercises,
      cardio: formattedCardio,
      recovery: {
        energyLevel: day.energyLevel || 0,
        bodyWeight: day.bodyWeight ? Number(day.bodyWeight) : null,
        weightUnit: settings.weightUnit || 'kg',
        generalNotes: day.generalNotes || ''
      }
    };

    return JSON.stringify(exportPayload, null, 2);
  }

  static importBackupJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON format');
      }

      if (data.workouts && typeof data.workouts === 'object') {
        localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(data.workouts));
      }

      if (data.settings && typeof data.settings === 'object') {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...DEFAULT_SETTINGS, ...data.settings }));
      }

      if (Array.isArray(data.customExercises)) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(data.customExercises));
      }

      return { success: true, count: Object.keys(data.workouts || {}).length };
    } catch (e) {
      console.error('Import error:', e);
      return { success: false, error: e.message };
    }
  }

  static populateSampleDataIfEmpty(force = false) {
    const workouts = this.getAllWorkouts();
    if (!force && Object.keys(workouts).length > 0) {
      return false; // already has data
    }

    const today = new Date();
    const formatYMD = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = formatYMD(today);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = formatYMD(yesterday);

    const sampleWorkouts = {
      ...workouts,
      [todayStr]: {
        date: todayStr,
        routineName: 'Push & Core Blast',
        isRestDay: false,
        exercises: [
          {
            id: 'ex_1',
            name: 'Barbell Bench Press',
            targetMuscle: 'Chest',
            notes: 'Felt strong, paused at bottom for 1 sec',
            sets: [
              { id: 's1', type: 'warmup', weight: 40, reps: 12, completed: true },
              { id: 's2', type: 'working', weight: 70, reps: 8, completed: true },
              { id: 's3', type: 'working', weight: 75, reps: 6, completed: true },
              { id: 's4', type: 'drop', weight: 60, reps: 10, completed: false }
            ]
          },
          {
            id: 'ex_2',
            name: 'Incline Dumbbell Press',
            targetMuscle: 'Chest',
            notes: '30-degree bench incline',
            sets: [
              { id: 's5', type: 'working', weight: 24, reps: 10, completed: true },
              { id: 's6', type: 'working', weight: 26, reps: 8, completed: true }
            ]
          },
          {
            id: 'ex_3',
            name: 'Lateral Raises',
            targetMuscle: 'Shoulders',
            notes: 'Slow negative control',
            sets: [
              { id: 's7', type: 'working', weight: 10, reps: 15, completed: true },
              { id: 's8', type: 'working', weight: 10, reps: 12, completed: true },
              { id: 's9', type: 'failure', weight: 12, reps: 9, completed: false }
            ]
          }
        ],
        cardio: [
          {
            id: 'car_1',
            type: 'Treadmill Run',
            duration: 20,
            distance: 3.2,
            calories: 195,
            intensity: 'Moderate',
            notes: 'Steady pace 9.5 km/h cool down'
          }
        ],
        generalNotes: 'Solid push workout! Energy was high today.',
        energyLevel: 4,
        bodyWeight: 75.2
      },
      [yesterdayStr]: {
        date: yesterdayStr,
        routineName: 'Pull & Cardio Conditioning',
        isRestDay: false,
        exercises: [
          {
            id: 'ex_y1',
            name: 'Pull-Ups / Chin-Ups',
            targetMuscle: 'Back',
            notes: 'Bodyweight strict form',
            sets: [
              { id: 'sy1', type: 'working', weight: 0, reps: 10, completed: true },
              { id: 'sy2', type: 'working', weight: 0, reps: 8, completed: true },
              { id: 'sy3', type: 'working', weight: 0, reps: 7, completed: true }
            ]
          },
          {
            id: 'ex_y2',
            name: 'Barbell Bent-Over Row',
            targetMuscle: 'Back',
            notes: 'Overhand grip',
            sets: [
              { id: 'sy4', type: 'working', weight: 60, reps: 10, completed: true },
              { id: 'sy5', type: 'working', weight: 65, reps: 8, completed: true }
            ]
          }
        ],
        cardio: [
          {
            id: 'car_y1',
            type: 'Outdoor Cycling',
            duration: 35,
            distance: 12.5,
            calories: 310,
            intensity: 'High',
            notes: 'Evening ride with hill sprints'
          }
        ],
        generalNotes: 'Lats feeling pumped! Good cardio session.',
        energyLevel: 5,
        bodyWeight: 75.5
      }
    };

    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(sampleWorkouts));
    return true;
  }
}

// Make accessible globally
window.StorageManager = StorageManager;
