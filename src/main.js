import { bundlePrice, getFeaturedBundle, getRotationProducts, getState, saveState } from "./store.js";

const page = document.body.dataset.page;
const $ = (sel) => document.querySelector(sel);
const ADMIN_SESSION_KEY = "valorant_admin_session";

function vp(value) {
  return `${Math.round(value).toLocaleString()} VP`;
}

function toast(message) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = message;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 2500);
}

function updateVpDisplay(state = getState()) {
  const vpEl = $("#vpBalance");
  if (vpEl) vpEl.textContent = state.wallet.vpBalance.toLocaleString();
}

function runShop() {
  const state = getState();
  const featured = getFeaturedBundle(state);
  const rotated = getRotationProducts(state);

  updateVpDisplay(state);

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + Number(state.settings.rotationDays));
  $("#rotationRange").textContent = `${dayStart.toDateString()} — ${dayEnd.toDateString()}`;

  if (featured) {
    $("#bundleName").textContent = featured.name;
    $("#bundleInfo").textContent = `${featured.items.length} items • ${featured.discount}% off`;
    $("#bundlePrice").textContent = bundlePrice(state, featured).toLocaleString();

    const bundleItems = state.products.filter((p) => featured.items.includes(p.id)).slice(0, 4);
    $("#bundleWeapons").innerHTML = bundleItems
      .map(
        (item) => `<div class="banner-weapon">
          <img src="${item.image}" alt="${item.name}" />
          <small>${item.name}</small>
        </div>`,
      )
      .join("");

    $("#addFeaturedBundle").addEventListener("click", () => {
      const st = getState();
      st.cart.push({
        kind: "bundle",
        id: featured.id,
        name: featured.name,
        price: bundlePrice(st, featured),
      });
      saveState(st);
      refreshCartUI();
      toast("Bundle added to checkout.");
    });
  }

  const productRoot = $("#productList");
  productRoot.innerHTML = rotated
    .map(
      (p) => `<article class="offer-card rarity-${p.rarity.toLowerCase()}">
      <div class="offer-asset-wrap">
        <img src="${p.image}" alt="${p.name}" class="offer-asset" />
      </div>
      <div class="offer-meta">
        <span>${p.name}</span>
        <button data-id="${p.id}" class="offer-buy">${vp(p.price)}</button>
      </div>
    </article>`,
    )
    .join("");

  productRoot.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;

    const st = getState();
    const product = st.products.find((p) => p.id === Number(btn.dataset.id));
    if (!product) return;

    st.cart.push({ kind: "product", id: product.id, name: product.name, price: product.price });
    saveState(st);
    refreshCartUI();
    toast(`${product.name} added.`);
  });

  setupCheckoutDrawer();
}

function refreshCartUI() {
  const state = getState();
  updateVpDisplay(state);

  const total = state.cart.reduce((acc, i) => acc + i.price, 0);

  const itemsRoot = $("#cartItems");
  if (itemsRoot) {
    itemsRoot.innerHTML = state.cart.length
      ? state.cart
          .map(
            (item, idx) => `<div class="cart-row">
            <div>
              <p>${item.name}</p>
              <small>${item.kind.toUpperCase()}</small>
            </div>
            <div class="row-gap">
              <strong>${vp(item.price)}</strong>
              <button data-remove="${idx}" class="icon-btn">Remove</button>
            </div>
          </div>`,
          )
          .join("")
      : `<p class="subtle">No items yet. Add skins or bundles from the store.</p>`;

    itemsRoot.querySelectorAll("button[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const st = getState();
        st.cart.splice(Number(btn.dataset.remove), 1);
        saveState(st);
        refreshCartUI();
      });
    });
  }

  const totalEl = $("#cartTotal");
  if (totalEl) totalEl.textContent = vp(total);
}

function setupCheckoutDrawer() {
  refreshCartUI();

  const drawer = $("#cartDrawer");
  $("#openCart")?.addEventListener("click", () => drawer.classList.remove("hidden"));
  $("#closeCart")?.addEventListener("click", () => drawer.classList.add("hidden"));

  $("#topupBtn")?.addEventListener("click", () => {
    const amount = Number($("#topupAmount").value);
    const method = $("#topupMethod").value;
    const st = getState();
    st.wallet.vpBalance += amount;
    st.orders.unshift({
      id: `TOPUP-${Date.now()}`,
      type: "VP_TOPUP",
      paymentMethod: method,
      status: "PAID_FAKE",
      amount,
      date: new Date().toISOString(),
    });
    saveState(st);
    refreshCartUI();
    toast(`Top up complete: +${vp(amount)} via ${method.toUpperCase()}.`);
  });

  $("#checkoutBtn")?.addEventListener("click", () => {
    const st = getState();
    const total = st.cart.reduce((acc, i) => acc + i.price, 0);
    const paymentMethod = $("#purchaseMethod").value;

    if (!st.cart.length) {
      toast("Your cart is empty.");
      return;
    }

    if (paymentMethod === "vp_wallet" && st.wallet.vpBalance < total) {
      toast("Not enough VP. Please top up first.");
      return;
    }

    if (paymentMethod === "vp_wallet") {
      st.wallet.vpBalance -= total;
    }

    st.orders.unshift({
      id: `ORD-${Date.now()}`,
      type: "SHOP_PURCHASE",
      date: new Date().toISOString(),
      status: "PAID_FAKE",
      paymentMethod,
      items: st.cart,
      total,
      vpBalanceAfter: st.wallet.vpBalance,
    });

    st.cart = [];
    saveState(st);
    refreshCartUI();
    toast(`Purchase complete via ${paymentMethod.toUpperCase()}.`);
  });
}

function isAdminAuthed() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

function setAdminAuthed(value) {
  sessionStorage.setItem(ADMIN_SESSION_KEY, value ? "true" : "false");
}

function mountAdminAuth() {
  const loginCard = $("#adminLoginCard");
  const app = $("#adminApp");
  const logoutBtn = $("#logoutAdmin");

  if (isAdminAuthed()) {
    loginCard.classList.add("hidden");
    app.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
  }

  $("#adminLoginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const st = getState();
    const fd = new FormData(e.currentTarget);

    const username = fd.get("username").toString();
    const password = fd.get("password").toString();

    if (username === st.admin.username && password === st.admin.password) {
      setAdminAuthed(true);
      loginCard.classList.add("hidden");
      app.classList.remove("hidden");
      logoutBtn.classList.remove("hidden");
      runAdminApp();
      toast("Admin login successful.");
      return;
    }

    toast("Invalid admin credentials.");
  });

  logoutBtn?.addEventListener("click", () => {
    setAdminAuthed(false);
    location.reload();
  });
}

function runAdminApp() {
  if (!isAdminAuthed()) return;

  const state = getState();
  const settings = $("#settingsForm");
  settings.rotationSize.value = state.settings.rotationSize;
  settings.rotationDays.value = state.settings.rotationDays;

  $("#productForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const st = getState();

    st.products.push({
      id: st.products.length ? Math.max(...st.products.map((p) => p.id)) + 1 : 1,
      name: fd.get("name").toString().trim(),
      price: Math.round(Number(fd.get("price"))),
      rarity: fd.get("rarity").toString(),
      image: fd.get("image").toString().trim(),
    });

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
      toast("Bundle needs valid product IDs.");
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
    toast("Rotation updated.");
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
      <span>#${p.id} ${p.name} — ${vp(p.price)}</span>
      <button data-del-product="${p.id}" class="icon-btn">Delete</button>
    </div>`,
    )
    .join("");

  bundleRoot.innerHTML = state.bundles
    .map(
      (b) => `<div class="stack-row">
      <span>#${b.id} ${b.name} (${b.discount}% off) — ${vp(bundlePrice(state, b))}</span>
      <button data-del-bundle="${b.id}" class="icon-btn">Delete</button>
    </div>`,
    )
    .join("");

  ordersRoot.innerHTML = state.orders.length
    ? state.orders
        .map(
          (o) => `<div class="stack-row stack-col">
      <strong>${o.id} • ${o.status}</strong>
      <span>${new Date(o.date).toLocaleString()} • ${o.paymentMethod ?? "-"}</span>
      <span>${o.type === "VP_TOPUP" ? `Top up ${vp(o.amount)}` : `${vp(o.total)} / ${o.items?.map((i) => i.name).join(", ")}`}</span>
    </div>`,
        )
        .join("")
    : `<p class="subtle">No transactions yet.</p>`;

  prodRoot.querySelectorAll("button[data-del-product]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const st = getState();
      const id = Number(btn.dataset.delProduct);
      st.products = st.products.filter((p) => p.id !== id);
      st.bundles = st.bundles.map((b) => ({ ...b, items: b.items.filter((itemId) => itemId !== id) }));
      saveState(st);
      renderAdminLists();
      toast("Product deleted.");
    });
  });

  bundleRoot.querySelectorAll("button[data-del-bundle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const st = getState();
      st.bundles = st.bundles.filter((b) => b.id !== Number(btn.dataset.delBundle));
      saveState(st);
      renderAdminLists();
      toast("Bundle deleted.");
    });
  });
}

if (page === "shop") runShop();
if (page === "admin") {
  mountAdminAuth();
  if (isAdminAuthed()) runAdminApp();
}
