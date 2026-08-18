import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Download, Cpu, ChevronDown, Moon, Lock, Key, Music, Users, FileText, Flame, Sparkles } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { binauralEngine } from '../utils/binauralEngine';
import { isNightReportUnlocked } from '../utils/rpgEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

function getLockCountdown() {
  const now = new Date();
  const target = new Date();
  target.setHours(2, 0, 0, 0);
  if (now.getHours() >= 2) {
    target.setDate(target.getDate() + 1);
  }
  const diffMs = target - now;
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffMins = Math.floor((diffMs % 3600000) / 60000);
  return `${diffHrs}h ${diffMins}m`;
}

export default function Navbar({
  userData,
  setUserData,
  isMuted,
  setIsMuted,
  onOpenNightReport,
  onOpenApiKeyModal,
  onOpenSectGuild,
  onOpenAscensionResume,
  onOpenTribulation
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [binauralActive, setBinauralActive] = useState(false);
  const [, setTick] = useState(0);

  // Live 10-second ticker to re-evaluate real-time clock automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const nightUnlocked = isNightReportUnlocked();

  const toggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
    triggerHapticFeedback('light');
  };

  const toggleBinaural = () => {
    const playing = binauralEngine.toggle('gamma');
    setBinauralActive(playing);
    triggerHapticFeedback('medium');
    setDropdownOpen(false);
  };

  const handleExportData = () => {
    audio.playClick();
    triggerHapticFeedback('medium');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `QuestAscend_Save_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDropdownOpen(false);
  };

  return (
    <nav className="cyber-panel border-b border-cyan-500/30 px-4 py-3 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-40 font-orbitron">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/30 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-widest flex items-center gap-1.5">
              <span>QUESTASCEND</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">RPG</span>
            </h1>
            <p className="text-[10px] font-rajdhani text-slate-400 tracking-wider">GATE PREP & LIFE RPG SYSTEM</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Solid 2:00 AM Night Report Lock with Live Ticker */}
          {nightUnlocked ? (
            <button
              onClick={onOpenNightReport}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/20 uppercase active:scale-95 transition animate-pulse"
            >
              <Moon className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Night Report Active</span>
            </button>
          ) : (
            <div 
              onClick={() => {
                triggerHapticFeedback('heavy');
                audio.playError?.();
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-500 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed select-none shadow-inner opacity-85"
              title={`🔒 SOLID LOCK: Night Audit opens at 2:00 AM (${getLockCountdown()} remaining)`}
            >
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">🔒 2:00 AM ({getLockCountdown()})</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-cyan-400 transition"
            title="Toggle Ambient Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Streamlined Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-cyan-400 transition flex items-center gap-1 text-xs font-bold"
            >
              <span>⚙️</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-950 border border-cyan-500/40 rounded-2xl p-2 shadow-2xl space-y-1 z-50 text-xs animate-fade-in cyber-hud-brackets">
                
                <button
                  onClick={toggleBinaural}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition ${
                    binauralActive 
                      ? 'bg-purple-950 border border-purple-500/50 text-purple-300 font-bold' 
                      : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-purple-400" />
                    <span>40Hz Binaural Waves</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    {binauralActive ? 'ACTIVE' : 'OFF'}
                  </span>
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); onOpenTribulation(); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-amber-300 font-bold flex items-center gap-2"
                >
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Heavenly Tribulation</span>
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); onOpenAscensionResume(); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Dao Forge Resume</span>
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); onOpenSectGuild(); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-pink-400" />
                  <span>Sect Guild Hall</span>
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); onOpenApiKeyModal(); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 font-bold flex items-center gap-2 border-t border-slate-800 pt-1.5"
                >
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>Setup Gemini AI Key</span>
                </button>

                <a
                  href="https://github.com/devil15371/quest-ascend-rpg/releases/download/v1.0.0/QuestAscend-RPG.apk"
                  download="QuestAscend-RPG.apk"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 flex items-center gap-2 text-xs font-bold"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download Android APK (.apk)</span>
                </a>

                <button
                  onClick={handleExportData}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 flex items-center gap-2"
                >
                  <span>💾 Backup Save Data (.json)</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </nav>
  );
}
