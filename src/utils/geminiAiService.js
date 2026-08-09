// Gemini AI Service: Live GATE Exam Quiz Generator & Antigravity Quantum Co-Pilot Advice

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

  const prompt = `You are a GATE CS & IT Exam Professor. Generate 3 multiple-choice questions for the subject "${subjectName}" on the specific chapter topic "${topicHeading}".
Requirements:
1. Questions must test real GATE concepts, formulas, or code logic.
2. Return ONLY a valid JSON array of 3 objects with exact schema:
[
  {
    "id": "gemini_q1",
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctIndex": 0,
    "explanation": "Brief solution explanation."
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
  
  // Clean potential JSON markdown blocks ```json ... ```
  const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsedQuestions = JSON.parse(cleanedText);

  if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
    throw new Error("Invalid quiz format returned by Gemini AI");
  }

  return parsedQuestions.slice(0, 3);
}

/**
 * Generate Real-Time Co-Pilot Speech using Gemini 2.5 Flash API
 */
export async function generateCoPilotAdviceWithGemini(userData, apiKey) {
  const effectiveKey = apiKey || getStoredGeminiApiKey();

  if (!effectiveKey) {
    return null;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveKey}`;

  const prompt = `You are "ANTIGRAVITY QUANTUM CO-PILOT", a high-tech sci-fi AI study mentor for a student preparing for the GATE CS exam.
User Details: Name: ${userData?.profile?.name || 'Hunter'}, Level: ${userData?.profile?.totalExp ? Math.floor(Math.sqrt(userData.profile.totalExp / 100)) + 1 : 1}, Streak: ${userData?.profile?.streak || 1} days.
Give 2 short, badass, motivational sci-fi sentences inspiring them to crush their GATE study targets today!`;

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
