import {
  bundlePrice,
  getFeaturedBundle,
  getRotationProducts,
  getState,
  getTimeLeft,
  saveState,
} from "./store.js";

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
  setTimeout(() => t.classList.add("hidden"), 2400);
}

function pingSound(frequency = 640, duration = 0.08) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = frequency;
    gain.gain.value = 0.03;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // ignore
  }
}

function updateVpDisplay(state = getState()) {
  const text = state.wallet.vpBalance.toLocaleString();
  if ($("#vpBalance")) $("#vpBalance").textContent = text;
  if ($("#walletPanelBalance")) $("#walletPanelBalance").textContent = text;
}

function renderTimers(state) {
  const shopCycleMs = state.settings.rotationHours * 60 * 60 * 1000;
  const bundleCycleMs = state.settings.bundleRefreshHours * 60 * 60 * 1000;

  const nextShop = state.rotation.shopCycleStartedAt + shopCycleMs;
  const nextBundle = state.rotation.bundleCycleStartedAt + bundleCycleMs;

  const shopTimer = $("#shopTimer");
  const bundleTimer = $("#bundleTimer");

  if (shopTimer) shopTimer.textContent = getTimeLeft(nextShop);
  if (bundleTimer) bundleTimer.textContent = getTimeLeft(nextBundle);
}

function runShop() {
  const state = getState();
  const featured = getFeaturedBundle(state);
  const rotated = getRotationProducts(state);

  updateVpDisplay(state);
  renderTimers(state);

  const start = new Date(state.rotation.shopCycleStartedAt);
  const end = new Date(state.rotation.shopCycleStartedAt + state.settings.rotationHours * 3600000);
  $("#rotationRange").textContent = `${start.toLocaleString()} - ${end.toLocaleString()}`;

  if (featured) {
    $("#bundleName").textContent = featured.name;
    $("#bundleInfo").textContent = `${featured.items.length} items • ${featured.discount}% off`;
    $("#bundlePrice").textContent = bundlePrice(state, featured).toLocaleString();

    const featuredItems = state.products.filter((item) => featured.items.includes(item.id)).slice(0, 4);
    $("#bundleWeapons").innerHTML = featuredItems
      .map(
        (item) => `<div class="banner-weapon float-item">
          <img src="${item.image}" alt="${item.name}" />
          <small>${item.name}</small>
        </div>`,
      )
      .join("");

    $("#addFeaturedBundle").addEventListener("click", () => {
      const st = getState();
      st.cart.push({ kind: "bundle", id: featured.id, name: featured.name, price: bundlePrice(st, featured) });
      saveState(st);
      refreshCartUI();
      pingSound(760);
      toast("Bundle added to checkout");
    });
  }

  const productRoot = $("#productList");
  productRoot.innerHTML = rotated
    .map(
      (item) => `<article class="offer-card rarity-${item.rarity.toLowerCase()} fade-in-up">
      <div class="offer-asset-wrap inspect-target" data-inspect-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="offer-asset" />
      </div>
      <div class="offer-meta">
        <span>${item.name}</span>
        <div class="offer-actions">
          <button data-inspect-id="${item.id}" class="icon-btn">Inspect</button>
          <button data-id="${item.id}" class="offer-buy"><img src="./src/vp-logo.svg" alt="VP"/> ${item.price}</button>
        </div>
      </div>
    </article>`,
    )
    .join("");

  productRoot.addEventListener("click", (e) => {
    const buyBtn = e.target.closest("button[data-id]");
    const inspectBtn = e.target.closest("[data-inspect-id]");

    if (buyBtn) {
      const st = getState();
      const product = st.products.find((p) => p.id === Number(buyBtn.dataset.id));
      if (!product) return;
      st.cart.push({ kind: "product", id: product.id, name: product.name, price: product.price });
      saveState(st);
      refreshCartUI();
      pingSound(730);
      toast(`${product.name} added`);
      return;
    }

    if (inspectBtn) {
      const st = getState();
      const product = st.products.find((p) => p.id === Number(inspectBtn.dataset.inspectId));
      if (!product) return;
      openInspect(product);
    }
  });

  setupCheckoutDrawer();

  setInterval(() => {
    renderTimers(getState());
  }, 1000);
}

function openInspect(product) {
  $("#inspectImage").src = product.image;
  $("#inspectTitle").textContent = product.name;
  $("#inspectPrice").textContent = vp(product.price);

  const list = $("#upgradeList");
  const video = $("#upgradeVideo");

  const upgrades = product.upgrades?.length ? product.upgrades : [{ level: "Base", video: "" }];

  list.innerHTML = upgrades
    .map(
      (up, idx) => `<button data-video="${up.video}" class="ghost-btn ${idx === 0 ? "active-upgrade" : ""}">${up.level}</button>`,
    )
    .join("");

  video.src = upgrades[0].video || "";

  list.querySelectorAll("button[data-video]").forEach((btn) => {
    btn.addEventListener("click", () => {
      list.querySelectorAll("button").forEach((b) => b.classList.remove("active-upgrade"));
      btn.classList.add("active-upgrade");
      video.src = btn.dataset.video;
      pingSound(520, 0.06);
    });
  });

  $("#inspectModal").classList.remove("hidden");
}

function refreshCartUI() {
  const state = getState();
  updateVpDisplay(state);

  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  const cartRoot = $("#cartItems");

  if (cartRoot) {
    cartRoot.innerHTML = state.cart.length
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
      : `<p class="subtle">Your checkout bag is empty.</p>`;

    cartRoot.querySelectorAll("button[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const st = getState();
        st.cart.splice(Number(btn.dataset.remove), 1);
        saveState(st);
        refreshCartUI();
      });
    });
  }

  if ($("#cartTotal")) $("#cartTotal").textContent = vp(total);
}

function setupCheckoutDrawer() {
  refreshCartUI();

  const drawer = $("#cartDrawer");
  $("#openCart")?.addEventListener("click", () => drawer.classList.remove("hidden"));
  $("#closeCart")?.addEventListener("click", () => drawer.classList.add("hidden"));

  $("#closeInspect")?.addEventListener("click", () => $("#inspectModal").classList.add("hidden"));
  $("#inspectModal")?.addEventListener("click", (e) => {
    if (e.target.id === "inspectModal") $("#inspectModal").classList.add("hidden");
  });

  document.querySelectorAll(".tab-btn").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll(".panel").forEach((panel) => panel.classList.remove("active"));
      $(`#${tab.dataset.tab}Panel`).classList.add("active");
    });
  });

  $("#topupBtn")?.addEventListener("click", () => {
    const amount = Number($("#topupAmount").value);
    const method = $("#topupMethod").value;

    const st = getState();
    st.wallet.vpBalance += amount;
    st.orders.unshift({
      id: `TOPUP-${Date.now()}`,
      type: "TOPUP",
      date: new Date().toISOString(),
      status: "COMPLETED",
      paymentMethod: method,
      amount,
    });

    saveState(st);
    refreshCartUI();
    pingSound(880, 0.1);
    toast(`Top up successful: +${vp(amount)}`);
  });

  $("#checkoutBtn")?.addEventListener("click", () => {
    const st = getState();
    const method = $("#purchaseMethod").value;
    const total = st.cart.reduce((sum, item) => sum + item.price, 0);

    if (!st.cart.length) {
      toast("Add items to continue");
      return;
    }

    if (method === "vp_wallet" && st.wallet.vpBalance < total) {
      toast("Insufficient VP balance");
      return;
    }

    if (method === "vp_wallet") st.wallet.vpBalance -= total;

    st.orders.unshift({
      id: `ORD-${Date.now()}`,
      type: "PURCHASE",
      date: new Date().toISOString(),
      status: "CONFIRMED",
      paymentMethod: method,
      total,
      items: st.cart,
    });

    st.cart = [];
    saveState(st);
    refreshCartUI();
    pingSound(940, 0.13);
    toast("Purchase complete");
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
  const adminApp = $("#adminApp");
  const logout = $("#logoutAdmin");

  const showAuthed = () => {
    loginCard.classList.add("hidden");
    adminApp.classList.remove("hidden");
    logout.classList.remove("hidden");
  };

  if (isAdminAuthed()) showAuthed();

  $("#adminLoginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const st = getState();

    if (fd.get("username") === st.admin.username && fd.get("password") === st.admin.password) {
      setAdminAuthed(true);
      showAuthed();
      runAdminApp();
      toast("Welcome back");
      return;
    }

    toast("Login failed");
  });

  logout?.addEventListener("click", () => {
    setAdminAuthed(false);
    location.reload();
  });
}

function runAdminApp() {
  if (!isAdminAuthed()) return;

  const state = getState();
  const settings = $("#settingsForm");
  settings.rotationSize.value = state.settings.rotationSize;
  settings.rotationHours.value = state.settings.rotationHours;
  settings.bundleRefreshHours.value = state.settings.bundleRefreshHours;

  $("#forceShopRefresh")?.addEventListener("click", () => {
    const st = getState();
    if (st.wallet.vpBalance < st.settings.shopRefreshCostVp) {
      toast("Not enough VP for shop refresh");
      return;
    }
    st.wallet.vpBalance -= st.settings.shopRefreshCostVp;
    st.rotation.shopNonce += 1;
    st.rotation.shopCycleStartedAt = Date.now();
    saveState(st);
    toast("Shop refreshed");
  });

  $("#forceBundleRefresh")?.addEventListener("click", () => {
    const st = getState();
    if (st.wallet.vpBalance < st.settings.bundleRefreshCostVp) {
      toast("Not enough VP for bundle refresh");
      return;
    }
    st.wallet.vpBalance -= st.settings.bundleRefreshCostVp;
    st.rotation.bundleNonce += 1;
    st.rotation.bundleCycleStartedAt = Date.now();
    saveState(st);
    toast("Bundle refreshed");
  });

  $("#productForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const st = getState();

    st.products.push({
      id: st.products.length ? Math.max(...st.products.map((p) => p.id)) + 1 : 1,
      name: fd.get("name").toString().trim(),
      price: Math.round(Number(fd.get("price"))),
      rarity: fd.get("rarity").toString(),
      image: fd.get("image").toString().trim(),
      upgrades: fd.get("video") ? [{ level: "Preview", video: fd.get("video").toString().trim() }] : [],
    });

    saveState(st);
    e.currentTarget.reset();
    renderAdminLists();
    toast("Product added");
  });

  $("#bundleForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const st = getState();

    const bundleId = Number(fd.get("bundleId"));
    const itemIds = fd
      .get("productIds")
      .toString()
      .split(",")
      .map((n) => Number(n.trim()))
      .filter((id) => st.products.some((p) => p.id === id));

    if (!itemIds.length) {
      toast("Please include valid product IDs");
      return;
    }

    if (bundleId && st.bundles.some((b) => b.id === bundleId)) {
      st.bundles = st.bundles.map((b) =>
        b.id === bundleId
          ? {
              ...b,
              name: fd.get("name").toString().trim(),
              discount: Number(fd.get("discount")),
              image: fd.get("image").toString().trim(),
              items: itemIds,
            }
          : b,
      );
      toast("Bundle updated");
    } else {
      st.bundles.push({
        id: st.bundles.length ? Math.max(...st.bundles.map((b) => b.id)) + 1 : 1,
        name: fd.get("name").toString().trim(),
        discount: Number(fd.get("discount")),
        image: fd.get("image").toString().trim(),
        items: itemIds,
      });
      toast("Bundle created");
    }

    saveState(st);
    e.currentTarget.reset();
    renderAdminLists();
  });

  settings?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const st = getState();
    st.settings.rotationSize = Number(fd.get("rotationSize"));
    st.settings.rotationHours = Number(fd.get("rotationHours"));
    st.settings.bundleRefreshHours = Number(fd.get("bundleRefreshHours"));
    saveState(st);
    toast("Settings saved");
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
      (b) => `<div class="stack-row stack-col">
      <strong>#${b.id} ${b.name}</strong>
      <span>${b.items.length} items • ${b.discount}% off • ${vp(bundlePrice(state, b))}</span>
      <button data-fill-bundle="${b.id}" class="ghost-btn">Load into form</button>
      <button data-del-bundle="${b.id}" class="icon-btn">Delete</button>
    </div>`,
    )
    .join("");

  ordersRoot.innerHTML = state.orders.length
    ? state.orders
        .map(
          (o) => `<div class="stack-row stack-col"><strong>${o.id}</strong><span>${new Date(o.date).toLocaleString()} • ${o.status}</span></div>`,
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
      toast("Product deleted");
    });
  });

  bundleRoot.querySelectorAll("button[data-del-bundle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const st = getState();
      st.bundles = st.bundles.filter((b) => b.id !== Number(btn.dataset.delBundle));
      saveState(st);
      renderAdminLists();
      toast("Bundle deleted");
    });
  });

  bundleRoot.querySelectorAll("button[data-fill-bundle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const st = getState();
      const b = st.bundles.find((x) => x.id === Number(btn.dataset.fillBundle));
      if (!b) return;
      const form = $("#bundleForm");
      form.bundleId.value = b.id;
      form.name.value = b.name;
      form.discount.value = b.discount;
      form.image.value = b.image;
      form.productIds.value = b.items.join(",");
      toast("Bundle loaded into form");
    });
  });
}

if (page === "shop") runShop();
if (page === "admin") {
  mountAdminAuth();
  if (isAdminAuthed()) runAdminApp();
}
