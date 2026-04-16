import { motion } from 'framer-motion';

export function VPTopUpCard({ tier, vp, priceUSD, bonusLabel, onBuy }) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onBuy?.({ tier, vp, priceUSD })}
      className="group relative w-full overflow-hidden rounded-sm border border-[#2d3644] bg-[#0f1923] p-5 text-left"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#fd4556]/0 via-[#fd4556]/0 to-[#fd4556]/0 transition-all duration-300 group-hover:from-[#fd4556]/20 group-hover:via-transparent group-hover:to-[#29d3ff]/20" />
      <div className="pointer-events-none absolute -inset-px rounded-sm opacity-0 ring-1 ring-[#ff4655] transition duration-300 group-hover:opacity-100 group-hover:shadow-[0_0_30px_rgba(255,70,85,.35)]" />

      <p className="relative z-10 text-xs uppercase tracking-[0.2em] text-[#8fa3b8]">Valorant Points</p>
      <h3 className="relative z-10 mt-3 text-3xl font-black tracking-tight text-[#ece8e1]">{vp.toLocaleString()} VP</h3>
      {bonusLabel ? (
        <span className="relative z-10 mt-2 inline-block bg-[#ff4655] px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
          {bonusLabel}
        </span>
      ) : null}
      <div className="relative z-10 mt-6 flex items-center justify-between">
        <span className="text-sm uppercase tracking-[0.16em] text-[#8fa3b8]">Tier {tier}</span>
        <span className="text-lg font-semibold text-[#ece8e1]">${priceUSD.toFixed(2)}</span>
      </div>
    </motion.button>
  );
}
