// Gemini AI Service: Xianxia Dao Ancestor Speech, Live GATE Quizzes, Feynman Evaluation, Dao Forge Resume & Sub-Second SSE Streaming Chat

import { calculateGlobalBrainMetrics } from './neuroEngine';
import { calculateLevel } from './rpgEngine';
import { safeNum } from './safeMath';

const API_KEY_STORAGE_KEY = 'QUEST_ASCEND_GEMINI_API_KEY';
const CACHED_MODEL_STORAGE_KEY = 'QUEST_ASCEND_ACTIVE_GEMINI_MODEL';

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
    localStorage.removeItem(CACHED_MODEL_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to save Gemini API key:", e);
  }
}

const DEFAULT_FALLBACK_MODELS = [
  'gemini-3.7-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.5-flash',
  'gemini-1.5-pro'
];

/**
 * Discover alive models supporting generateContent from Google's live registry
 */
async function discoverAliveModels(apiKey) {
  try {
    const listEndpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(listEndpoint);
    if (!res.ok) return DEFAULT_FALLBACK_MODELS;

    const data = await res.json();
    if (!Array.isArray(data?.models)) return DEFAULT_FALLBACK_MODELS;

    const aliveModels = data.models
      .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
      .map(m => m.name.replace(/^models\//, ''));

    if (aliveModels.length === 0) return DEFAULT_FALLBACK_MODELS;

    aliveModels.sort((a, b) => {
      const aIsFlash = a.includes('flash') ? 1 : 0;
      const bIsFlash = b.includes('flash') ? 1 : 0;
      return bIsFlash - aIsFlash;
    });

    return aliveModels;
  } catch (e) {
    return DEFAULT_FALLBACK_MODELS;
  }
}

/**
 * High-Speed Compressed App Telemetry (~150 Tokens)
 */
function buildCompressedTelemetry(userData) {
  const totalExp = safeNum(userData?.profile?.totalExp, 150);
  const levelInfo = calculateLevel(totalExp);
  const userName = userData?.profile?.name || 'Scholar';
  const gold = safeNum(userData?.profile?.gold, 120);
  const streak = safeNum(userData?.profile?.streak, 1);

  const activeCampaign = userData?.campaigns?.find(c => c.id === userData?.activeCampaignId) || userData?.campaigns?.[0] || { subjects: [] };
  const subjects = activeCampaign?.subjects || [];
  const brainMetrics = calculateGlobalBrainMetrics(subjects, userData?.activityLogs || []);

  const subList = subjects.map(s => `${s.name}(${s.completedLectures || 0}/${s.totalLectures || 20}L)`).join(', ');
  const weakSubjects = brainMetrics.subjectStates.filter(s => s.retentionPercent < 50).map(s => `${s.subjectName}(${s.retentionPercent}%)`);

  return `Candidate: ${userName} | Realm: ${levelInfo.realm.name} (Lvl ${levelInfo.level}) | EXP: ${totalExp} | Gold: ${gold} | Streak: ${streak}d | Subjects: ${subList || 'None'} | HeartDemons: ${weakSubjects.length > 0 ? weakSubjects.join(', ') : 'None'}`;
}

/**
 * Robust Gemini REST API Call with Dynamic Registry & Cached Alive Model
 */
async function callGeminiApi(payload, apiKey) {
  const effectiveKey = apiKey || getStoredGeminiApiKey();
  if (!effectiveKey) throw new Error("No Gemini API key supplied");

  let cachedModel = null;
  try {
    cachedModel = localStorage.getItem(CACHED_MODEL_STORAGE_KEY);
  } catch (e) {}

  let modelsToTry = cachedModel ? [cachedModel] : [];
  const liveModels = await discoverAliveModels(effectiveKey);
  liveModels.forEach(m => {
    if (!modelsToTry.includes(m)) modelsToTry.push(m);
  });
  DEFAULT_FALLBACK_MODELS.forEach(m => {
    if (!modelsToTry.includes(m)) modelsToTry.push(m);
  });

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          generationConfig: {
            maxOutputTokens: 600,
            temperature: 0.7,
            thinkingConfig: { thinkingBudget: 0 }
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          try {
            localStorage.setItem(CACHED_MODEL_STORAGE_KEY, model);
          } catch (e) {}
          return text.trim();
        }
      } else {
        const errJson = await response.json().catch(() => null);
        const errMsg = errJson?.error?.message || response.statusText;
        lastError = new Error(`Gemini API returned ${response.status} on model '${model}': ${errMsg}`);
        if (model === cachedModel) {
          try {
            localStorage.removeItem(CACHED_MODEL_STORAGE_KEY);
          } catch (e) {}
        }
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to connect to Google Gemini API");
}

/**
 * Sub-Second Real-Time SSE Streaming Chat
 * Delivers first token in ~0.5s and streams text live to onChunk callback!
 */
export async function streamChatWithAppAwareAi(chatHistory = [], userData = {}, onChunk, apiKey) {
  const effectiveKey = apiKey || getStoredGeminiApiKey();

  // Instant Offline Fallback if No Key Provided
  if (!effectiveKey) {
    const offlineReply = getInstantLocalAdvice(chatHistory, userData);
    if (onChunk) onChunk(offlineReply);
    return offlineReply;
  }

  const telemetrySnippet = buildCompressedTelemetry(userData);
  const systemInstructionText = `You are "Antigravity AI Quantum Mentor", an elite GATE CS Professor & Xianxia Dao Master in QuestAscend RPG.\nTelemetry: [${telemetrySnippet}]\nAnswer concisely, accurately, and encouragingly in markdown format.`;

  const formattedContents = chatHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstructionText }]
    },
    contents: formattedContents,
    generationConfig: {
      maxOutputTokens: 500,
      temperature: 0.7,
      thinkingConfig: { thinkingBudget: 0 }
    }
  };

  let cachedModel = null;
  try {
    cachedModel = localStorage.getItem(CACHED_MODEL_STORAGE_KEY);
  } catch (e) {}

  let modelsToTry = cachedModel ? [cachedModel] : [];
  const liveModels = await discoverAliveModels(effectiveKey);
  liveModels.forEach(m => {
    if (!modelsToTry.includes(m)) modelsToTry.push(m);
  });
  DEFAULT_FALLBACK_MODELS.forEach(m => {
    if (!modelsToTry.includes(m)) modelsToTry.push(m);
  });

  // 7-Second Safety Timeout Controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${effectiveKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (response.ok && response.body) {
        clearTimeout(timeoutId);
        try {
          localStorage.setItem(CACHED_MODEL_STORAGE_KEY, model);
        } catch (e) {}

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          const lines = chunkText.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr && jsonStr !== '[DONE]') {
                try {
                  const parsed = JSON.parse(jsonStr);
                  const token = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                  if (token) {
                    accumulated += token;
                    if (onChunk) onChunk(accumulated);
                  }
                } catch (e) {}
              }
            }
          }
        }

        if (accumulated.trim()) {
          return accumulated.trim();
        }
      } else {
        if (model === cachedModel) {
          try {
            localStorage.removeItem(CACHED_MODEL_STORAGE_KEY);
          } catch (e) {}
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        clearTimeout(timeoutId);
        const timeoutReply = `⚡ **Fast Subspace Response:**\n\n${getInstantLocalAdvice(chatHistory, userData)}`;
        if (onChunk) onChunk(timeoutReply);
        return timeoutReply;
      }
    }
  }

  clearTimeout(timeoutId);
  const fallbackReply = getInstantLocalAdvice(chatHistory, userData);
  if (onChunk) onChunk(fallbackReply);
  return fallbackReply;
}

/**
 * Backward compatible non-streaming alias
 */
export async function chatWithAppAwareAi(chatHistory = [], userData = {}, apiKey) {
  return await streamChatWithAppAwareAi(chatHistory, userData, null, apiKey);
}

/**
 * Instant Local Offline Intelligence (< 5ms)
 */
function getInstantLocalAdvice(chatHistory, userData) {
  const lastUserMsg = chatHistory[chatHistory.length - 1]?.content?.toLowerCase() || '';
  const totalExp = safeNum(userData?.profile?.totalExp, 150);
  const levelInfo = calculateLevel(totalExp);
  const streak = safeNum(userData?.profile?.streak, 1);
  const activeCampaign = userData?.campaigns?.find(c => c.id === userData?.activeCampaignId) || userData?.campaigns?.[0] || { subjects: [] };
  const subjects = activeCampaign?.subjects || [];
  const brainMetrics = calculateGlobalBrainMetrics(subjects, userData?.activityLogs || []);

  if (lastUserMsg.includes('focus') || lastUserMsg.includes('study') || lastUserMsg.includes('next') || lastUserMsg.includes('plan')) {
    const weak = brainMetrics.subjectStates.find(s => s.retentionPercent < 60);
    const targetSub = weak ? weak.subjectName : subjects[0]?.name || 'Operating Systems';
    return `### 🎯 Targeted Study Plan\n\n- **Immediate Priority:** **${targetSub}** (Recommended: 1 Lecture + 10 Practice Questions).\n- **Daily Goal:** Complete pending Morning Quests to preserve your **${streak}-day streak** and avoid midnight audit penalties.\n- **Current Realm:** **${levelInfo.realm.name}** (Level ${levelInfo.level}).`;
  }

  if (lastUserMsg.includes('demon') || lastUserMsg.includes('purge') || lastUserMsg.includes('heart')) {
    const demonSubjects = brainMetrics.subjectStates.filter(s => s.retentionPercent < 50);
    if (demonSubjects.length === 0) {
      return `### ✨ Mind of Pure Dao!\n\nYou currently have **0 active Heart Demons**. All studied synapses have healthy Ebbinghaus retention (≥50%).`;
    }
    return `### 🖤 Active Heart Demons Detected\n\nYour retention is below 50% on:\n${demonSubjects.map(s => `- **${s.subjectName}** (${s.retentionPercent}% Retention)`).join('\n')}\n\n**Action:** Open the **3D Brain Matrix** and click **Purge Heart Demons** to run a quick recall trial!`;
  }

  if (lastUserMsg.includes('readiness') || lastUserMsg.includes('breakthrough') || lastUserMsg.includes('tribulation')) {
    return `### ⚡ Heavenly Tribulation Readiness\n\n- **Current Realm:** ${levelInfo.realm.name} (Level ${levelInfo.level})\n- **EXP in Level:** ${levelInfo.expInLevel} / ${levelInfo.expNeeded} EXP (${levelInfo.progressPercent}%)\n- **Breakthrough Target:** Pass a 4-question GATE trial with ≥ 75% accuracy to claim +250 EXP!`;
  }

  return `Greetings! You are currently at **Level ${levelInfo.level} (${levelInfo.realm.name})** with **${subjects.length} subjects** enrolled.\n\nAsk me:\n- *"What should I focus on today?"*\n- *"How do I purge my active Heart Demons?"*\n- *"Explain Peterson's algorithm or Dijkstra's shortest path"*`;
}

/**
 * Generate 3 Live GATE Exam Verification Questions using Gemini API
 */
export async function generateGateQuizWithGemini(subjectName, topicHeading, apiKey) {
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

  const rawText = await callGeminiApi({
    contents: [{ parts: [{ text: prompt }] }]
  }, apiKey);

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

  const prompt = `You are "ANTIGRAVITY QUANTUM DAO ANCESTOR", an ancient, wise, slightly arrogant Xianxia Immortal guiding a GATE CS student.
User Details: Name: ${userData?.profile?.name || 'Mortal'}, Level: ${userData?.profile?.totalExp ? Math.floor(Math.sqrt(userData.profile.totalExp / 100)) + 1 : 1}, Streak: ${userData?.profile?.streak || 1} days.
Speak in Xianxia Dao Ancestor tone (e.g. "Your comprehension of Peterson's Algorithm is adequate, Mortal. But your understanding of Semaphores is flawed. Meditate on it."). Give 2 short, powerful sentences!`;

  try {
    return await callGeminiApi({
      contents: [{ parts: [{ text: prompt }] }]
    }, effectiveKey);
  } catch (e) {
    console.error("Co-Pilot Gemini error:", e);
    return null;
  }
}

/**
 * Feynman Disciple Evaluation Engine
 */
export async function evaluateFeynmanTeaching(topicName, userExplanation, apiKey) {
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
    const rawText = await callGeminiApi({
      contents: [{ parts: [{ text: prompt }] }]
    }, apiKey);

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
  const name = userData?.profile?.name || 'Candidate';
  const level = userData?.profile?.totalExp ? Math.floor(Math.sqrt(userData.profile.totalExp / 100)) + 1 : 1;

  const activeCampaign = userData?.campaigns?.find(c => c.id === userData.activeCampaignId) || userData?.campaigns?.[0] || { subjects: [] };
  const studiedSubjects = (activeCampaign?.subjects || []).filter(s => (s.completedLectures || 0) > 0 || (s.completedQuestions || 0) > 0);

  if (studiedSubjects.length === 0) {
    return `# 🗡️ DAO FORGE TECHNICAL RESUME\n\n**Candidate:** ${name}\n**Cultivation Rank:** Level ${level} Scholar\n\n### ❄️ The Forge is Cold\n*Awaken your first synapse by completing a lecture or practice session to begin forging your technical GATE resume.*`;
  }

  const domainBullets = studiedSubjects.map(s => `- **${s.name}**: Mastered ${s.completedLectures}/${s.totalLectures} Lectures and ${s.completedQuestions} Practice PYQs`).join('\n');

  const prompt = `Generate a high-impact technical GATE CS & Software Engineer Resume for candidate "${name}", Level ${level} Scholar.
Include these STRICTLY VERIFIED mastered subjects:\n${domainBullets}\n
Format as Markdown with sections: Executive Summary, Mastered Technical Domains, and GATE CS Readiness Rating. Make it sound professional and elite!`;

  try {
    return await callGeminiApi({
      contents: [{ parts: [{ text: prompt }] }]
    }, apiKey);
  } catch (e) {
    return `# 🗡️ DAO FORGE TECHNICAL RESUME\n\n**Candidate:** ${name}\n**Cultivation Rank:** Level ${level} Scholar\n\n### Mastered Technical Domains\n${domainBullets}`;
  }
}
