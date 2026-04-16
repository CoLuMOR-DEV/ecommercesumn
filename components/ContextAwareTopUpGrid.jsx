import { motion } from 'framer-motion';

const VP_PACKS = [
  { id: 'vp-475', vp: 475, price: 3.99 },
  { id: 'vp-1000', vp: 1000, price: 7.99 },
  { id: 'vp-2050', vp: 2050, price: 14.99 },
  { id: 'vp-3650', vp: 3650, price: 24.99 },
  { id: 'vp-5350', vp: 5350, price: 34.99 },
  { id: 'vp-11000', vp: 11000, price: 69.99 },
];

function pickRecommendedPack(requiredDeficit) {
  return VP_PACKS.find((pack) => pack.vp >= requiredDeficit) || VP_PACKS[VP_PACKS.length - 1];
}

export function ContextAwareTopUpGrid({ contextUpgrade, currentVp = 0, onSelectPack }) {
  const requiredVp = contextUpgrade?.requiredVp || 0;
  const deficit = Math.max(requiredVp - currentVp, 0);
  const recommended = pickRecommendedPack(deficit || 475);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 text-[#ece8e1]">
      <h2 className="text-center text-5xl font-black uppercase tracking-[0.06em]">Buy Valorant Points</h2>
      <p className="mt-3 text-center text-sm uppercase tracking-[0.17em] text-[#a8bbcf]">
        {contextUpgrade
          ? `Recommended for ${contextUpgrade.skinName} Level ${contextUpgrade.targetLevel} Upgrade`
          : 'Select a package'}
      </p>

      <div className="mt-2 text-center text-xs uppercase tracking-[0.17em] text-[#89a0b8]">
        Needed: {requiredVp.toLocaleString()} VP • You have: {currentVp.toLocaleString()} VP • Deficit: {deficit.toLocaleString()} VP
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {VP_PACKS.map((pack) => {
          const isRecommended = recommended.id === pack.id;

          return (
            <motion.button
              key={pack.id}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => onSelectPack?.(pack)}
              className={`relative overflow-hidden border p-5 text-left ${
                isRecommended
                  ? 'border-[#17e5c2] bg-[#133247] shadow-[0_0_28px_rgba(23,229,194,.25)]'
                  : 'border-[#29405a] bg-[#0f1c2c]'
              }`}
            >
              {isRecommended && (
                <span className="absolute left-0 top-0 bg-[#17e5c2] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#06201d]">
                  Recommended
                </span>
              )}
              <div className="mt-5 text-sm uppercase tracking-[0.2em] text-[#90a6bc]">Valorant Points</div>
              <div className="mt-2 text-3xl font-black">{pack.vp.toLocaleString()} VP</div>
              <div className="mt-3 text-sm uppercase tracking-[0.15em] text-[#b8c8d8]">${pack.price.toFixed(2)}</div>
              <div className="mt-5 border border-[#4a5f79] bg-[#f2efe9] py-2 text-center text-xs font-black uppercase tracking-[0.2em] text-[#0f1923]">
                Buy {pack.vp.toLocaleString()} VP
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
