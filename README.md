# FitPulse — Daily Workout & Cardio Tracker (PWA)

A fast, offline-first Progressive Web Application (PWA) built purely with **HTML5, CSS3, and JavaScript**, storing 100% of your data privately in the browser's **Local Storage**.

---

## 🚀 Key Features

### 🏋️ 1. Strength & Resistance Training
- **Daily Routine Name**: Quick-pick presets (`Push Day`, `Pull Day`, `Leg Day`, `Upper Body`, `Full Body`, `Cardio & Abs`) or custom titles.
- **Exercise Management**: Pre-loaded exercise library categorized by muscle groups (Chest, Back, Legs, Shoulders, Arms, Core) + Add custom exercises on the fly.
- **Detailed Sets Tracking**:
  - Set Number & Type: Working, Warm-up (`W`), Drop Set (`D`), Failure (`F`).
  - Weight (`kg` or `lbs` toggle) & Reps input with fast numeric entry.
  - **Tactile Done Checkbox**: Glowing emerald feedback for completed sets.
  - **Duplicate Last Set**: One-tap quick entry copying previous weights & reps.
  - **Previous Workout Reference**: Displays your last performance for that exercise (e.g. *Last time: 70kg × 8 reps*).

### 🏃 2. Cardio Sessions Tracking
- **Cardio Activities**: Running, Treadmill, Cycling, Stationary Bike, Rowing, Jump Rope, Elliptical, Stair Climber, Swimming, Walking, HIIT.
- **Metrics Logged**: Duration (mins), Distance (km/mi), Calories (kcal), and Intensity (Low, Moderate, High, Max Effort).
- **Auto-Calculated Pace / Speed**: Real-time pace (e.g., `6:15 /km`) or cycling speed (`km/h` or `mph`).
- Cardio session notes (incline, heart rate, trail details).

### ⏱️ 3. Built-In Gym Rest Timer
- Floating rest countdown widget with interactive circular progress ring.
- Quick adjustments: `-15s`, `+30s`, `+1m`.
- Sound & Vibration cues using **Web Audio API** and **Navigator Vibrate API** (no external audio files needed).

### 🧘 4. Rest & Recovery Days
- One-toggle Rest Day switch with recovery guidance.
- Daily energy level rating (1–5 lightning bolts ⚡).
- Daily bodyweight tracker & reflection journal.

### 📅 5. Monthly Calendar & History
- Monthly calendar grid highlighting active workout days with color-coded badges:
  - 🟢 **Cyan**: Strength Training
  - 🟠 **Orange**: Cardio Session
  - 🔵 **Blue**: Rest Day
- Click any past date to view and edit its details.

### 🏆 6. Analytics & Personal Records (PRs)
- **Active Streak counter**: Consecutive active workout days.
- Total workouts, completed sets, cumulative weight volume lifted, and total cardio hours & calories.
- **Personal Records (PR) shelf**: Automatically logs and showcases your all-time heaviest weights and reps for every exercise.

### 💾 7. Exporting & Backup Options
- **Export Today's Workout (JSON)**: Directly export your current day's routine, exercises, reps, sets, cardio, and notes with one click from the Daily Log or Header.
  - **Download JSON File**: Saves `fitpulse_workout_YYYY-MM-DD.json`.
  - **Copy to Clipboard**: Copies formatted JSON instantly to paste anywhere.
  - **Live JSON Preview**: Inspect the full JSON payload before saving.
- **Full Backup (JSON)**: Export your entire multi-day workout database from Settings.
- **Import Backup (JSON)**: Restore or migrate your data to another device or browser.
- 100% client-side privacy — all data remains entirely on your machine.

---

## 📱 How to Run & Install as PWA

### Option 1: Quick Launch (Instant Browser Use)
You can directly open [`index.html`](file:///c:/Users/Manoj%20Kumar/Workout/index.html) in any browser (Chrome, Edge, Safari, Firefox). All local storage and workout logging functions immediately.

### Option 2: Full PWA Installation & Offline Caching (Recommended)
PWAs require an HTTP server or localhost to register Service Workers and display the native **Install App** button.

1. Open PowerShell / Command Prompt in this folder (`c:\Users\Manoj Kumar\Workout`):
   ```bash
   python -m http.server 8080
   ```
2. Open your browser and go to:
   ```
   http://localhost:8080
   ```
3. Click the **"Install App"** button in the header or your browser's install icon (in the address bar) to install FitPulse directly to your home screen or desktop taskbar.
4. Once installed, it launches like a native full-screen app with 100% offline functionality!

---

## 📂 Project Architecture

```
Workout/
├── index.html            # Semantic HTML5 app shell & views
├── manifest.json         # PWA Web App Manifest
├── sw.js                 # Service Worker (offline cache management)
├── css/
│   └── style.css         # Modern fitness dark/light design system
├── js/
│   ├── storage.js        # LocalStorage data manager, backup, analytics
│   ├── timer.js          # Audio/vibration gym rest timer
│   └── app.js            # UI controller & event orchestration
└── icons/
    ├── icon.svg          # Scalable SVG fitness logo
    ├── icon-192.png      # PWA 192x192 icon
    └── icon-512.png      # PWA 512x512 splash icon
```
