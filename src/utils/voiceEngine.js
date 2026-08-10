// Web Speech API Voice Engine for Mantra Chanting (Active Recall)

class VoiceMantraEngine {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.init();
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  isSupported() {
    return Boolean(this.recognition);
  }

  /**
   * Listen to user chanting mantra out loud
   */
  listenForMantra(onResult, onError) {
    if (!this.recognition) {
      if (onError) onError("Web Speech API not supported on this browser.");
      return;
    }

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.isListening = false;
      if (onResult) onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      this.isListening = false;
      if (onError) onError(e.message);
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try { this.recognition.stop(); } catch (e) {}
      this.isListening = false;
    }
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
