import React, { useState } from 'react';
import { ShoppingBag, Coins, Shield, Gamepad2, Pizza, Sparkles, Plus, Check, PackageCheck } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function RewardShop({ userData, setUserData }) {
  const [showAddCustomReward, setShowAddCustomReward] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customPrice, setCustomPrice] = useState('200');

  const buyItem = (item) => {
    if (userData.profile.gold < item.price) {
      alert("Not enough Gold Coins! Complete lectures and daily quests to earn more.");
      return;
    }

    audio.playBuy();
    triggerHapticFeedback('heavy');

    setUserData(prev => {
      const newGold = prev.profile.gold - item.price;
      const existingInvIndex = prev.inventory.findIndex(i => i.id === item.id || i.type === item.type);
      let updatedInv = [...prev.inventory];

      if (item.type === 'REST_PASS') {
        if (existingInvIndex >= 0) {
          updatedInv[existingInvIndex].count += 1;
        } else {
          updatedInv.push({ id: item.id, name: item.name, count: 1, type: item.type });
        }
      } else if (item.type === 'COSMETIC_TITLE') {
        const titles = prev.profile.unlockedTitles.includes(item.titleName) 
          ? prev.profile.unlockedTitles 
          : [...prev.profile.unlockedTitles, item.titleName];

        return {
          ...prev,
          profile: {
            ...prev.profile,
            gold: newGold,
            unlockedTitles: titles,
            activeTitle: item.titleName
          },
          activityLogs: [
            {
              id: 'log_' + Date.now(),
              date: new Date().toISOString().split('T')[0],
              type: 'SHOP',
              description: `Unlocked Title: '${item.titleName}'`,
              expGained: 0,
              timestamp: Date.now()
            },
            ...prev.activityLogs
          ]
        };
      } else {
        if (existingInvIndex >= 0) {
          updatedInv[existingInvIndex].count += 1;
        } else {
          updatedInv.push({ id: item.id, name: item.name, count: 1, type: item.type });
        }
      }

      return {
        ...prev,
        profile: { ...prev.profile, gold: newGold },
        inventory: updatedInv,
        activityLogs: [
          {
            id: 'log_' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            type: 'SHOP',
            description: `Purchased '${item.name}' for ${item.price} Gold`,
            expGained: 0,
            timestamp: Date.now()
          },
          ...prev.activityLogs
        ]
      };
    });
  };

  const useInventoryItem = (invItem) => {
    audio.playBuy();
    triggerHapticFeedback('heavy');

    if (invItem.type === 'REST_PASS') {
      const restUntil = new Date(Date.now() + 86400000).toISOString();

      setUserData(prev => {
        const updatedInv = prev.inventory.map(item => 
          item.id === invItem.id ? { ...item, count: item.count - 1 } : item
        ).filter(item => item.count > 0);

        return {
          ...prev,
          profile: { ...prev.profile, restDayActiveUntil: restUntil },
          inventory: updatedInv,
          activityLogs: [
            {
              id: 'log_' + Date.now(),
              date: new Date().toISOString().split('T')[0],
              type: 'BUFF',
              description: 'Activated 🛡️ Rest Day Shield Pass from inventory',
              expGained: 0,
              timestamp: Date.now()
            },
            ...prev.activityLogs
          ]
        };
      });
    } else {
      setUserData(prev => {
        const updatedInv = prev.inventory.map(item => 
          item.id === invItem.id ? { ...item, count: item.count - 1 } : item
        ).filter(item => item.count > 0);

        return {
          ...prev,
          inventory: updatedInv,
          activityLogs: [
            {
              id: 'log_' + Date.now(),
              date: new Date().toISOString().split('T')[0],
              type: 'REWARD_CLAIMED',
              description: `Claimed Real-Life Reward: '${invItem.name}'`,
              expGained: 0,
              timestamp: Date.now()
            },
            ...prev.activityLogs
          ]
        };
      });
      alert(`🎉 Enjoy your reward: ${invItem.name}! You earned it!`);
    }
  };

  const handleAddCustomReward = (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const price = parseInt(customPrice) || 150;
    const newItem = {
      id: 'custom_reward_' + Date.now(),
      name: customTitle.trim(),
      category: "Custom Reward",
      price,
      icon: "Sparkles",
      description: "Custom user-defined real-life reward.",
      type: "REAL_REWARD",
      stock: -1
    };

    setUserData(prev => ({
      ...prev,
      shopItems: [...prev.shopItems, newItem]
    }));

    setCustomTitle('');
    setShowAddCustomReward(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="cyber-panel p-6 rounded-2xl border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-950/80 cyber-hud-brackets">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-orbitron font-black text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              CYBER REWARD SHOP
            </h2>
          </div>
          <p className="text-xs font-rajdhani text-slate-400 mt-1">
            Exchange your earned Gold Coins for Rest Day Passes, custom titles, or real-life guilty pleasures!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 font-orbitron font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20">
            <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>{userData.profile.gold} GOLD</span>
          </div>

          <button
            onClick={() => {
              triggerHapticFeedback('light');
              setShowAddCustomReward(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-300 text-xs font-orbitron font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-purple-400" /> Add Custom Reward
          </button>
        </div>
      </div>

      {/* Add Custom Reward Modal Form */}
      {showAddCustomReward && (
        <div className="cyber-panel p-5 rounded-2xl border border-cyan-500/50 bg-slate-950/95 shadow-2xl cyber-hud-brackets">
          <h3 className="text-sm font-orbitron font-bold text-white mb-3">Create Real-Life Custom Reward</h3>
          <form onSubmit={handleAddCustomReward} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. 2 Hours Gaming, Buy a Book, Movie Pass"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              required
            />
            <input
              type="number"
              placeholder="Price (Gold)"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="w-32 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
              min="10"
              required
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-orbitron font-bold text-xs"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowAddCustomReward(false)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 font-orbitron text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Drawer */}
      <div className="cyber-panel p-5 rounded-2xl border border-cyan-500/30 bg-slate-950/80 cyber-hud-brackets">
        <h3 className="text-sm font-orbitron font-bold text-slate-200 flex items-center gap-2 mb-3">
          <PackageCheck className="w-4 h-4 text-emerald-400" />
          Hero Inventory & Unused Passes
        </h3>

        {userData.inventory.length === 0 ? (
          <p className="text-xs font-rajdhani text-slate-500">Your inventory is empty. Purchase items below!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {userData.inventory.map(item => (
              <div 
                key={item.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="text-xs font-orbitron font-bold text-white block">{item.name}</span>
                  <span className="text-[11px] font-rajdhani text-emerald-400 font-semibold">Qty: {item.count}</span>
                </div>
                <button
                  onClick={() => useInventoryItem(item)}
                  className="px-3 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-orbitron font-bold text-xs active:scale-95"
                >
                  Use Pass
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shop Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {userData.shopItems.map(item => {
          const canAfford = userData.profile.gold >= item.price;
          const isTitleUnlocked = item.type === 'COSMETIC_TITLE' && userData.profile.unlockedTitles?.includes(item.titleName);

          return (
            <div
              key={item.id}
              className="cyber-panel-interactive rounded-2xl p-5 border border-slate-800 flex flex-col justify-between cyber-hud-brackets bg-slate-950/80"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[9px] font-orbitron font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-orbitron font-extrabold text-amber-400">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{item.price}</span>
                  </div>
                </div>

                <h4 className="text-base font-orbitron font-bold text-white mb-1">{item.name}</h4>
                <p className="text-xs font-rajdhani text-slate-400 mb-4">{item.description}</p>
              </div>

              {isTitleUnlocked ? (
                <button
                  disabled
                  className="w-full py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-400 font-orbitron text-xs font-bold flex items-center justify-center gap-1 cursor-default"
                >
                  <Check className="w-3.5 h-3.5" /> Unlocked & Equipped
                </button>
              ) : (
                <button
                  onClick={() => buyItem(item)}
                  disabled={!canAfford}
                  className={`w-full py-2 rounded-xl font-orbitron text-xs font-bold transition flex items-center justify-center gap-1.5 uppercase ${
                    canAfford
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-500/25 active:scale-95'
                      : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  {canAfford ? 'Buy Item' : 'Not Enough Gold'}
                </button>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
