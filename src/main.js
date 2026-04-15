import { bundlePrice, getFeaturedBundle, getRotationProducts, getState, getTimeLeft, saveState } from "./store.js";

const page = document.body.dataset.page;
const $ = (s) => document.querySelector(s);
const ADMIN_SESSION_KEY = "valorant_admin_session";

function vp(v) {
  return `${Math.round(v).toLocaleString()} VP`;
}

function toast(message) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = message;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 2200);
}

function playClickSound(type = "soft") {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = type === "confirm" ? 920 : 640;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (type === "confirm" ? 0.18 : 0.09));
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + (type === "confirm" ? 0.19 : 0.1));
}

function updateVpDisplay(state = getState()) {
  const val = state.wallet.vpBalance.toLocaleString();
  if ($("#vpBalance")) $("#vpBalance").textContent = val;
  if ($("#walletPanelBalance")) $("#walletPanelBalance").textContent = val;
}

function renderTimers(state) {
  const nextShop = state.rotation.shopCycleStartedAt + state.settings.rotationHours * 3600000;
  const nextBundle = state.rotation.bundleCycleStartedAt + state.settings.bundleRefreshHours * 3600000;
  if ($("#shopTimer")) $("#shopTimer").textContent = getTimeLeft(nextShop);
  if ($("#bundleTimer")) $("#bundleTimer").textContent = getTimeLeft(nextBundle);
}

function showPurchaseModal(entry) {
  const first = entry.items?.[0];
  const state = getState();
  const product = first ? state.products.find((p) => p.id === first.id) : null;
  $("#purchaseImage").src = product?.image || state.products[0]?.image || "";
  $("#purchaseName").textContent = first ? `${first.name} acquired` : "Collection acquired";
  $("#purchaseModal").classList.remove("hidden");
}

function openInspect(item, state, isBundle = false) {
  $("#inspectImage").src = item.image;
  $("#inspectTitle").textContent = item.name;
  $("#inspectPrice").textContent = vp(isBundle ? bundlePrice(state, item) : item.price);

  const list = $("#upgradeList");
  const video = $("#upgradeVideo");

  let upgrades = [];
  if (isBundle) {
    upgrades = item.items.map((id) => {
      const p = state.products.find((x) => x.id === id);
      return { level: p?.name ?? `Item ${id}`, video: p?.upgrades?.[0]?.video ?? "" };
    });
  } else {
    upgrades = item.upgrades?.length ? item.upgrades : [{ level: "Base", video: "" }];
  }

  list.innerHTML = upgrades
    .map((u, idx) => `<button class="ghost-btn ${idx === 0 ? "active-upgrade" : ""}" data-video="${u.video}">${u.level}</button>`)
    .join("");

  video.src = upgrades[0]?.video || "";

  list.querySelectorAll("button[data-video]").forEach((b) => {
    b.addEventListener("click", () => {
      list.querySelectorAll("button").forEach((x) => x.classList.remove("active-upgrade"));
      b.classList.add("active-upgrade");
      video.src = b.dataset.video;
      playClickSound("soft");
    });
  });

  $("#inspectModal").classList.remove("hidden");
}

function refreshCartUI() {
  const st = getState();
  updateVpDisplay(st);
  const total = st.cart.reduce((a, b) => a + b.price, 0);

  const root = $("#cartItems");
  if (root) {
    root.innerHTML = st.cart.length
      ? st.cart
          .map(
            (item, i) => `<div class="cart-row"><div><p>${item.name}</p><small>${item.kind.toUpperCase()}</small></div><div class="row-gap"><strong>${vp(item.price)}</strong><button data-remove="${i}" class="icon-btn">Remove</button></div></div>`,
          )
          .join("")
      : `<p class="subtle">Your checkout bag is empty.</p>`;

    root.querySelectorAll("button[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const s = getState();
        s.cart.splice(Number(btn.dataset.remove), 1);
        saveState(s);
        refreshCartUI();
      });
    });
  }

  if ($("#cartTotal")) $("#cartTotal").textContent = vp(total);
}

function setupDrawer() {
  const drawer = $("#cartDrawer");
  $("#openCart")?.addEventListener("click", () => drawer.classList.remove("hidden"));
  $("#closeCart")?.addEventListener("click", () => drawer.classList.add("hidden"));

  document.querySelectorAll(".tab-btn").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
      $(`#${tab.dataset.tab}Panel`).classList.add("active");
    });
  });

  $("#topupBtn")?.addEventListener("click", () => {
    const amount = Number($("#topupAmount").value);
    const method = $("#topupMethod").value;
    const st = getState();
    st.wallet.vpBalance += amount;
    st.orders.unshift({ id: `TOPUP-${Date.now()}`, type: "TOPUP", amount, paymentMethod: method, status: "COMPLETED", date: new Date().toISOString() });
    saveState(st);
    refreshCartUI();
    playClickSound("confirm");
    toast(`Top up successful +${vp(amount)}`);
  });

  $("#checkoutBtn")?.addEventListener("click", () => {
    const st = getState();
    if (!st.cart.length) return toast("Add items to continue");
    const total = st.cart.reduce((a, b) => a + b.price, 0);
    const method = $("#purchaseMethod").value;
    if (method === "vp_wallet" && st.wallet.vpBalance < total) return toast("Insufficient VP");
    if (method === "vp_wallet") st.wallet.vpBalance -= total;

    const entry = {
      id: `ORD-${Date.now()}`,
      type: "PURCHASE",
      items: st.cart,
      total,
      paymentMethod: method,
      status: "CONFIRMED",
      date: new Date().toISOString(),
    };
    st.orders.unshift(entry);
    st.cart = [];
    saveState(st);
    refreshCartUI();
    playClickSound("confirm");
    showPurchaseModal(entry);
  });
}

function runShop() {
  const st = getState();
  const featured = getFeaturedBundle(st);
  const rotated = getRotationProducts(st);

  updateVpDisplay(st);
  renderTimers(st);
  setInterval(() => renderTimers(getState()), 1000);

  const start = new Date(st.rotation.shopCycleStartedAt);
  const end = new Date(st.rotation.shopCycleStartedAt + st.settings.rotationHours * 3600000);
  $("#rotationRange").textContent = `${start.toLocaleString()} - ${end.toLocaleString()}`;

  $("#refreshShopBtn")?.addEventListener("click", () => {
    const s = getState();
    if (s.wallet.vpBalance < 500) return toast("Need 500 VP");
    s.wallet.vpBalance -= 500;
    s.rotation.shopNonce += 1;
    s.rotation.shopCycleStartedAt = Date.now();
    saveState(s);
    playClickSound("confirm");
    location.reload();
  });

  $("#refreshBundleBtn")?.addEventListener("click", () => {
    const s = getState();
    if (s.wallet.vpBalance < 500) return toast("Need 500 VP");
    s.wallet.vpBalance -= 500;
    s.rotation.bundleNonce += 1;
    s.rotation.bundleCycleStartedAt = Date.now();
    saveState(s);
    playClickSound("confirm");
    location.reload();
  });

  if (featured) {
    $("#bundleName").textContent = featured.name;
    $("#bundleInfo").textContent = `${featured.items.length} items • ${featured.discount}% off`;
    $("#bundlePrice").textContent = bundlePrice(st, featured).toLocaleString();
    const bundleItems = st.products.filter((p) => featured.items.includes(p.id));
    $("#bundleWeapons").innerHTML = bundleItems.map((p) => `<div class="banner-weapon float-item"><img src="${p.image}" alt="${p.name}"/><small>${p.name}</small></div>`).join("");

    $("#inspectBundleBtn")?.addEventListener("click", () => openInspect(featured, st, true));
    $("#addFeaturedBundle")?.addEventListener("click", () => {
      const s = getState();
      s.cart.push({ kind: "bundle", id: featured.id, name: featured.name, price: bundlePrice(s, featured) });
      saveState(s);
      refreshCartUI();
      playClickSound("soft");
    });
  }

  $("#productList").innerHTML = rotated
    .map(
      (p) => `<article class="offer-card rarity-${p.rarity.toLowerCase()} fade-in-up"><div class="offer-asset-wrap" data-inspect="${p.id}"><img src="${p.image}" class="offer-asset" alt="${p.name}"/></div><div class="offer-meta"><span>${p.name}</span><div class="offer-actions"><button class="icon-btn" data-inspect="${p.id}">Inspect</button><button class="offer-buy" data-buy="${p.id}"><img src="${st.settings.vpIcon}" alt="VP"/> ${p.price}</button></div></div></article>`,
    )
    .join("");

  $("#productList").addEventListener("click", (e) => {
    const inspect = e.target.closest("[data-inspect]");
    const buy = e.target.closest("[data-buy]");
    const s = getState();
    if (inspect) {
      const p = s.products.find((x) => x.id === Number(inspect.dataset.inspect));
      if (p) openInspect(p, s, false);
      return;
    }
    if (buy) {
      const p = s.products.find((x) => x.id === Number(buy.dataset.buy));
      if (!p) return;
      s.cart.push({ kind: "product", id: p.id, name: p.name, price: p.price });
      saveState(s);
      refreshCartUI();
      playClickSound("soft");
    }
  });

  $("#closeInspect")?.addEventListener("click", () => $("#inspectModal").classList.add("hidden"));
  $("#inspectModal")?.addEventListener("click", (e) => e.target.id === "inspectModal" && $("#inspectModal").classList.add("hidden"));
  $("#closePurchase")?.addEventListener("click", () => $("#purchaseModal").classList.add("hidden"));

  setupDrawer();
  refreshCartUI();
}

function isAdminAuthed() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

function setAdminAuthed(v) {
  sessionStorage.setItem(ADMIN_SESSION_KEY, v ? "true" : "false");
}

function mountAdminAuth() {
  const loginCard = $("#adminLoginCard");
  const app = $("#adminApp");
  const logout = $("#logoutAdmin");

  const show = () => {
    loginCard.classList.add("hidden");
    app.classList.remove("hidden");
    logout.classList.remove("hidden");
  };

  if (isAdminAuthed()) show();

  $("#adminLoginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const st = getState();
    if (fd.get("username") === st.admin.username && fd.get("password") === st.admin.password) {
      setAdminAuthed(true);
      show();
      runAdminApp();
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
  const st = getState();
  const settings = $("#settingsForm");
  settings.rotationSize.value = st.settings.rotationSize;
  settings.rotationHours.value = st.settings.rotationHours;
  settings.bundleRefreshHours.value = st.settings.bundleRefreshHours;

  $("#productForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const s = getState();
    s.products.push({
      id: s.products.length ? Math.max(...s.products.map((p) => p.id)) + 1 : 1,
      name: fd.get("name").toString().trim(),
      price: Math.round(Number(fd.get("price"))),
      rarity: fd.get("rarity").toString(),
      image: fd.get("image").toString().trim(),
      upgrades: fd.get("video") ? [{ level: "Preview", video: fd.get("video").toString().trim() }] : [],
    });
    saveState(s);
    e.currentTarget.reset();
    renderAdminLists();
  });

  $("#bundleForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const s = getState();
    const bundleId = Number(fd.get("bundleId"));
    const items = fd
      .get("productIds")
      .toString()
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((id) => s.products.some((p) => p.id === id));
    if (!items.length) return toast("Invalid product IDs");
    if (bundleId && s.bundles.some((b) => b.id === bundleId)) {
      s.bundles = s.bundles.map((b) => (b.id === bundleId ? { ...b, name: fd.get("name").toString(), discount: Number(fd.get("discount")), image: fd.get("image").toString(), items } : b));
    } else {
      s.bundles.push({ id: s.bundles.length ? Math.max(...s.bundles.map((b) => b.id)) + 1 : 1, name: fd.get("name").toString(), discount: Number(fd.get("discount")), image: fd.get("image").toString(), items });
    }
    saveState(s);
    e.currentTarget.reset();
    renderAdminLists();
  });

  settings?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const s = getState();
    s.settings.rotationSize = Number(fd.get("rotationSize"));
    s.settings.rotationHours = Number(fd.get("rotationHours"));
    s.settings.bundleRefreshHours = Number(fd.get("bundleRefreshHours"));
    saveState(s);
    toast("Settings saved");
  });

  renderAdminLists();
}

function renderAdminLists() {
  const st = getState();
  const pRoot = $("#adminProductList");
  const bRoot = $("#adminBundleList");
  const oRoot = $("#adminOrders");

  pRoot.innerHTML = st.products.map((p) => `<div class="stack-row"><span>#${p.id} ${p.name} — ${vp(p.price)}</span><button class="icon-btn" data-del-product="${p.id}">Delete</button></div>`).join("");
  bRoot.innerHTML = st.bundles.map((b) => `<div class="stack-row stack-col"><strong>#${b.id} ${b.name}</strong><span>${b.items.length} items • ${b.discount}%</span><button class="ghost-btn" data-fill-bundle="${b.id}">Load into form</button><button class="icon-btn" data-del-bundle="${b.id}">Delete</button></div>`).join("");
  oRoot.innerHTML = st.orders.length ? st.orders.map((o) => `<div class="stack-row stack-col"><strong>${o.id}</strong><span>${new Date(o.date).toLocaleString()} • ${o.status}</span></div>`).join("") : `<p class="subtle">No transactions yet.</p>`;

  pRoot.querySelectorAll("[data-del-product]").forEach((b) =>
    b.addEventListener("click", () => {
      const s = getState();
      const id = Number(b.dataset.delProduct);
      s.products = s.products.filter((p) => p.id !== id);
      s.bundles = s.bundles.map((x) => ({ ...x, items: x.items.filter((i) => i !== id) }));
      saveState(s);
      renderAdminLists();
    }),
  );

  bRoot.querySelectorAll("[data-del-bundle]").forEach((b) =>
    b.addEventListener("click", () => {
      const s = getState();
      s.bundles = s.bundles.filter((x) => x.id !== Number(b.dataset.delBundle));
      saveState(s);
      renderAdminLists();
    }),
  );

  bRoot.querySelectorAll("[data-fill-bundle]").forEach((b) =>
    b.addEventListener("click", () => {
      const s = getState();
      const item = s.bundles.find((x) => x.id === Number(b.dataset.fillBundle));
      if (!item) return;
      const form = $("#bundleForm");
      form.bundleId.value = item.id;
      form.name.value = item.name;
      form.discount.value = item.discount;
      form.image.value = item.image;
      form.productIds.value = item.items.join(",");
    }),
  );
}

if (page === "shop") runShop();
if (page === "admin") {
  mountAdminAuth();
  if (isAdminAuthed()) runAdminApp();
}
