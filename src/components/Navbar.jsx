import React, { useState } from 'react';
import { Volume2, VolumeX, Download, Sparkles, Trophy, Cpu, ChevronDown, Moon, Lock, Key, Music, Mic, Users, FileText, Flame } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { binauralEngine } from '../utils/binauralEngine';
import { isNightReportUnlocked } from '../utils/rpgEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function Navbar({
  userData,
  setUserData,
  isMuted,
  setIsMuted,
  onOpenLevelUp,
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
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">XIANXIA</span>
            </h1>
            <p className="text-[10px] font-rajdhani text-slate-400 tracking-wider">SOLO LEVELING IDENTITY SHIFT ENGINE</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Binaural Beats 40Hz Generator */}
          <button
            onClick={toggleBinaural}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              binauralActive
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40 animate-pulse'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-purple-400'
            }`}
            title="Toggle 40Hz Gamma Binaural Beats for Flow State"
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{binauralActive ? '40Hz Gamma Active' : '40Hz Beats'}</span>
          </button>

          {/* Heavenly Tribulation Test Trigger */}
          <button
            onClick={onOpenTribulation}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow"
          >
            <Flame className="w-4 h-4 text-slate-950" />
            <span className="hidden lg:inline">Tribulation</span>
          </button>

          {/* Sect Guilds Button */}
          <button
            onClick={onOpenSectGuild}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950 text-xs font-bold flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Sects</span>
          </button>

          {/* Night Report Trigger / Lock Status */}
          {nightUnlocked ? (
            <button
              onClick={onOpenNightReport}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg uppercase"
            >
              <Moon className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Night Report</span>
            </button>
          ) : (
            <div 
              onClick={() => {
                if (window.confirm("Night Report is locked until after 2:00 AM. Unlock dev test mode?")) {
                  setDevOverride(true);
                  onOpenNightReport();
                }
              }}
              className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-500 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:border-purple-500/50 hover:text-purple-300 transition"
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

          {/* Dropdown Options */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:border-cyan-400 transition text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs font-orbitron space-y-1">
                <button
                  onClick={() => { setDropdownOpen(false); onOpenAscensionResume(); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-cyan-950/80 text-cyan-300 font-bold flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>📜 Dao Forge Technical Resume</span>
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); onOpenApiKeyModal(); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 flex items-center gap-2"
                >
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>Setup Gemini AI Key</span>
                </button>
                <a
                  href="https://raw.githubusercontent.com/devil15371/quest-ascend-rpg/main/public/QuestAscend.apk"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 flex items-center gap-2"
                >
                  <span>📲 Download Android APK (.apk)</span>
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
