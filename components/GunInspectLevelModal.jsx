import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';

const LEVELS = [1, 2, 3, 4];

export function GunInspectLevelModal({
  open,
  skin,
  unlockedLevel = 1,
  onClose,
  onUnlockRequest,
}) {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(0);

  const isLocked = selectedLevel > unlockedLevel;

  const upgradeCost = useMemo(() => {
    const costs = skin?.upgradeCosts || { 2: 300, 3: 400, 4: 500 };
    let total = 0;
    for (let level = unlockedLevel + 1; level <= selectedLevel; level += 1) {
      total += costs[level] || 0;
    }
    return total;
  }, [selectedLevel, unlockedLevel, skin?.upgradeCosts]);

  return (
    <AnimatePresence>
      {open && skin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 px-6 py-10"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="mx-auto flex h-full w-full max-w-6xl gap-5 overflow-hidden border border-[#2a3a4a] bg-[#0c1724]"
          >
            <div className="relative flex-1">
              <img
                src={skin.previewImage}
                alt={skin.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-0 top-0 bg-black/60 px-3 py-2 text-xs uppercase tracking-wider text-[#ece8e1]">
                {skin.name} Level {selectedLevel}
              </div>
            </div>

            <div className="w-[310px] border-l border-[#1e3144] bg-[#0f1923] p-4 text-[#ece8e1]">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-[0.2em]">Levels</h3>
                <button onClick={onClose} className="text-xl leading-none text-[#9db2c8]">×</button>
              </div>

              <div className="mb-5 grid grid-cols-4 gap-2">
                {LEVELS.map((level) => {
                  const locked = level > unlockedLevel;
                  const active = selectedLevel === level;

                  return (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`h-10 border text-sm font-bold ${
                        active ? 'border-[#11c9ad] bg-[#11293a]' : 'border-[#2d435a] bg-[#0d1621]'
                      } ${locked ? 'opacity-60' : ''}`}
                    >
                      {locked ? `🔒 ${level}` : `Lv ${level}`}
                    </button>
                  );
                })}
              </div>

              <h4 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[#a6b8ca]">Variants</h4>
              <div className="mb-5 grid grid-cols-4 gap-2">
                {(skin.variantSwatches || []).map((swatch, idx) => (
                  <button
                    key={swatch}
                    onClick={() => setSelectedVariant(idx)}
                    style={{ backgroundImage: `url(${swatch})` }}
                    className={`h-12 border bg-cover bg-center ${
                      selectedVariant === idx ? 'border-[#11c9ad]' : 'border-[#2d435a]'
                    }`}
                  />
                ))}
              </div>

              {isLocked ? (
                <div className="rounded border border-[#375067] bg-[#0b1520] p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#f2b6c1]">Level {selectedLevel} is locked</p>
                  <p className="mt-2 text-sm text-[#afc0d1]">Required VP: {upgradeCost.toLocaleString()}</p>
                  <button
                    onClick={() =>
                      onUnlockRequest?.({
                        skinId: skin.skinId,
                        skinName: skin.name,
                        targetLevel: selectedLevel,
                        requiredVp: upgradeCost,
                      })
                    }
                    className="mt-3 w-full border border-[#ff4655] bg-[#ff4655]/15 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#ffe6e9] transition hover:bg-[#ff4655]/25"
                  >
                    Unlock Level {selectedLevel}
                  </button>
                </div>
              ) : (
                <div className="rounded border border-[#28475d] bg-[#102334] p-3 text-xs uppercase tracking-[0.18em] text-[#c4d5e6]">
                  Level {selectedLevel} unlocked
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
