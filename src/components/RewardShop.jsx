import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Coins, 
  Shield, 
  Film, 
  UtensilsCrossed, 
  Sparkles, 
  Plus, 
  Check, 
  PackageCheck, 
  Award, 
  Swords, 
  Crown,
  Gift
} from 'lucide-react';
import { safeNum } from '../utils/safeMath';
import { DEFAULT_SHOP_ITEMS } from '../utils/rpgEngine';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

// Vector Icon Mapper to eliminate raw emoji from UI chrome
function getItemLucideIcon(itemId, category) {
  if (itemId === 'item_rest_pass') return <Shield className="w-4 h-4 text-cyan-400" />;
  if (itemId === 'item_movie_night') return <Film className="w-4 h-4 text-purple-400" />;
  if (itemId === 'item_cheat_meal') return <UtensilsCrossed className="w-4 h-4 text-orange-400" />;
  if (itemId === 'aura_cosmic_qi') return <Sparkles className="w-4 h-4 text-cyan-400" />;
  if (itemId === 'title_dao_master') return <Award className="w-4 h-4 text-amber-400" />;
  if (itemId === 'skin_semaphore_blade') return <Swords className="w-4 h-4 text-cyan-400" />;
  if (itemId === 'aura_celestial_halo') return <Crown className="w-4 h-4 text-amber-400" />;
  
  if (category?.includes('Shield') || category?.includes('Pass')) return <Shield className="w-4 h-4 text-cyan-400" />;
  if (category?.includes('Aura') || category?.includes('Cosmetic')) return <Sparkles className="w-4 h-4 text-purple-400" />;
  if (category?.includes('Title')) return <Award className="w-4 h-4 text-amber-400" />;
  if (category?.includes('Skin')) return <Swords className="w-4 h-4 text-cyan-400" />;
  return <Gift className="w-4 h-4 text-emerald-400" />;
}

export default function RewardShop({ userData, setUserData }) {
  const [showAddCustomReward, setShowAddCustomReward] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customPrice, setCustomPrice] = useState('200');

  const currentGold = safeNum(userData?.profile?.gold, 120);

  const availableItems = [
    ...DEFAULT_SHOP_ITEMS,
    ...(userData.shopItems || []).filter(item => !DEFAULT_SHOP_ITEMS.some(d => d.id === item.id))
  ];

  const buyItem = (item) => {
    const itemCost = safeNum(item.cost || item.price, 100);
    const itemName = item.title || item.name || 'Reward Item';

    if (currentGold < itemCost) {
      alert("Not enough Gold! Complete more lectures and practice questions to earn Gold.");
      return;
    }

    audio.playBuy();
    triggerHapticFeedback('heavy');

    setUserData(prev => {
      const newGold = Math.max(0, safeNum(prev.profile?.gold, 120) - itemCost);
      const existingInv = prev.inventory || [];
      const existingInvIndex = existingInv.findIndex(i => i.id === item.id);

      let updatedInv = [...existingInv];

      if (existingInvIndex >= 0) {
        updatedInv[existingInvIndex].count += 1;
      } else {
        updatedInv.push({ 
          id: item.id || 'inv_' + Date.now(), 
          name: itemName, 
          count: 1, 
          type: item.type || 'REWARD',
          category: item.category || 'Reward'
        });
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
            description: `Purchased '${itemName}' for ${itemCost} Gold`,
            expGained: 0,
            timestamp: Date.now()
          },
          ...(prev.activityLogs || [])
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
        const updatedInv = (prev.inventory || []).map(item => 
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
              description: 'Activated Rest Day Shield Pass from inventory',
              expGained: 0,
              timestamp: Date.now()
            },
            ...(prev.activityLogs || [])
          ]
        };
      });
      alert("Rest Day Shield activated for 24 hours! Your streak and EXP are protected.");
    } else if (invItem.type === 'COSMETIC' || invItem.category?.includes('Cosmetic') || invItem.category?.includes('Skin')) {
      const isTitle = invItem.category?.includes('Title') || invItem.name.includes('Title');
      const isAura = invItem.category?.includes('Aura') || invItem.name.includes('Aura');
      const isSkin = invItem.category?.includes('Skin') || invItem.name.includes('Skin');

      setUserData(prev => {
        const currentEquippedTitle = prev.profile?.equippedTitle;
        const currentEquippedAura = prev.profile?.equippedAura;
        const currentEquippedSkin = prev.profile?.equippedSkin;

        let nextTitle = currentEquippedTitle;
        let nextAura = currentEquippedAura;
        let nextSkin = currentEquippedSkin;

        if (isTitle) {
          nextTitle = currentEquippedTitle === invItem.name ? '' : invItem.name;
        } else if (isAura) {
          nextAura = currentEquippedAura === invItem.name ? '' : invItem.name;
        } else if (isSkin) {
          nextSkin = currentEquippedSkin === invItem.name ? '' : invItem.name;
        }

        return {
          ...prev,
          profile: {
            ...prev.profile,
            equippedTitle: nextTitle,
            equippedAura: nextAura,
            equippedSkin: nextSkin
          }
        };
      });
    } else {
      setUserData(prev => {
        const updatedInv = (prev.inventory || []).map(item => 
          item.id === invItem.id ? { ...item, count: item.count - 1 } : item
        ).filter(item => item.count > 0);

        return {
          ...prev,
          inventory: updatedInv,
          activityLogs: [
            {
              id: 'log_' + Date.now(),
              date: new Date().toISOString().split('T')[0],
              type: 'REWARD',
              description: `Claimed and redeemed reward: ${invItem.name}`,
              expGained: 0,
              timestamp: Date.now()
            },
            ...(prev.activityLogs || [])
          ]
        };
      });
      alert(`Enjoy your reward: ${invItem.name}!`);
    }
  };

  const handleAddCustomReward = (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    audio.playClick();
    triggerHapticFeedback('light');

    const newItem = {
      id: 'custom_item_' + Date.now(),
      title: customTitle.trim(),
      name: customTitle.trim(),
      description: "Personal reward defined by hero.",
      cost: Number(customPrice) || 200,
      price: Number(customPrice) || 200,
      category: "Personal Reward",
      type: "REWARD"
    };

    setUserData(prev => ({
      ...prev,
      shopItems: [...(prev.shopItems || DEFAULT_SHOP_ITEMS), newItem]
    }));

    setCustomTitle('');
    setShowAddCustomReward(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner - Quiet Professional Surface */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-orbitron font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              Reward Shop
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Exchange your earned gold coins for shield passes, cosmetics, or personal milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-300 font-mono font-bold text-sm flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="tabular-nums">{currentGold} Gold</span>
          </div>

          <button
            onClick={() => {
              triggerHapticFeedback('light');
              setShowAddCustomReward(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" /> Add Reward
          </button>
        </div>
      </div>

      {/* Add Custom Reward Inline Form */}
      {showAddCustomReward && (
        <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/90 shadow-xl space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Create Custom Reward</h3>
          <form onSubmit={handleAddCustomReward} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              placeholder="e.g. 2 Hours Gaming, Weekend Trip, Movie Pass"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
            <input
              type="number"
              placeholder="Price (Gold)"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="w-28 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-cyan-500"
              min="10"
              required
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowAddCustomReward(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Drawer */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
          <PackageCheck className="w-4 h-4 text-emerald-400" />
          Hero Inventory & Active Equipment
        </h3>

        {(userData.inventory || []).length === 0 ? (
          <p className="text-xs text-slate-500">Your inventory is empty. Purchase passes or rewards below.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {(userData.inventory || []).map(item => {
              const isCosmetic = item.type === 'COSMETIC' || item.category?.includes('Cosmetic');
              const isEquipped = (userData.profile?.equippedTitle === item.name) || (userData.profile?.equippedAura === item.name);

              return (
                <div 
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0">
                      {getItemLucideIcon(item.id, item.category)}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-medium text-slate-200 block truncate">{item.name || item.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {isCosmetic ? (isEquipped ? 'Active' : 'Equippable') : `Qty: ${item.count}`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => useInventoryItem(item)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition active:scale-95 flex-shrink-0 ${
                      isCosmetic
                        ? isEquipped
                          ? 'bg-amber-950/80 border border-amber-500/50 text-amber-300'
                          : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300'
                        : 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300'
                    }`}
                  >
                    {isCosmetic ? (isEquipped ? 'Equipped' : 'Equip') : 'Use'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shop Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {availableItems.map(item => {
          const itemName = item.title || item.name || "Reward Item";
          const itemCost = safeNum(item.cost || item.price, 100);
          const itemCategory = item.category || "Shield Pass";
          const canAfford = currentGold >= itemCost;

          return (
            <div
              key={item.id || item.title}
              className="rounded-xl p-4 border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    {itemCategory}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
                    <Coins className="w-3.5 h-3.5" />
                    <span className="tabular-nums">{itemCost}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    {getItemLucideIcon(item.id, item.category)}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100">{itemName}</h4>
                </div>

                <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-500">
                  {canAfford ? 'Available' : `Need ${itemCost - currentGold} gold`}
                </span>

                <button
                  onClick={() => buyItem(item)}
                  disabled={!canAfford}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 ${
                    canAfford
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm shadow-amber-500/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? 'Purchase' : 'Locked'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
