const KEY = "valorant_shop_state_v4";

const VP_ICON = "https://media.valorant-api.com/currencies/85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741/displayicon.png";

const seed = {
  admin: {
    username: "admin",
    password: "admin123",
  },
  wallet: {
    vpBalance: 0,
  },
  settings: {
    rotationSize: 4,
    rotationHours: 24,
    bundleRefreshHours: 24,
    shopRefreshCostVp: 500,
    bundleRefreshCostVp: 500,
    vpIcon: VP_ICON,
  },
  rotation: {
    shopNonce: 0,
    bundleNonce: 0,
    shopCycleStartedAt: Date.now(),
    bundleCycleStartedAt: Date.now(),
  },
  products: [
    { id: 1, name: "Xenohunter Odin", price: 1775, rarity: "PREMIUM", image: "https://media.valorant-api.com/weaponskins/94c085e6-48e1-c879-2552-88bf7850c5a8/displayicon.png", upgrades: [{ level: "VFX", video: "https://valorant.dyn.riotcdn.net/x/videos/release-12.06/32f7797f-4491-e21f-e40b-cfb639df3c97_default_universal.mp4" }] },
    { id: 2, name: "Neptune Odin", price: 1775, rarity: "PREMIUM", image: "https://media.valorant-api.com/weaponskins/a67c2daa-4f4d-1af0-0ff4-6fafde471776/displayicon.png", upgrades: [{ level: "VFX", video: "https://valorant.dyn.riotcdn.net/x/videos/release-12.06/b794b134-42d6-3138-188d-66a940a66304_default_universal.mp4" }] },
    { id: 3, name: "Glitchpop Odin", price: 2175, rarity: "ULTRA", image: "https://media.valorant-api.com/weaponskins/97af88e4-4176-9fa3-4a26-57919443dab7/displayicon.png", upgrades: [{ level: "VFX", video: "https://valorant.dyn.riotcdn.net/x/videos/release-12.06/72c8af91-f9f9-4044-801c-3e73ee2f2aa1_default_universal.mp4" }] },
    { id: 4, name: "Neo Frontier Odin", price: 1775, rarity: "PREMIUM", image: "https://media.valorant-api.com/weaponskins/bd647d56-4542-19cd-e1ed-4fb429c78cf9/displayicon.png", upgrades: [{ level: "VFX", video: "https://valorant.dyn.riotcdn.net/x/videos/release-12.06/729c9e7f-43be-dce4-b532-b99995902188_default_universal.mp4" }] },
    { id: 5, name: "Sentinels of Light Odin", price: 2175, rarity: "ULTRA", image: "https://media.valorant-api.com/weaponskins/67fb338a-4b21-ed70-7c2a-46bef4742b4f/displayicon.png", upgrades: [{ level: "VFX", video: "https://valorant.dyn.riotcdn.net/x/videos/release-12.06/de3742bb-488c-ef5b-8b06-e19ec538ec03_default_universal.mp4" }] },
    { id: 6, name: "Reaver Odin", price: 1775, rarity: "PREMIUM", image: "https://media.valorant-api.com/weaponskins/8dda01a6-4237-f430-ac70-c3ba677963e9/displayicon.png", upgrades: [{ level: "VFX", video: "https://valorant.dyn.riotcdn.net/x/videos/release-12.06/2ca99b17-4868-78b5-e68d-7aa0fd27a8fd_default_universal.mp4" }] },
    { id: 7, name: "Sovereign Odin", price: 1775, rarity: "PREMIUM", image: "https://media.valorant-api.com/weaponskins/a7995818-409f-c79b-20b7-28ad642f3135/displayicon.png", upgrades: [{ level: "VFX", video: "https://valorant.dyn.riotcdn.net/x/videos/release-12.06/5f846174-4bf1-0ed6-a3c9-bf819ee434f8_default_universal.mp4" }] },
    { id: 8, name: "Evori Dreamwings Odin", price: 2175, rarity: "ULTRA", image: "https://media.valorant-api.com/weaponskins/fa1c05fd-49fc-ad93-17d8-f0aaf11874cd/displayicon.png", upgrades: [{ level: "VFX", video: "https://valorant.dyn.riotcdn.net/x/videos/release-12.06/c4856f88-4097-2486-ef3b-93a5d2e0bf52_default_universal.mp4" }] },
  ],
  bundles: [
    { id: 1, name: "Abyssal Depths", discount: 20, image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt5c94f47ca632a0f6/67a7be16f9679130d4ffbe74/1920x1080_V25A2_Act2_Battlepass.jpg", items: [1,2,3,4] },
    { id: 2, name: "Celestial Judgment", discount: 18, image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blta2ff0fe34b2fd5e6/67f7eb009f852f26510f3fd4/vct25-stage1-article-cover.png", items: [3,5,6] },
    { id: 3, name: "Sovereign Circuit", discount: 15, image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blteee4855ce9cb8807/66ec6afdee4e8d390ce05ddf/1920x1080_v25A1_Act1_Competitive_MapPool.png", items: [2,7,8] },
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
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return structuredClone(seed);
  }
}

export function saveState(next) {
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function getRotationProducts(state) {
  const { products, settings, rotation } = state;
  if (!products.length) return [];
  const cycleMs = settings.rotationHours * 3600000;
  const elapsed = Date.now() - rotation.shopCycleStartedAt;
  const cycleIndex = Math.floor(elapsed / cycleMs) + rotation.shopNonce;
  const start = cycleIndex % products.length;
  return Array.from({ length: Math.min(settings.rotationSize, products.length) }, (_, i) => products[(start + i) % products.length]);
}

export function getFeaturedBundle(state) {
  if (!state.bundles.length) return null;
  const cycleMs = state.settings.bundleRefreshHours * 3600000;
  const elapsed = Date.now() - state.rotation.bundleCycleStartedAt;
  const cycleIndex = Math.floor(elapsed / cycleMs) + state.rotation.bundleNonce;
  return state.bundles[cycleIndex % state.bundles.length];
}

export function bundlePrice(state, bundle) {
  const items = state.products.filter((p) => bundle.items.includes(p.id));
  const sum = items.reduce((acc, item) => acc + item.price, 0);
  return Math.round(sum * (1 - bundle.discount / 100));
}

export function getTimeLeft(targetMs) {
  const diff = Math.max(0, targetMs - Date.now());
  const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
  const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
