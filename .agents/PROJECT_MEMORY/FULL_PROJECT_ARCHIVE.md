# 🧠 FULL PROJECT ARCHIVE & AI MEMORY SNAPSHOT

This folder and document contain the complete snapshot of all features, technical decisions, bug fixes, and architectural blueprints created for **QuestAscend RPG**.

---

## 📌 Summary of Completed System Architecture

1. **Universal Core Loop (`SubjectTracker.jsx`)**:
   - Clean, zero-friction tracking of **Lectures, Revisions, and Questions**.
   - Immediate EXP gains (`+40 EXP` per lecture, `+3 EXP` per PYQ, `+30 EXP` per revision).

2. **Obsidian 3D Brain Matrix (`Brain3DVisualizer.jsx`)**:
   - Three.js WebGL physics graph visualizing all subjects and sub-topics.
   - **3-State Synapses**:
     - ⚪ **Dormant / Unawakened Meridian**: Never studied (`completedLectures === 0`, dark slate grey `#475569`).
     - 🔵 **Mastered Synapse**: Retention $\ge 50\%$ (glowing cyan/purple `#06b6d4`).
     - 🔴 **Heart Demon**: Retention $< 50\%$ (dark red pulsating shader `#ef4444`).
   - **Hover / Tap Reveal**: Topic labels remain hidden until hovered or tapped to keep the viewport 100% clean.
   - **🗡️ Semaphore Sword of Concurrency**: Low-poly emissive 3D sword orbiting the brain.

3. **Ebbinghaus Forgetting Curve NeuroEngine (`neuroEngine.js`)**:
   - Math formula: $R(t) = e^{-t/S}$.
   - Memory decay half-life $S$ scales dynamically with revision count.
   - Automatically flags neglected topics as Heart Demons when retention drops below 50%.

4. **Binaural Beats Audio Engine (`binauralEngine.js`)**:
   - Pure Web Audio dual oscillator synthesis (Zero MP3 files).
   - 40Hz Gamma Focus Beat (200Hz + 240Hz).
   - 4Hz Theta Flow Beat (136.1Hz + 140.1Hz).

5. **Native Android Speech Recognition (`voiceEngine.js`)**:
   - Capacitor `@capacitor-community/speech-recognition` native plugin registered in Android Capacitor shell.
   - Web Speech API fallback for desktop browsers.

6. **Gemini 2.5 Flash AI Engine (`geminiAiService.js`)**:
   - Live GATE Exam Verification Quizzes.
   - Feynman AI Disciple evaluation.
   - Co-Pilot Xianxia Dao Ancestor speech.
   - Verified Dao Forge Technical Resume bound strictly to studied subjects with cold forge empty state.

7. **Cultivation Realm RPG Engine (`rpgEngine.js`)**:
   - Exponential level curve: $EXP(L) = \lfloor 100 \times (L-1)^{1.65} \rfloor$.
   - 6 Cultivation Realms (Mortal Realm to Sovereign Immortal).
   - Heavenly Tribulation breakthrough exams with dynamic next-realm target title calculation.
   - 2:00 AM Night Report Lock.

8. **Sect Guild Qi Engine (`sectEngine.js` & `SectGuildModal.jsx`)**:
   - Persistent Sect state with user Qi contribution tracking (`expGained * 1.5`).
   - Real-human online cultivator count display.

9. **Data Persistence & Backup (`storage.js`)**:
   - LocalStorage load/save with deep fallback merge.
   - `safeNum(val, defaultVal)` numerical sanitizer preventing `NaN` Gold or EXP forever.
   - Daily Audit penalty system (-25 EXP per uncompleted quest unless Rest Day Pass active).
   - JSON Backup Export/Import.

---

## 📂 Git & Deployment Endpoints
- **Repository**: `https://github.com/devil15371/quest-ascend-rpg`
- **Live Web & PWA App**: `https://devil15371.github.io/quest-ascend-rpg/`
- **GitHub Actions Workflow**: `.github/workflows/build-apk.yml`
