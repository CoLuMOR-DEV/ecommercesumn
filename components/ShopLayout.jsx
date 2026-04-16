import { motion } from 'framer-motion';

function ShopCard({ item, featured = false, onInspect }) {
  return (
    <motion.button
      whileHover={{ y: -5 }}
      onClick={() => onInspect?.(item)}
      className={`group relative overflow-hidden border border-[#2b3646] bg-[#111f2d] text-left ${
        featured ? 'min-h-[420px]' : 'min-h-[250px]'
      }`}
    >
      <img
        src={item.imageUrl}
        alt={item.name}
        className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-300 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-[#95a7ba]">{item.tier}</p>
        <h3 className="mt-1 text-xl font-black uppercase tracking-wide text-[#ece8e1]">{item.name}</h3>
        <div className="mt-3 flex items-center justify-between text-[#ece8e1]">
          <span className="text-sm uppercase tracking-[0.15em]">{item.weaponName || 'Bundle'}</span>
          <span className="text-sm font-bold">{item.vpCost.toLocaleString()} VP</span>
        </div>
      </div>
    </motion.button>
  );
}

export function ShopLayout({ featuredBundle, dailyItems, onInspect }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 text-[#ece8e1]">
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-black uppercase tracking-[0.12em]">Featured Bundle</h2>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8fa3b8]">Ends in 3d 12h</p>
        </div>
        <ShopCard item={featuredBundle} featured onInspect={onInspect} />
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-black uppercase tracking-[0.12em]">Daily Rotation</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dailyItems.map((item) => (
            <ShopCard key={item.id} item={item} onInspect={onInspect} />
          ))}
        </div>
      </section>
    </div>
  );
}
