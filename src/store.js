const KEY = "valorant_shop_state_v3";

const seed = {
  admin: {
    username: "admin",
    password: "admin123",
  },
  wallet: {
    vpBalance: 4427,
  },
  settings: {
    rotationSize: 4,
    rotationHours: 24,
    bundleRefreshHours: 24,
    shopRefreshCostVp: 25,
    bundleRefreshCostVp: 40,
  },
  rotation: {
    shopNonce: 0,
    bundleNonce: 0,
    shopCycleStartedAt: Date.now(),
    bundleCycleStartedAt: Date.now(),
  },
  products: [
    {
      id: 1,
      name: "Storm Maw Judge",
      price: 875,
      rarity: "PREMIUM",
      image: "https://media.valorant-api.com/weaponskins/309743ac-4288-11dc-d563-88844caa2c4d/displayicon.png",
      upgrades: [
        {
          level: "Level 2 VFX",
          video:
            "https://media.valorant-api.com/weaponskinlevels/83af5e35-4a5a-f8e0-0622-8ebcb8a43f63/streamedvideo.mp4",
        },
      ],
    },
    {
      id: 2,
      name: "Blades of Primordia",
      price: 4350,
      rarity: "EXCLUSIVE",
      image: "https://media.valorant-api.com/weaponskins/3e633a9a-482a-30fb-90da-059ff6cd400b/displayicon.png",
      upgrades: [
        {
          level: "Level 2 VFX",
          video:
            "https://media.valorant-api.com/weaponskinlevels/35ad6cdf-4e05-df12-c0e8-e6a8818c4888/streamedvideo.mp4",
        },
      ],
    },
    {
      id: 3,
      name: "Convex Sheriff",
      price: 875,
      rarity: "SELECT",
      image: "https://media.valorant-api.com/weaponskins/e8fd8fc3-40ce-3ed1-235a-1c8d9654874f/displayicon.png",
      upgrades: [],
    },
    {
      id: 4,
      name: "Bolt Knife",
      price: 4350,
      rarity: "EXCLUSIVE",
      image: "https://media.valorant-api.com/weaponskins/ff4bc096-4e6c-b67a-296a-5e814e4c0274/displayicon.png",
      upgrades: [],
    },
    {
      id: 5,
      name: "Neo Frontier Odin",
      price: 1775,
      rarity: "PREMIUM",
      image: "https://media.valorant-api.com/weaponskins/bd647d56-4542-19cd-e1ed-4fb429c78cf9/displayicon.png",
      upgrades: [],
    },
    {
      id: 6,
      name: "Glitchpop Odin",
      price: 2175,
      rarity: "ULTRA",
      image: "https://media.valorant-api.com/weaponskins/97af88e4-4176-9fa3-4a26-57919443dab7/displayicon.png",
      upgrades: [],
    },
  ],
  bundles: [
    {
      id: 1,
      name: "Run It Back: Lunar",
      discount: 20,
      image:
        "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt5c94f47ca632a0f6/67a7be16f9679130d4ffbe74/1920x1080_V25A2_Act2_Battlepass.jpg",
      items: [1, 2, 3, 4],
    },
    {
      id: 2,
      name: "Arcane Arsenal",
      discount: 15,
      image:
        "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blta2ff0fe34b2fd5e6/67f7eb009f852f26510f3fd4/vct25-stage1-article-cover.png",
      items: [2, 5, 6],
    },
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

  const cycleMs = settings.rotationHours * 60 * 60 * 1000;
  const elapsed = Date.now() - rotation.shopCycleStartedAt;
  const cycleIndex = Math.floor(elapsed / cycleMs) + rotation.shopNonce;

  const start = cycleIndex % products.length;
  const selected = [];
  for (let i = 0; i < Math.min(settings.rotationSize, products.length); i += 1) {
    selected.push(products[(start + i) % products.length]);
  }

  return selected;
}

export function getFeaturedBundle(state) {
  if (!state.bundles.length) return null;

  const cycleMs = state.settings.bundleRefreshHours * 60 * 60 * 1000;
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
  const hours = Math.floor(diff / 3600000)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((diff % 3600000) / 60000)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor((diff % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
