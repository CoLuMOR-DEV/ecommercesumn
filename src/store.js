const KEY = "valorant_shop_state_v5";
const VP_ICON = "https://media.valorant-api.com/currencies/85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741/displayicon.png";

const seed = {
  admin: { username: "admin", password: "admin123" },
  wallet: { vpBalance: 0 },
  settings: {
    rotationSize: 6,
    rotationHours: 24,
    bundleRefreshHours: 24,
    shopRefreshCostVp: 500,
    bundleRefreshCostVp: 500,
    vpIcon: VP_ICON,
  },
  rotation: { shopNonce: 0, bundleNonce: 0, shopCycleStartedAt: Date.now(), bundleCycleStartedAt: Date.now() },
  products: [
    { id: 1, name: "Holo Meridian Vandal", category: "RIFLE", price: 2175, rarity: "ULTRA", image: "https://media.valorant-api.com/weaponskins/e06fd704-4171-b5ea-5028-d3befb62107d/displayicon.png", upgrades: [{ level: "VFX", video: "https://valorant.dyn.riotcdn.net/x/videos/release-12.06/72c8af91-f9f9-4044-801c-3e73ee2f2aa1_default_universal.mp4" }] },
    { id: 2, name: "Holo Meridian Operator", category: "SNIPER", price: 1775, rarity: "PREMIUM", image: "https://media.valorant-api.com/weaponskins/bbf8ffb9-49c0-75c0-cc7d-8f8f03a4bd36/displayicon.png", upgrades: [{ level: "VFX", video: "https://valorant.dyn.riotcdn.net/x/videos/release-12.06/b794b134-42d6-3138-188d-66a940a66304_default_universal.mp4" }] },
    { id: 3, name: "Holo Meridian Sheriff", category: "PISTOL", price: 1275, rarity: "PREMIUM", image: "https://media.valorant-api.com/weaponskins/19b997bb-461a-fa85-250d-a8b0b8908fea/displayicon.png", upgrades: [] },
    { id: 4, name: "Holo Meridian Judge", category: "SHOTGUN", price: 1775, rarity: "PREMIUM", image: "https://media.valorant-api.com/weaponskins/309743ac-4288-11dc-d563-88844caa2c4d/displayicon.png", upgrades: [] },
    { id: 5, name: "Holo Flare Melee", category: "MELEE", price: 4350, rarity: "EXCLUSIVE", image: "https://media.valorant-api.com/weaponskins/ff4bc096-4e6c-b67a-296a-5e814e4c0274/displayicon.png", upgrades: [] },

    { id: 6, name: "Blackthorn Vandal", category: "RIFLE", price: 1775, rarity: "PREMIUM", image: "https://media.valorant-api.com/weaponskins/4f1823dd-4a17-7511-6ac8-4aa28a6a263a/displayicon.png", upgrades: [] },
    { id: 7, name: "Blackthorn Guardian", category: "RIFLE", price: 1775, rarity: "PREMIUM", image: "https://media.valorant-api.com/weaponskins/4047a667-4d1d-bb68-df9e-a09bfa68d934/displayicon.png", upgrades: [] },
    { id: 8, name: "Blackthorn Marshal", category: "SNIPER", price: 1775, rarity: "PREMIUM", image: "https://media.valorant-api.com/weaponskins/7c47be9b-48a5-752e-7229-f7b1668239dd/displayicon.png", upgrades: [] },
    { id: 9, name: "Blackthorn Judge", category: "SHOTGUN", price: 1775, rarity: "PREMIUM", image: "https://media.valorant-api.com/weaponskins/309743ac-4288-11dc-d563-88844caa2c4d/displayicon.png", upgrades: [] },
    { id: 10, name: "Blackthorn Melee", category: "MELEE", price: 4350, rarity: "EXCLUSIVE", image: "https://media.valorant-api.com/weaponskins/e37229ed-4ddf-5e7e-e744-8fba60fa2c37/displayicon.png", upgrades: [] },

    { id: 11, name: "Jellybeam Classic", category: "PISTOL", price: 1275, rarity: "DELUXE", image: "https://media.valorant-api.com/weaponskins/0eec6f2b-4d64-9c16-7846-b8865030f61c/displayicon.png", upgrades: [] },
    { id: 12, name: "Jellybeam Bulldog", category: "RIFLE", price: 1775, rarity: "DELUXE", image: "https://media.valorant-api.com/weaponskins/d8d5d7a1-4d81-8560-54bc-0692ab40f69b/displayicon.png", upgrades: [] },
    { id: 13, name: "Jellybeam Marshal", category: "SNIPER", price: 1775, rarity: "DELUXE", image: "https://media.valorant-api.com/weaponskins/7c47be9b-48a5-752e-7229-f7b1668239dd/displayicon.png", upgrades: [] },
    { id: 14, name: "Jellybeam Operator", category: "SNIPER", price: 1775, rarity: "DELUXE", image: "https://media.valorant-api.com/weaponskins/bbf8ffb9-49c0-75c0-cc7d-8f8f03a4bd36/displayicon.png", upgrades: [] },
    { id: 15, name: "Jellybeam Melee", category: "MELEE", price: 3550, rarity: "EXCLUSIVE", image: "https://media.valorant-api.com/weaponskins/e37229ed-4ddf-5e7e-e744-8fba60fa2c37/displayicon.png", upgrades: [] },

    { id: 16, name: "SilkLeaf Phantom", category: "RIFLE", price: 1775, rarity: "PREMIUM", image: "https://media.valorant-api.com/weaponskins/25a7f0f2-4bce-7e45-b4b0-ca9264f5dfcc/displayicon.png", upgrades: [] },
    { id: 17, name: "SilkLeaf Stinger", category: "SMG", price: 1275, rarity: "DELUXE", image: "https://media.valorant-api.com/weaponskins/8068c624-4e56-4360-abe4-eab38b43820d/displayicon.png", upgrades: [] },
    { id: 18, name: "SilkLeaf Ares", category: "LMG", price: 1275, rarity: "DELUXE", image: "https://media.valorant-api.com/weaponskins/e901bdeb-405f-d06c-0733-6783274d85b0/displayicon.png", upgrades: [] },
    { id: 19, name: "SilkLeaf Shorty", category: "PISTOL", price: 875, rarity: "SELECT", image: "https://media.valorant-api.com/weaponskins/19b997bb-461a-fa85-250d-a8b0b8908fea/displayicon.png", upgrades: [] },
    { id: 20, name: "SilkLeaf Melee", category: "MELEE", price: 3550, rarity: "EXCLUSIVE", image: "https://media.valorant-api.com/weaponskins/e37229ed-4ddf-5e7e-e744-8fba60fa2c37/displayicon.png", upgrades: [] },

    { id: 21, name: "Kuronami 2.0 Phantom", category: "RIFLE", price: 2175, rarity: "ULTRA", image: "https://media.valorant-api.com/weaponskins/25a7f0f2-4bce-7e45-b4b0-ca9264f5dfcc/displayicon.png", upgrades: [] },
    { id: 22, name: "Kuronami 2.0 Operator", category: "SNIPER", price: 2175, rarity: "ULTRA", image: "https://media.valorant-api.com/weaponskins/bbf8ffb9-49c0-75c0-cc7d-8f8f03a4bd36/displayicon.png", upgrades: [] },
    { id: 23, name: "Kuronami 2.0 Guardian", category: "RIFLE", price: 2175, rarity: "ULTRA", image: "https://media.valorant-api.com/weaponskins/4047a667-4d1d-bb68-df9e-a09bfa68d934/displayicon.png", upgrades: [] },
    { id: 24, name: "Kuronami 2.0 Ghost", category: "PISTOL", price: 2175, rarity: "ULTRA", image: "https://media.valorant-api.com/weaponskins/0eec6f2b-4d64-9c16-7846-b8865030f61c/displayicon.png", upgrades: [] },
    { id: 25, name: "Narukami Melee", category: "MELEE", price: 5350, rarity: "EXCLUSIVE", image: "https://media.valorant-api.com/weaponskins/e37229ed-4ddf-5e7e-e744-8fba60fa2c37/displayicon.png", upgrades: [] },

    { id: 26, name: "Prime Vandal", category: "RIFLE", price: 1775, rarity: "PREMIUM", image: "https://media.valorant-api.com/weaponskins/b9ee2457-481c-6776-3f5b-0ca8e8f90c89/displayicon.png", upgrades: [] },
    { id: 27, name: "Reaver Sheriff", category: "PISTOL", price: 1775, rarity: "PREMIUM", image: "https://media.valorant-api.com/weaponskins/a40a6ce2-462c-c864-5d30-7b9408b98d3d/displayicon.png", upgrades: [] },
    { id: 28, name: "Neptune Odin", category: "LMG", price: 1775, rarity: "PREMIUM", image: "https://media.valorant-api.com/weaponskins/a67c2daa-4f4d-1af0-0ff4-6fafde471776/displayicon.png", upgrades: [{ level: "VFX", video: "https://valorant.dyn.riotcdn.net/x/videos/release-12.06/b794b134-42d6-3138-188d-66a940a66304_default_universal.mp4" }] },
  ],
  bundles: [
    { id: 1, name: "Holo Meridian", discount: 20, image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt5c94f47ca632a0f6/67a7be16f9679130d4ffbe74/1920x1080_V25A2_Act2_Battlepass.jpg", items: [1,2,3,4,5] },
    { id: 2, name: "Blackthorn", discount: 18, image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blta2ff0fe34b2fd5e6/67f7eb009f852f26510f3fd4/vct25-stage1-article-cover.png", items: [6,7,8,9,10] },
    { id: 3, name: "Jellybeam", discount: 16, image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blteee4855ce9cb8807/66ec6afdee4e8d390ce05ddf/1920x1080_v25A1_Act1_Competitive_MapPool.png", items: [11,12,13,14,15] },
    { id: 4, name: "SilkLeaf", discount: 17, image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blte4f865f3af8b0833/66ec6afde9a8f20dd4def4f4/1920x1080_v25A1_Act1_Battlepass.png", items: [16,17,18,19,20] },
    { id: 5, name: "Kuronami 2.0", discount: 20, image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt9948ca8e7c5fd42e/66ff2f8de8f8b96d7f4be293/1920x1080_v25A2_Act2_Kuronami.png", items: [21,22,23,24,25] },
  ],
  cart: [],
  orders: [],
};

export function getState() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return structuredClone(seed);
  }
  try { return JSON.parse(raw); } catch { localStorage.setItem(KEY, JSON.stringify(seed)); return structuredClone(seed); }
}
export function saveState(next) { localStorage.setItem(KEY, JSON.stringify(next)); }

export function getRotationProducts(state) {
  const { products, settings, rotation } = state;
  const cycleMs = settings.rotationHours * 3600000;
  const cycleIndex = Math.floor((Date.now() - rotation.shopCycleStartedAt) / cycleMs) + rotation.shopNonce;
  const start = cycleIndex % products.length;
  return Array.from({ length: Math.min(settings.rotationSize, products.length) }, (_, i) => products[(start + i) % products.length]);
}

export function getFeaturedBundle(state) {
  const cycleMs = state.settings.bundleRefreshHours * 3600000;
  const cycleIndex = Math.floor((Date.now() - state.rotation.bundleCycleStartedAt) / cycleMs) + state.rotation.bundleNonce;
  return state.bundles[cycleIndex % state.bundles.length];
}

export function bundlePrice(state, bundle) {
  const items = state.products.filter((p) => bundle.items.includes(p.id));
  const sum = items.reduce((acc, i) => acc + i.price, 0);
  return Math.round(sum * (1 - bundle.discount / 100));
}

export function getTimeLeft(targetMs) {
  const d = Math.max(0, targetMs - Date.now());
  return [Math.floor(d / 3600000), Math.floor((d % 3600000) / 60000), Math.floor((d % 60000) / 1000)].map((n) => String(n).padStart(2, "0")).join(":");
}
