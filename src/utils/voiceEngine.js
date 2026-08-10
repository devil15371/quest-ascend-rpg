// Voice Engine with Capacitor Native Android Hardware Mic Support & Web Speech API Fallback

import { SpeechRecognition } from '@capacitor-community/speech-recognition';

class VoiceMantraEngine {
  constructor() {
    this.isListening = false;
  }

  /**
   * Listen for voice speech using Native Capacitor Speech Recognition on Android, falling back to Web Speech API
   */
  async listenForMantra(onResult, onError) {
    try {
      // Check if native Capacitor SpeechRecognition is available
      const hasPermission = await SpeechRecognition.hasPermission();
      if (!hasPermission.permission) {
        await SpeechRecognition.requestPermission();
      }

      this.isListening = true;
      const result = await SpeechRecognition.start({
        language: "en-US",
        maxResults: 1,
        prompt: "Chant your GATE formula or definition out loud!",
        partialResults: false
      });

      this.isListening = false;
      if (result.matches && result.matches.length > 0) {
        onResult(result.matches[0]);
      } else {
        if (onError) onError("No speech detected");
      }
    } catch (nativeErr) {
      console.warn("Native speech recognition unavailable or browser fallback:", nativeErr);
      // Fallback to Web Speech API for Desktop Browsers
      this.listenWebSpeechAPI(onResult, onError);
    }
  }

  listenWebSpeechAPI(onResult, onError) {
    const WebSpeech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!WebSpeech) {
      if (onError) onError("Speech Recognition not supported on this browser.");
      return;
    }

    try {
      const recognition = new WebSpeech();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        if (onResult) onResult(transcript);
      };

      recognition.onerror = (event) => {
        this.isListening = false;
        if (onError) onError(event.error);
      };

      recognition.start();
      this.isListening = true;
    } catch (e) {
      this.isListening = false;
      if (onError) onError(e.message);
    }
  }

  async stop() {
    try {
      await SpeechRecognition.stop();
    } catch (e) {}
    this.isListening = false;
  }
}

export const voiceEngine = new VoiceMantraEngine();

export const MANTRAS_TO_CHANT = [
  {
    topic: "Operating Systems",
    mantra: "Peterson's algorithm guarantees mutual exclusion using flag array and turn variable.",
    keywords: ["peterson", "mutual exclusion", "flag", "turn"]
  },
  {
    topic: "Algorithms",
    mantra: "Dijkstra's shortest path algorithm runs in O E log V using Min-Heap.",
    keywords: ["dijkstra", "shortest path", "min-heap", "heap"]
  },
  {
    topic: "Database Systems",
    mantra: "ACID properties stand for Atomicity, Consistency, Isolation, and Durability.",
    keywords: ["acid", "atomicity", "consistency", "isolation", "durability"]
  },
  {
    topic: "Engineering Mathematics",
    mantra: "The determinant of a matrix equals the product of its eigenvalues.",
    keywords: ["determinant", "matrix", "product", "eigenvalues"]
  }
];
