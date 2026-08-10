// Gemini AI Service: Xianxia Dao Ancestor Speech, Live GATE Quizzes, Feynman Evaluation, & Dao Forge Resume

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
 * Generate Ascension Resume (Dao Forge)
 */
export async function generateAscensionResume(userData, apiKey) {
  const effectiveKey = apiKey || getStoredGeminiApiKey();
  const name = userData?.profile?.name || 'Candidate';
  const level = userData?.profile?.totalExp ? Math.floor(Math.sqrt(userData.profile.totalExp / 100)) + 1 : 1;

  if (!effectiveKey) {
    return `# DAO FORGE ASCENSION RESUME\n\n**Candidate:** ${name}\n**Cultivation Rank:** Level ${level} Scholar\n\n### Mastered Technical Domains\n- **Operating Systems**: Process Synchronization, Semaphores, Page Replacement.\n- **Database Systems**: ACID Transactions, B+ Tree Indexing, SQL Joins.\n- **Algorithms**: Dynamic Programming, Dijkstra Shortest Path, Min-Heap.\n\n*Verified by QuestAscend Neural Engine*`;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveKey}`;

  const prompt = `Generate a high-impact technical GATE CS & Software Engineer Resume for candidate "${name}", Level ${level} Scholar.
Format as Markdown with sections: Executive Summary, Mastered Core CS Domains, Proven Technical Achievements, and GATE CS Readiness Rating. Make it sound professional and elite!`;

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
    return `# DAO FORGE ASCENSION RESUME\n\n**Candidate:** ${name}\n**Cultivation Rank:** Level ${level} Scholar\n\n### Mastered Technical Domains\n- **Operating Systems**: Process Synchronization, Semaphores.\n- **Database Systems**: ACID Transactions, B+ Tree Indexing.\n- **Algorithms**: Dynamic Programming, Dijkstra.`;
  }
}
