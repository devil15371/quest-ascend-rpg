import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CharacterCard from './components/CharacterCard';
import GuildMasterModal from './components/GuildMasterModal';
import SubjectTracker from './components/SubjectTracker';
import DailyQuestBoard from './components/DailyQuestBoard';
import RewardShop from './components/RewardShop';
import HeatmapView from './components/HeatmapView';
import LevelUpOverlay from './components/LevelUpOverlay';
import AddSubjectModal from './components/AddSubjectModal';
import AddQuestModal from './components/AddQuestModal';
import MobileBottomNav from './components/MobileBottomNav';
import ThreeBackground from './components/ThreeBackground';
import Brain3DVisualizer from './components/Brain3DVisualizer';
import NightReportModal from './components/NightReportModal';
import ApiKeyModal from './components/ApiKeyModal';

import { loadUserData, saveUserData } from './utils/storage';
import { calculateLevel } from './utils/rpgEngine';
import { audio } from './utils/audioEngine';
import { triggerHapticFeedback, scheduleMobileReminders } from './utils/mobileNative';
import { BookOpen, Calendar, ShoppingBag, History, Brain, Moon } from 'lucide-react';

export default function App() {
  const [userData, setUserData] = useState(() => loadUserData());
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('subjects'); // 'subjects', 'brain', 'quests', 'shop', 'history'

  const [isLevelUpOpen, setIsLevelUpOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddQuestOpen, setIsAddQuestOpen] = useState(false);
  const [isNightReportOpen, setIsNightReportOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const [prevLevel, setPrevLevel] = useState(() => calculateLevel(userData?.profile?.totalExp || 0).level);

  // Initialize native mobile reminders
  useEffect(() => {
    scheduleMobileReminders();
  }, []);

  // Auto save state & check level-up trigger
  useEffect(() => {
    saveUserData(userData);

    const currentLevel = calculateLevel(userData?.profile?.totalExp || 0).level;
    if (currentLevel > prevLevel) {
      setIsLevelUpOpen(true);
      triggerHapticFeedback('levelUp');
      setPrevLevel(currentLevel);
    }
  }, [userData]);

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-12 selection:bg-cyan-500 selection:text-slate-950 relative">
      
      {/* 3D WebGL Holographic Particle Canvas Background */}
      <ThreeBackground />

      {/* Top Navbar */}
      <Navbar 
        userData={userData}
        setUserData={setUserData}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onOpenLevelUp={() => {
          triggerHapticFeedback('medium');
          setIsLevelUpOpen(true);
        }}
        onOpenNightReport={() => {
          triggerHapticFeedback('medium');
          setIsNightReportOpen(true);
        }}
        onOpenApiKeyModal={() => {
          triggerHapticFeedback('light');
          setIsApiKeyModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 relative z-10">
        
        {/* Antigravity Quantum Co-Pilot Speech Banner */}
        <GuildMasterModal 
          userData={userData} 
          setUserData={setUserData} 
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        />

        {/* Character RPG Hero Card */}
        <CharacterCard userData={userData} setUserData={setUserData} />

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800 font-orbitron">
          <button
            onMouseEnter={() => audio.playHoverSound()}
            onClick={() => { audio.playClick(); triggerHapticFeedback('light'); setActiveTab('subjects'); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap uppercase tracking-wider ${
              activeTab === 'subjects'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-black shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>GATE & Subject Prep</span>
          </button>

          <button
            onMouseEnter={() => audio.playHoverSound()}
            onClick={() => { audio.playClick(); triggerHapticFeedback('light'); setActiveTab('brain'); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap uppercase tracking-wider ${
              activeTab === 'brain'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-black shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>🧠 3D Brain Matrix</span>
          </button>

          <button
            onMouseEnter={() => audio.playHoverSound()}
            onClick={() => { audio.playClick(); triggerHapticFeedback('light'); setActiveTab('quests'); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap uppercase tracking-wider ${
              activeTab === 'quests'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-black shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Daily Morning Quests</span>
          </button>

          <button
            onMouseEnter={() => audio.playHoverSound()}
            onClick={() => { audio.playClick(); triggerHapticFeedback('light'); setActiveTab('shop'); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap uppercase tracking-wider ${
              activeTab === 'shop'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-black shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Reward Shop & Rest Days</span>
          </button>

          <button
            onMouseEnter={() => audio.playHoverSound()}
            onClick={() => { audio.playClick(); triggerHapticFeedback('light'); setActiveTab('history'); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap uppercase tracking-wider ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-black shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Activity Log Matrix</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="transition-all duration-300">
          {activeTab === 'subjects' && (
            <SubjectTracker 
              userData={userData}
              setUserData={setUserData}
              onOpenAddSubject={() => setIsAddSubjectOpen(true)}
            />
          )}

          {activeTab === 'brain' && (
            <Brain3DVisualizer 
              userData={userData}
            />
          )}

          {activeTab === 'quests' && (
            <DailyQuestBoard 
              userData={userData}
              setUserData={setUserData}
              onOpenAddQuest={() => setIsAddQuestOpen(true)}
            />
          )}

          {activeTab === 'shop' && (
            <RewardShop 
              userData={userData}
              setUserData={setUserData}
            />
          )}

          {activeTab === 'history' && (
            <HeatmapView 
              userData={userData}
              setUserData={setUserData}
            />
          )}
        </div>

      </main>

      {/* Mobile Floating Bottom Bar */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Footer */}
      <footer className="text-center text-xs font-rajdhani text-slate-500 py-6 border-t border-slate-900 mt-auto hidden md:block relative z-10">
        <p>QuestAscend RPG System • Powered by Antigravity Quantum Co-Pilot & Gemini 2.5 Flash AI Engine</p>
      </footer>

      {/* Modals */}
      <LevelUpOverlay 
        isOpen={isLevelUpOpen}
        onClose={() => setIsLevelUpOpen(false)}
        userData={userData}
      />

      <AddSubjectModal 
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        userData={userData}
        setUserData={setUserData}
      />

      <AddQuestModal 
        isOpen={isAddQuestOpen}
        onClose={() => setIsAddQuestOpen(false)}
        setUserData={setUserData}
      />

      <NightReportModal
        isOpen={isNightReportOpen}
        onClose={() => setIsNightReportOpen(false)}
        userData={userData}
        setUserData={setUserData}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

    </div>
  );
}
