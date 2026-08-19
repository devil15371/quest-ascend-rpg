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
    <nav className="border-b border-slate-800 px-4 py-3 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-orbitron font-bold text-white tracking-wider flex items-center gap-1.5">
              <span>QUESTASCEND</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">RPG</span>
            </h1>
            <p className="text-[10px] text-slate-400">GATE CS & Adaptive Memory Matrix</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Solid 2:00 AM Night Report Lock with Live Ticker */}
          {nightUnlocked ? (
            <button
              onClick={onOpenNightReport}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition"
            >
              <Moon className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Night Report</span>
            </button>
          ) : (
            <div 
              onClick={() => {
                triggerHapticFeedback('heavy');
                audio.playError?.();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 text-xs font-medium flex items-center gap-1.5 cursor-not-allowed select-none"
              title={`Locked until 2:00 AM (${getLockCountdown()} remaining)`}
            >
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline text-[11px] font-mono">2:00 AM ({getLockCountdown()})</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-600" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs font-medium"
            >
              <span>Settings</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-xl p-1.5 shadow-2xl space-y-1 z-50 text-xs animate-fade-in">
                
                <button
                  onClick={toggleBinaural}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition ${
                    binauralActive 
                      ? 'bg-purple-950/80 border border-purple-500/40 text-purple-300 font-semibold' 
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-purple-400" />
                    <span>40Hz Binaural Beats</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {binauralActive ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); onOpenTribulation(); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 font-medium flex items-center gap-2"
                >
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Heavenly Tribulation</span>
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); onOpenAscensionResume(); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 font-medium flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Dao Forge Resume</span>
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); onOpenSectGuild(); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 font-medium flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-pink-400" />
                  <span>Sect Guild Hall</span>
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); onOpenApiKeyModal(); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 font-medium flex items-center gap-2 border-t border-slate-800 pt-1.5"
                >
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>Setup Gemini AI Key</span>
                </button>

                <a
                  href="https://github.com/devil15371/quest-ascend-rpg/releases/download/v1.0.0/QuestAscend-RPG.apk"
                  download="QuestAscend-RPG.apk"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 text-xs font-medium"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download Android APK</span>
                </a>

                <button
                  onClick={handleExportData}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Backup Save Data</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </nav>
  );
}
