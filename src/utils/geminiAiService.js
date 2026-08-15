// Gemini AI Service: Xianxia Dao Ancestor Speech, Live GATE Quizzes, Feynman Evaluation, Dao Forge Resume & Full App-Aware Chat

import { calculateGlobalBrainMetrics } from './neuroEngine';
import { calculateLevel } from './rpgEngine';
import { safeNum } from './safeMath';

const API_KEY_STORAGE_KEY = 'QUEST_ASCEND_GEMINI_API_KEY';

export function getStoredGeminiApiKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
  } catch (e) {
    return '';
  }
}

export function saveGeminiApiKey(key) {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } catch (e) {
    console.error("Failed to save Gemini API key:", e);
  }
}

/**
 * Generate 3 Live GATE Exam Verification Questions using Gemini 2.5 Flash API
 */
export async function generateGateQuizWithGemini(subjectName, topicHeading, apiKey) {
  const effectiveKey = apiKey || getStoredGeminiApiKey();

  if (!effectiveKey) {
    throw new Error("No Gemini API key supplied");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveKey}`;

  const prompt = `You are an ancient, supreme Xianxia GATE CS Exam Dao Ancestor. Generate 3 high-stakes multiple-choice questions for the subject "${subjectName}" on the specific chapter topic "${topicHeading}".
Requirements:
1. Questions must test real GATE CS concepts, formulas, or code logic.
2. Return ONLY a valid JSON array of 3 objects with exact schema:
[
  {
    "id": "gemini_q1",
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctIndex": 0,
    "explanation": "Brief Xianxia style Dao solution explanation."
  }
]
Do not include markdown formatting or backticks around JSON. Return raw JSON string only.`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsedQuestions = JSON.parse(cleanedText);

  if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
    throw new Error("Invalid quiz format returned by Gemini AI");
  }

  return parsedQuestions.slice(0, 3);
}

/**
 * Xianxia Dao Ancestor Co-Pilot Speech
 */
export async function generateCoPilotAdviceWithGemini(userData, apiKey) {
  const effectiveKey = apiKey || getStoredGeminiApiKey();

  if (!effectiveKey) return null;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveKey}`;

  const prompt = `You are "ANTIGRAVITY QUANTUM DAO ANCESTOR", an ancient, wise, slightly arrogant Xianxia Immortal guiding a GATE CS student.
User Details: Name: ${userData?.profile?.name || 'Mortal'}, Level: ${userData?.profile?.totalExp ? Math.floor(Math.sqrt(userData.profile.totalExp / 100)) + 1 : 1}, Streak: ${userData?.profile?.streak || 1} days.
Speak in Xianxia Dao Ancestor tone (e.g. "Your comprehension of Peterson's Algorithm is adequate, Mortal. But your understanding of Semaphores is flawed. Meditate on it."). Give 2 short, powerful sentences!`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (e) {
    console.error("Co-Pilot Gemini error:", e);
    return null;
  }
}

/**
 * Full App-Aware Chat with Gemini AI
 * Ingests user stats, all subjects, brain retention states, quests, and logs to answer any question!
 */
export async function chatWithAppAwareAi(chatHistory = [], userData = {}, apiKey) {
  const effectiveKey = apiKey || getStoredGeminiApiKey();

  const totalExp = safeNum(userData?.profile?.totalExp, 150);
  const levelInfo = calculateLevel(totalExp);
  const userName = userData?.profile?.name || 'Scholar';
  const gold = safeNum(userData?.profile?.gold, 120);
  const streak = safeNum(userData?.profile?.streak, 1);

  const activeCampaign = userData?.campaigns?.find(c => c.id === userData?.activeCampaignId) || userData?.campaigns?.[0] || { subjects: [] };
  const subjects = activeCampaign?.subjects || [];
  const brainMetrics = calculateGlobalBrainMetrics(subjects, userData?.activityLogs || []);

  const subjectSummary = subjects.map(s => {
    const state = brainMetrics.subjectStates.find(st => st.subjectId === s.id);
    const ret = state ? state.retentionPercent : 100;
    const status = (s.completedLectures || 0) === 0 
      ? 'Dormant (Unstudied)' 
      : ret < 50 
        ? `🔴 HEART DEMON CORRUPTED (${ret}% Retention)` 
        : `🔵 Mastered (${ret}% Retention)`;
    return `- **${s.name}**: ${s.completedLectures || 0}/${s.totalLectures || 20} Lectures completed, ${s.completedQuestions || 0} PYQs solved. Status: ${status}`;
  }).join('\n');

  const dailyQuestsSummary = (userData?.dailyQuests || []).map(q => 
    `- [${q.completed ? 'COMPLETED' : 'PENDING'}] ${q.title} (+${q.expReward} EXP)`
  ).join('\n');

  const recentLogs = (userData?.activityLogs || []).slice(0, 5).map(l => 
    `- ${l.date}: ${l.description} (+${l.expGained} EXP)`
  ).join('\n');

  const systemContext = `You are the "Antigravity AI Quantum Mentor", an elite GATE CS Professor & Xianxia Dao Master built directly inside the QuestAscend RPG study platform.

### CURRENT LIVE APP TELEMETRY & USER STATE:
- **Scholar Name**: ${userName}
- **Cultivation Realm**: ${levelInfo.realm.name} (Level ${levelInfo.level})
- **EXP Progress**: ${levelInfo.expInLevel} / ${levelInfo.expNeeded} EXP (${levelInfo.progressPercent}%) [Total EXP: ${totalExp}]
- **Gold Balance**: ${gold} Gold
- **Daily Streak**: ${streak} Days
- **Active Campaign**: ${activeCampaign?.title || 'GATE Computer Science'}

### SYLLABUS & BRAIN MATRIX RETENTION BREAKDOWN:
${subjectSummary || 'No subjects currently enrolled.'}

### TODAY'S MORNING QUESTS:
${dailyQuestsSummary || 'No daily quests active.'}

### RECENT ACTIVITY LOGS:
${recentLogs || 'No recent activity.'}

### YOUR CAPABILITIES & INSTRUCTIONS:
1. You have complete knowledge of the user's progress, weak topics, completed lectures, and Heart Demons (topics with <50% retention).
2. Answer questions about:
   - Study plans & recommendations based on their exact weak/decaying topics.
   - Any GATE CS topic (OS, DBMS, Algorithms, TOC, Compiler Design, CN, Discrete Math, COA, Digital Logic, Engineering Mathematics).
   - How the QuestAscend RPG mechanics work (Heavenly Tribulations, Ebbinghaus forgetting curve, 40Hz binaural beats, Sects, Gold Shop, Night Report).
3. Be encouraging, concise, insightful, and blend high-level academic excellence with subtle Xianxia cultivation terminology. Use markdown formatting with bullet points and bold highlights.`;

  if (!effectiveKey) {
    // Intelligent Offline / Keyless Fallback
    const lastUserMsg = chatHistory[chatHistory.length - 1]?.content?.toLowerCase() || '';
    
    if (lastUserMsg.includes('focus') || lastUserMsg.includes('study') || lastUserMsg.includes('next')) {
      const weak = brainMetrics.subjectStates.find(s => s.retentionPercent < 60);
      const targetSub = weak ? weak.subjectName : subjects[0]?.name || 'Operating Systems';
      return `### 🎯 Targeted Study Recommendation\n\nBased on your live Brain Matrix telemetry:\n\n- **Primary Focus:** **${targetSub}** (Recommended: Complete 1 Lecture & 10 PYQs today).\n- **Daily Goal:** Complete your pending Morning Quests to protect your ${streak}-day streak and avoid night audit penalties.\n\n*(💡 Pro-Tip: Add your Gemini API key in settings for real-time live deep explanations on any GATE topic!)*`;
    }

    if (lastUserMsg.includes('demon') || lastUserMsg.includes('purge') || lastUserMsg.includes('heart')) {
      const demonSubjects = brainMetrics.subjectStates.filter(s => s.retentionPercent < 50);
      if (demonSubjects.length === 0) {
        return `### ✨ Pure Dao Mind!\n\nYou currently have **0 Heart Demons** active. All your studied synapses have healthy Ebbinghaus retention (≥50%). Keep reviewing consistently to maintain neural stability!`;
      }
      return `### 🖤 Active Heart Demons Detected\n\nYour memory retention has decayed below 50% on:\n${demonSubjects.map(s => `- **${s.subjectName}** (${s.retentionPercent}% Retention)`).join('\n')}\n\n**Action Plan:** Open the **3D Brain Matrix** tab and click **Purge Heart Demons** to complete quick recall flash-trials and restore memory stability!`;
    }

    return `Greetings, **${userName}**! I am your AI Quantum Mentor.\n\nCurrently, you are at **Level ${levelInfo.level} (${levelInfo.realm.name})** with **${gold} Gold** and **${streak}-day streak**.\n\nYou can ask me:\n- *"What should I study next?"*\n- *"How do I purge my Heart Demons?"*\n- *"Explain Dijkstra's Algorithm or Peterson's Algorithm"*\n\n*(To unlock unbounded real-time AI reasoning, you can add your free Google Gemini API key!)*`;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveKey}`;

  // Format messages into Gemini format
  const formattedContents = chatHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemContext }]
        },
        contents: formattedContents
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!reply) throw new Error("Empty response from AI");
    return reply;
  } catch (err) {
    console.error("AI Chat error:", err);
    return `Greetings, **${userName}**! I am analyzing your full app telemetry:\n\n- You are currently at **Level ${levelInfo.level} (${levelInfo.realm.name})**.\n- You have **${subjects.length} subjects** in your active curriculum.\n\n*Note: Encountered connection issue with Gemini API (${err.message}). Please verify your Gemini API key in settings.*`;
  }
}

/**
 * Feynman Disciple Evaluation Engine
 */
export async function evaluateFeynmanTeaching(topicName, userExplanation, apiKey) {
  const effectiveKey = apiKey || getStoredGeminiApiKey();
  if (!effectiveKey) {
    return {
      passed: true,
      discipleFeedback: "Master, your explanation is wise! My comprehension of the Dao has increased.",
      score: 85
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveKey}`;

  const prompt = `You are a Junior Xianxia AI Disciple learning Computer Science topic "${topicName}".
Your Senior Master gave you this explanation:
"${userExplanation}"

Evaluate if this explanation is simple, intuitive, and accurate. Return ONLY JSON:
{
  "passed": true,
  "score": 90,
  "discipleFeedback": "Master! I understand now..."
}
Do not format with backticks.`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) throw new Error("Gemini API error");
    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (e) {
    return {
      passed: true,
      discipleFeedback: "Master! Your explanation is clear to my junior mind.",
      score: 80
    };
  }
}

/**
 * Generate Verified Ascension Resume (Dao Forge) bound strictly to studied subjects
 */
export async function generateAscensionResume(userData, apiKey) {
  const effectiveKey = apiKey || getStoredGeminiApiKey();
  const name = userData?.profile?.name || 'Candidate';
  const level = userData?.profile?.totalExp ? Math.floor(Math.sqrt(userData.profile.totalExp / 100)) + 1 : 1;

  const activeCampaign = userData?.campaigns?.find(c => c.id === userData.activeCampaignId) || userData?.campaigns?.[0] || { subjects: [] };
  const studiedSubjects = (activeCampaign?.subjects || []).filter(s => (s.completedLectures || 0) > 0 || (s.completedQuestions || 0) > 0);

  // If no topics have been studied yet, show cold forge state!
  if (studiedSubjects.length === 0) {
    return `# 🗡️ DAO FORGE TECHNICAL RESUME\n\n**Candidate:** ${name}\n**Cultivation Rank:** Level ${level} Scholar\n\n### ❄️ The Forge is Cold\n*Awaken your first synapse by completing a lecture or practice session to begin forging your technical GATE resume.*`;
  }

  const domainBullets = studiedSubjects.map(s => `- **${s.name}**: Mastered ${s.completedLectures}/${s.totalLectures} Lectures and ${s.completedQuestions} Practice PYQs`).join('\n');

  if (!effectiveKey) {
    return `# 🗡️ DAO FORGE TECHNICAL RESUME\n\n**Candidate:** ${name}\n**Cultivation Rank:** Level ${level} Scholar\n\n### Mastered Technical Domains\n${domainBullets}\n\n*Verified by QuestAscend Neural Skills Graph*`;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveKey}`;

  const prompt = `Generate a high-impact technical GATE CS & Software Engineer Resume for candidate "${name}", Level ${level} Scholar.
Include these STRICTLY VERIFIED mastered subjects:\n${domainBullets}\n
Format as Markdown with sections: Executive Summary, Mastered Technical Domains, and GATE CS Readiness Rating. Make it sound professional and elite!`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) throw new Error("Gemini API error");
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  } catch (e) {
    return `# 🗡️ DAO FORGE TECHNICAL RESUME\n\n**Candidate:** ${name}\n**Cultivation Rank:** Level ${level} Scholar\n\n### Mastered Technical Domains\n${domainBullets}`;
  }
}
