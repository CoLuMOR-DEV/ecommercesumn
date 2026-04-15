import {
  bundlePrice,
  getFeaturedBundle,
  getRotationProducts,
  getState,
  saveState,
} from "./store.js";

const page = document.body.dataset.page;
const $ = (sel) => document.querySelector(sel);

function money(value) {
  return `$${value.toFixed(2)}`;
}

function toast(message) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = message;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 2200);
}

function runShop() {
  const state = getState();
  const featured = getFeaturedBundle(state);
  const rotated = getRotationProducts(state);

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + Number(state.settings.rotationDays));

  $("#rotationRange").textContent = `${dayStart.toDateString()} — ${dayEnd.toDateString()}`;

  const bundleRoot = $("#bundleList");
  bundleRoot.innerHTML = featured
    ? `<article class="bundle-card">
        <img src="${featured.image}" alt="${featured.name}" />
        <div class="meta">
          <p class="eyebrow">FEATURED</p>
          <h3>${featured.name}</h3>
          <p class="subtle">${featured.items.length} items • ${featured.discount}% OFF</p>
          <p class="price">${money(bundlePrice(state, featured))}</p>
          <button data-kind="bundle" data-id="${featured.id}" class="cta-btn">Add Bundle</button>
        </div>
      </article>`
    : `<p class="subtle">No bundles configured yet. Add one from Admin Panel.</p>`;

  const productRoot = $("#productList");
  productRoot.innerHTML = rotated
    .map(
      (p) => `<article class="product-card">
      <img src="${p.image}" alt="${p.name}" />
      <div class="meta">
        <p class="eyebrow">${p.rarity}</p>
        <h3>${p.name}</h3>
        <p class="price">${money(p.price)}</p>
      </div>
      <button data-kind="product" data-id="${p.id}" class="ghost-btn">Add to Cart</button>
    </article>`,
    )
    .join("");

  productRoot.addEventListener("click", onAddToCart);
  bundleRoot.addEventListener("click", onAddToCart);

  setupCart();
}

function onAddToCart(e) {
  const target = e.target.closest("button[data-kind]");
  if (!target) return;
  const state = getState();
  const id = Number(target.dataset.id);
  const kind = target.dataset.kind;

  if (kind === "product") {
    const product = state.products.find((p) => p.id === id);
    if (!product) return;
    state.cart.push({ kind, id, name: product.name, price: product.price });
  }

  if (kind === "bundle") {
    const bundle = state.bundles.find((b) => b.id === id);
    if (!bundle) return;
    state.cart.push({ kind, id, name: bundle.name, price: bundlePrice(state, bundle) });
  }

  saveState(state);
  refreshCartUI();
  toast("Added to cart.");
}

function refreshCartUI() {
  const state = getState();
  const count = state.cart.length;
  const total = state.cart.reduce((acc, i) => acc + i.price, 0);

  const cc = $("#cartCount");
  if (cc) cc.textContent = String(count);

  const items = $("#cartItems");
  if (items) {
    items.innerHTML = count
      ? state.cart
          .map(
            (item, idx) => `<div class="cart-row">
        <div>
          <p>${item.name}</p>
          <small>${item.kind.toUpperCase()}</small>
        </div>
        <div class="row-gap">
          <strong>${money(item.price)}</strong>
          <button data-remove="${idx}" class="icon-btn">Remove</button>
        </div>
      </div>`,
          )
          .join("")
      : `<p class="subtle">Your cart is empty.</p>`;

    items.querySelectorAll("button[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const st = getState();
        st.cart.splice(Number(btn.dataset.remove), 1);
        saveState(st);
        refreshCartUI();
      });
    });
  }

  const ct = $("#cartTotal");
  if (ct) ct.textContent = money(total);
}

function setupCart() {
  refreshCartUI();
  const drawer = $("#cartDrawer");
  $("#openCart")?.addEventListener("click", () => drawer.classList.remove("hidden"));
  $("#closeCart")?.addEventListener("click", () => drawer.classList.add("hidden"));

  $("#checkoutBtn")?.addEventListener("click", () => {
    const st = getState();
    if (!st.cart.length) {
      toast("Cart is empty.");
      return;
    }
    const total = st.cart.reduce((acc, i) => acc + i.price, 0);
    st.orders.unshift({
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      status: "PAID_FAKE",
      items: st.cart,
      total: Number(total.toFixed(2)),
    });
    st.cart = [];
    saveState(st);
    refreshCartUI();
    toast("Fake checkout complete.");
  });
}

function runAdmin() {
  const state = getState();

  const settings = $("#settingsForm");
  settings.rotationSize.value = state.settings.rotationSize;
  settings.rotationDays.value = state.settings.rotationDays;

  $("#productForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const st = getState();
    const product = {
      id: st.products.length ? Math.max(...st.products.map((p) => p.id)) + 1 : 1,
      name: fd.get("name").toString().trim(),
      price: Number(fd.get("price")),
      rarity: fd.get("rarity").toString(),
      image: fd.get("image").toString().trim(),
    };
    st.products.push(product);
    saveState(st);
    e.currentTarget.reset();
    renderAdminLists();
    toast("Product added.");
  });

  $("#bundleForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const st = getState();
    const itemIds = fd
      .get("productIds")
      .toString()
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((id) => st.products.some((p) => p.id === id));

    if (!itemIds.length) {
      toast("Bundle requires valid product IDs.");
      return;
    }

    st.bundles.push({
      id: st.bundles.length ? Math.max(...st.bundles.map((b) => b.id)) + 1 : 1,
      name: fd.get("name").toString().trim(),
      discount: Number(fd.get("discount")),
      image: fd.get("image").toString().trim(),
      items: itemIds,
    });
    saveState(st);
    e.currentTarget.reset();
    renderAdminLists();
    toast("Bundle created.");
  });

  settings.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const st = getState();
    st.settings.rotationSize = Number(fd.get("rotationSize"));
    st.settings.rotationDays = Number(fd.get("rotationDays"));
    saveState(st);
    toast("Rotation settings updated.");
  });

  renderAdminLists();
}

function renderAdminLists() {
  const state = getState();
  const prodRoot = $("#adminProductList");
  const bundleRoot = $("#adminBundleList");
  const ordersRoot = $("#adminOrders");

  prodRoot.innerHTML = state.products
    .map(
      (p) => `<div class="stack-row">
      <span>#${p.id} ${p.name} (${p.rarity}) - ${money(p.price)}</span>
      <button data-del-product="${p.id}" class="icon-btn">Delete</button>
    </div>`,
    )
    .join("");

  bundleRoot.innerHTML = state.bundles
    .map(
      (b) => `<div class="stack-row">
      <span>#${b.id} ${b.name} (${b.discount}% OFF) - ${money(bundlePrice(state, b))}</span>
      <button data-del-bundle="${b.id}" class="icon-btn">Delete</button>
    </div>`,
    )
    .join("");

  ordersRoot.innerHTML = state.orders.length
    ? state.orders
        .map(
          (o) => `<div class="stack-row stack-col">
      <strong>${o.id} • ${o.status}</strong>
      <span>${new Date(o.date).toLocaleString()} • ${money(o.total)}</span>
      <span>${o.items.map((i) => i.name).join(", ")}</span>
    </div>`,
        )
        .join("")
    : `<p class="subtle">No fake checkouts yet.</p>`;

  prodRoot.querySelectorAll("button[data-del-product]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const st = getState();
      const id = Number(btn.dataset.delProduct);
      st.products = st.products.filter((p) => p.id !== id);
      st.bundles = st.bundles.map((b) => ({
        ...b,
        items: b.items.filter((itemId) => itemId !== id),
      }));
      saveState(st);
      renderAdminLists();
      toast("Product removed.");
    });
  });

  bundleRoot.querySelectorAll("button[data-del-bundle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const st = getState();
      st.bundles = st.bundles.filter((b) => b.id !== Number(btn.dataset.delBundle));
      saveState(st);
      renderAdminLists();
      toast("Bundle removed.");
    });
  });
}

if (page === "shop") runShop();
if (page === "admin") runAdmin();
