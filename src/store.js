const KEY = "valorant_shop_state_v1";

const seed = {
  settings: {
    rotationSize: 4,
    rotationDays: 1,
  },
  products: [
    {
      id: 1,
      name: "Prime Vandal",
      price: 17.99,
      rarity: "PREMIUM",
      image: "https://images.unsplash.com/photo-1633545492787-cf4c8e9e6f83?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 2,
      name: "Reaver Operator",
      price: 19.99,
      rarity: "PREMIUM",
      image: "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 3,
      name: "Ion Sheriff",
      price: 12.99,
      rarity: "DELUXE",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 4,
      name: "Elderflame Knife",
      price: 24.99,
      rarity: "EXCLUSIVE",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 5,
      name: "Spectrum Phantom",
      price: 21.99,
      rarity: "ULTRA",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80",
    },
  ],
  bundles: [
    {
      id: 1,
      name: "Prime Collection",
      discount: 15,
      image: "https://images.unsplash.com/photo-1542751371-29b74cdd0b60?auto=format&fit=crop&w=900&q=80",
      items: [1, 2, 3],
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

export function resetState() {
  localStorage.setItem(KEY, JSON.stringify(seed));
}

export function getRotationProducts(state) {
  const { products, settings } = state;
  if (!products.length) return [];

  const msPerDay = 1000 * 60 * 60 * 24;
  const epochDays = Math.floor(Date.now() / msPerDay);
  const windowSize = settings.rotationDays * msPerDay;
  const cycle = Math.floor(Date.now() / windowSize);

  const start = (cycle + epochDays) % products.length;
  const selected = [];
  for (let i = 0; i < Math.min(settings.rotationSize, products.length); i += 1) {
    selected.push(products[(start + i) % products.length]);
  }
  return selected;
}

export function getFeaturedBundle(state) {
  if (!state.bundles.length) return null;
  const idx = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % state.bundles.length;
  return state.bundles[idx];
}

export function bundlePrice(state, bundle) {
  const items = state.products.filter((p) => bundle.items.includes(p.id));
  const sum = items.reduce((acc, i) => acc + i.price, 0);
  return Number((sum * (1 - bundle.discount / 100)).toFixed(2));
}
