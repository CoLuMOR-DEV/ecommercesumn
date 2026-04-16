import { motion } from 'framer-motion';

export const DEFAULT_SHOP_DATA = {
  featured: {
    skinId: 'holo-meridian-operator',
    name: 'Holo Meridian Collection',
    vpCost: 8700,
    banner:
      'https://media.valorant-api.com/bundles/9f0f57f9-47a7-8f5f-7e6f-77994f649d7f/displayicon.png',
    countdown: '13:12:01:43',
  },
  daily: [
    {
      skinId: 'cyrax-vandal',
      name: 'Cyrax Vandal',
      vpCost: 2175,
      image: 'https://media.valorant-api.com/weaponskins/94c74f5f-4f49-8a99-2f0b-0d508c24f17e/displayicon.png',
    },
    {
      skinId: 'ion-operator',
      name: 'Ion Operator',
      vpCost: 1775,
      image: 'https://media.valorant-api.com/weaponskins/67cd45e0-44d0-5f99-2483-11a1fce4a186/displayicon.png',
    },
    {
      skinId: 'sakura-sheriff',
      name: 'Sakura Sheriff',
      vpCost: 1275,
      image: 'https://media.valorant-api.com/weaponskins/cac7d6fb-4f84-f4db-86b1-4f8f3d12d5f7/displayicon.png',
    },
    {
      skinId: 'reaver-vandal',
      name: 'Reaver Vandal',
      vpCost: 1775,
      image: 'https://media.valorant-api.com/weaponskins/60de2a2f-4d49-a4f1-0f53-c99f17dad7f0/displayicon.png',
    },
  ],
};

function DailyCard({ item, onSelectSkin }) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      onClick={() => onSelectSkin?.(item)}
      className="group relative h-[166px] overflow-hidden border border-[#2b445e] bg-[#0a1b2e] text-left"
    >
      <img
        src={item.image}
        alt={item.name}
        className="absolute inset-0 h-full w-full object-contain p-4 opacity-90 transition duration-200 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
      <div className="absolute bottom-0 w-full border-t border-[#2f3f52] bg-black/75 px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#ece8e1]">{item.name}</span>
          <span className="text-xs font-black text-[#ece8e1]">{item.vpCost.toLocaleString()} VP</span>
        </div>
      </div>
    </motion.button>
  );
}

export function MainShopGridLayout({ shopData = DEFAULT_SHOP_DATA, onSelectSkin, onSelectFeatured }) {
  const { featured, daily } = shopData;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 text-[#ece8e1]">
      <section className="relative overflow-hidden border border-[#426080] bg-[#071423]">
        <img src={featured.banner} alt={featured.name} className="h-[320px] w-full object-cover opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/20" />

        <div className="absolute inset-0 flex items-end justify-between p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#95abc0]">Featured | {featured.countdown}</p>
            <h2 className="mt-1 text-5xl font-black uppercase leading-none">Holo Meridian</h2>
            <p className="mt-2 text-lg font-semibold uppercase tracking-wider text-[#ced8e5]">Collection</p>
          </div>

          <button
            onClick={() => onSelectFeatured?.(featured)}
            className="border border-[#394959] bg-[#f2efe9] px-8 py-3 text-xl font-black text-[#0f1923] transition hover:brightness-95"
          >
            {featured.vpCost.toLocaleString()} VP
          </button>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-[#aec0d3]">
          <span>Daily Offers</span>
          <span className="text-[#f8c54c]">18:00:40</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {daily.map((item) => (
            <DailyCard key={item.skinId} item={item} onSelectSkin={onSelectSkin} />
          ))}
        </div>
      </section>
    </div>
  );
}
