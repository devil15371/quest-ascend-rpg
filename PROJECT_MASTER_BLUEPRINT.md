# 📜 QuestAscend RPG — Complete Master Architecture & Memory Archive

> **Permanent Memory Archive**: Created for future AI agents and developers. This document contains the full specification, codebase structure, math formulas, gamification mechanics, and feature documentation for **QuestAscend RPG**.

---

## 🐉 1. Project Overview & Core Vision

**QuestAscend RPG** is an out-of-this-world, genre-defining study platform that fuses:
1. **Actual Neuroscience**: Ebbinghaus Forgetting Curve memory decay math.
2. **3D Spatial Visualization**: Three.js Obsidian 3D Brain Matrix with hover-reveal topic sprites and orbiting divine artifacts.
3. **Generative AI Integration**: Gemini 2.5 Flash API for live GATE exam quizzes, Feynman AI Disciple feedback, and verified technical resumes.
4. **Xianxia & Solo Leveling Lore**: Cultivation realms (Mortal Realm to Sovereign Immortal), Heavenly Tribulation breakthrough exams, Heart Demon corruption, Sect Guilds, and 2:00 AM Night Report Audits.

---

## 🛠️ 2. Technology Stack & Directory Structure

- **Frontend Core**: React 19, Vite, Lucide React Icons.
- **3D Graphics & Physics**: Three.js (`OrbitControls`, custom canvas texture text sprites, low-poly geometry).
- **Audio Synthesis**: Native Web Audio API (`AudioContext`, `ChannelMergerNode`, dual `OscillatorNode` for binaural beats).
- **Mobile Native Shell**: Capacitor 7 + Android Studio Gradle toolchain.
- **Native Hardware Plugins**: `@capacitor-community/speech-recognition`, `@capacitor/haptics`, `@capacitor/local-notifications`.
- **AI Backend**: Google Gemini 2.5 Flash REST API (`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`).
- **Persistence Layer**: LocalStorage with deep fallback merge, `safeNum` numerical sanitizers, daily audit penalty system, and JSON backup export/import.

### Project File Map

```
train.x/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx                # Top HUD header with Night Report lock & Menu dropdown
│   │   ├── CharacterCard.jsx         # Hero Profile, Realm badges, EXP progress, and Stat chips
│   │   ├── SubjectTracker.jsx        # Universal core loop (Lectures, Revisions, PYQs tracker)
│   │   ├── Brain3DVisualizer.jsx     # Three.js 3D Brain Matrix, 3-state synapses & Semaphore Sword
│   │   ├── RewardShop.jsx            # Cyber Reward Shop with Rest Pass & custom real-life items
│   │   ├── HeavenlyTribulationModal.jsx # Breakthrough exam modal with target realm calculation
│   │   ├── NightReportModal.jsx      # 2:00 AM Night Audit report modal
│   │   ├── SectGuildModal.jsx        # Sect Guild Qi pool & online cultivator transparency
│   │   ├── VoiceMantraModal.jsx      # Voice Mantra speech recognition modal
│   │   ├── BinauralAudioPlayer.jsx   # 40Hz Gamma & 4Hz Theta binaural beat controls
│   │   ├── FeynmanModal.jsx          # Feynman AI Disciple teaching modal
│   │   ├── AscensionResumeModal.jsx  # Dao Forge Technical Resume modal
│   │   ├── PurgeHeartDemonsModal.jsx # Heart Demon purging quiz modal
│   │   ├── GeminiApiKeyModal.jsx     # Gemini API Key configuration modal
│   │   ├── DailyQuestsModal.jsx      # Morning Quest Terminal modal
│   │   └── RestDayModal.jsx          # Rest Day Pass activation modal
│   ├── utils/
│   │   ├── storage.js                # LocalStorage load/save, safeNum sanitizer, daily audit
│   │   ├── rpgEngine.js              # Cultivation realms, level formula, early bird, night report lock
│   │   ├── neuroEngine.js            # Ebbinghaus forgetting curve formula R(t) = e^(-t/S)
│   │   ├── binauralEngine.js         # Web Audio dual oscillator binaural beats (40Hz / 4Hz)
│   │   ├── voiceEngine.js            # Native Capacitor Android Speech Recognition + Web Speech fallback
│   │   ├── sectEngine.js             # Persistent Sect Qi state & user contributions
│   │   ├── geminiAiService.js        # Gemini 2.5 Flash API calls for Quizzes, Feynman, and Resumes
│   │   ├── audioEngine.js            # Synthesized UI sound effects (click, level up, buy, hover)
│   │   ├── mobileNative.js           # Capacitor Haptics & Local Notifications wrapper
│   │   └── presets.js                # GATE CS & Fullstack Engineering curriculum presets
│   ├── App.jsx                       # Main application state orchestrator & menu routing
│   ├── main.jsx                      # Vite React entry point
│   └── index.css                     # Cyberpunk glassmorphism design system & utility classes
├── android/                          # Android Studio Capacitor native project
├── public/                           # Web static assets & PWA manifest
├── capacitor.config.json             # Capacitor configuration file
└── vite.config.js                    # Vite build configuration
```

---

## 🧠 3. Detailed Technical Mechanics

### A. Ebbinghaus Forgetting Curve Math (`neuroEngine.js`)
Retention $R(t)$ for a studied topic is calculated as:
$$R(t) = e^{-\frac{t}{S}}$$
- $t$: Days elapsed since last review date.
- $S$: Memory stability half-life (base 7 days, scaled up by review count).
- **3-State Knowledge Synapses**:
  1. **⚪ Dormant / Unawakened Meridian**: `completedLectures === 0` (Dark slate grey `#475569`, low opacity).
  2. **🔵 Mastered Synapse**: `completedLectures > 0` and $R(t) \ge 50\%$ (Glowing cyan/purple `#06b6d4`).
  3. **🔴 Heart Demon**: `completedLectures > 0` and $R(t) < 50\%$ (Dark red pulsating shader `#ef4444`).

### B. Cultivation Realm Level Formula (`rpgEngine.js`)
Exponential EXP required for Level $L$:
$$EXP(L) = \lfloor 100 \times (L - 1)^{1.65} \rfloor$$
- **6 Cultivation Realms**:
  1. **Mortal Realm** (LVL 1 - 10) 🥉
  2. **Qi Condensation** (LVL 11 - 25) ⚡
  3. **Foundation Establishment** (LVL 26 - 45) 🛡️
  4. **Core Formation** (LVL 46 - 70) 🔮
  5. **Nascent Soul** (LVL 71 - 100) 🌌
  6. **Sovereign Immortal** (LVL 101+) 👑

### C. Web Audio Binaural Engine (`binauralEngine.js`)
Synthesizes real-time sound in the browser without external audio files:
- **40Hz Gamma Focus Beat**: Left Ear 200Hz, Right Ear 240Hz.
- **4Hz Theta Flow Beat**: Left Ear 136.1Hz (Om Frequency), Right Ear 140.1Hz.

### D. Native Android Speech Recognition (`voiceEngine.js`)
Uses `@capacitor-community/speech-recognition` inside Capacitor Android WebViews to access hardware mic permissions, with automatic fallback to `window.SpeechRecognition` on desktop browsers.

---

## 🔒 4. Data Safety & Audit Rules

1. **`safeNum(val, defaultVal)` Sanitizer**:
   All numerical properties (`gold`, `totalExp`, `streak`, `stats`) are wrapped in `safeNum()` upon reading from storage or state to guarantee `NaN` can never occur.
2. **Night Report Lock**:
   Only unlocked between 2:00 AM and 6:00 AM (accessible via `isNightReportUnlocked()`).
3. **Daily Audit Penalty**:
   Runs automatically on first app launch each day. Deducts 25 EXP per uncompleted daily quest if no Rest Day Pass was active.

---

## 🚀 5. Deployment & Production Endpoints

- **Live Web Application**: [https://devil15371.github.io/quest-ascend-rpg/](https://devil15371.github.io/quest-ascend-rpg/)
- **GitHub Repository**: [https://github.com/devil15371/quest-ascend-rpg](https://github.com/devil15371/quest-ascend-rpg)
- **GitHub Actions Workflow**: `.github/workflows/build-apk.yml` compiles and publishes the Android APK on every push to `main`.
