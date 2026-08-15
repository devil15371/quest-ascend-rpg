import React, { useState } from 'react';
import { Volume2, VolumeX, Download, Cpu, ChevronDown, Moon, Lock, Key, Music, Users, FileText, Flame, Sparkles } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { binauralEngine } from '../utils/binauralEngine';
import { isNightReportUnlocked } from '../utils/rpgEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

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
  const [devOverride, setDevOverride] = useState(false);

  const nightUnlocked = isNightReportUnlocked(devOverride);

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
          
          {/* Night Report Trigger / Lock Status */}
          {nightUnlocked ? (
            <button
              onClick={onOpenNightReport}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/20 uppercase"
            >
              <Moon className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Night Report</span>
            </button>
          ) : (
            <div 
              onClick={() => {
                if (window.confirm("Night Report unlocks after 2:00 AM. Unlock dev test mode?")) {
                  setDevOverride(true);
                  onOpenNightReport();
                }
              }}
              className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-500 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:border-purple-500/50 hover:text-purple-300 transition"
              title="Unlocks after 2:00 AM"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">2:00 AM Lock</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-cyan-400 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Streamlined Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:border-cyan-400 transition text-xs font-bold flex items-center gap-1.5"
            >
              <span>Menu</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs font-orbitron space-y-1">
                <button
                  onClick={toggleBinaural}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 font-bold flex items-center gap-2"
                >
                  <Music className="w-4 h-4 text-purple-400" />
                  <span>{binauralActive ? 'Stop 40Hz Beats' : '🎵 40Hz Gamma Beats'}</span>
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); onOpenTribulation(); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 font-bold flex items-center gap-2"
                >
                  <Flame className="w-4 h-4 text-red-500" />
                  <span>⚡ Heavenly Tribulation Trial</span>
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); onOpenSectGuild(); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 font-bold flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>🚩 Cultivation Sect Guilds</span>
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); onOpenAscensionResume(); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 font-bold flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>📜 Dao Forge Technical Resume</span>
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); onOpenApiKeyModal(); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 font-bold flex items-center gap-2 border-t border-slate-800 pt-1.5"
                >
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>Setup Gemini AI Key</span>
                </button>

                <a
                  href="https://github.com/devil15371/quest-ascend-rpg/releases"
                  target="_blank"
                  rel="noreferrer"
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
