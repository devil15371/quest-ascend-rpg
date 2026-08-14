---
name: quest-ascend-memory
description: Complete memory archive, architecture blueprint, feature specifications, and implementation details for QuestAscend RPG GATE study platform.
---

# QuestAscend RPG — Memory & Architecture Skill

This skill contains the complete context, design philosophy, source code architecture, and math formulas for **QuestAscend RPG**. Use this skill to instantly restore full context across conversation resets or agent upgrades.

## Key System Concepts

1. **Universal Core Loop (`SubjectTracker.jsx`)**:
   Keep simple, fast tracking of Lectures, Revisions, and Questions front and center.
2. **Obsidian 3D Brain Matrix (`Brain3DVisualizer.jsx`)**:
   Three.js physics graph with 3-state synapses:
   - ⚪ **Dormant**: Unstudied (`completedLectures === 0`)
   - 🔵 **Mastered**: Studied & retention $\ge 50\%$
   - 🔴 **Heart Demon**: Studied then neglected ($R(t) < 50\%$)
   - **Semaphore Sword**: Low-poly 3D emissive sword orbiting the brain.
3. **Ebbinghaus Forgetting Curve (`neuroEngine.js`)**:
   $$R(t) = e^{-\frac{t}{S}}$$
4. **Binaural Beats (`binauralEngine.js`)**:
   Dual oscillator Web Audio synthesis for 40Hz Gamma and 4Hz Theta waves.
5. **Native Android Mic (`voiceEngine.js`)**:
   Uses `@capacitor-community/speech-recognition` on mobile APK with browser Web Speech API fallback.
6. **Sect Qi Engine (`sectEngine.js` & `SectGuildModal.jsx`)**:
   Persistent local/cloud state, pooling Sect Qi, +10% EXP multipliers, and active cultivator online count.
7. **Gemini 2.5 Flash AI (`geminiAiService.js`)**:
   Live GATE quizzes, Feynman Disciple feedback, Co-Pilot advice, and Dao Forge technical resumes bound strictly to studied subjects.
8. **Cultivation Realms (`rpgEngine.js`)**:
   $$EXP(L) = \lfloor 100 \times (L-1)^{1.65} \rfloor$$
   6 Realms: Mortal Realm, Qi Condensation, Foundation Establishment, Core Formation, Nascent Soul, Sovereign Immortal.
9. **Data Safety (`storage.js`)**:
   `safeNum()` numerical sanitizer on all Gold/EXP values, LocalStorage persistence, daily audit penalties, and JSON backup export/import.
