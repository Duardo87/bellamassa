// ==================================================
// CONFIGURAÇÃO GLOBAL
// ==================================================
const STORAGE_KEY = "pizzaria-data";
const ORDERS_KEY = "pizzaria-orders";
const WHATS_PHONE = "5562993343622";
const PUBLIC_DATA_URL = "/data.json";

// ==================================================
// LOAD DATA (LOCAL + PUBLIC)
// ==================================================
async function loadData() {
  let raw = null;

  // 1️⃣ tenta localStorage
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {}

  // 2️⃣ se não existir ou estiver vazio → carrega público
  if (!raw || !raw.categories || !raw.categories.length) {
    try {
      const res = await fetch(PUBLIC_DATA_URL, { cache: "no-store" });
      raw = await res.json();
    } catch (e) {
      console.error("Erro ao carregar data.json", e);
      raw = {};
    }
  }

  return {
    store: raw.store || { name: "Bella Massa", phone: WHATS_PHONE },
    categories: Array.isArray(raw.categories) ? raw.categories : [],
    products: Array.isArray(raw.products) ? raw.products : [],
    extras: Array.isArray(raw.extras) ? raw.extras : [],
    borders: Array.isArray(raw.borders) ? raw.borders : [],
    promo: raw.promo && raw.promo.active ? raw.promo : null
  };
}

function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// ==================================================
// STATE
// ==================================================
let data = null;
let cart = [];

let currentProduct = null;
let selectedFlavors = [];
let selectedSize = null;
let selectedBorder = null;
let selectedExtras = [];

// ==================================================
// INIT
// ==================================================
async function renderPublic() {
  data = await loadData();
  renderHeader();
  renderCategories();
  renderPromo();
}
window.app = { renderPublic };

// ==================================================
// HEADER
// ==================================================
function renderHeader() {
  const nameEl = document.getElementById("store-name");
  const phoneEl = document.getElementById("store-phone");

  if (nameEl) nameEl.textContent = data.store.name;
  if (phoneEl) phoneEl.href = `https://wa.me/${data.store.phone || WHATS_PHONE}`;
}

// ==================================================
// PROMOÇÃO DO DIA + CONTADOR
// ==================================================
function renderPromo() {
  if (!data.promo) return;

  openModal(`
    ${data.promo.image ? `<img src="${data.promo.image}">` : ""}

    <div class="promo-timer" id="promoTimer">
      ⏰ Termina em:
      <div><span id="h">00</span> : <span id="m">00</span> : <span id="s">00</span></div>
      <small>Somente hoje</small>
    </div>

    <h2>🔥 Promoção do Dia</h2>
    <p>${data.promo.description}</p>
    <strong>R$ ${Number(data.promo.price).toFixed(2)}</strong>

    <button class="btn btn-green" onclick="addPromoToCart()">
      Adicionar ao pedido
    </button>
  `);

  setTimeout(startPromoTimer, 100);
}

function addPromoToCart() {
  cart.push({
    name: data.promo.description,
    price: Number(data.promo.price),
    breakdown: ["Promoção do dia"]
  });
  closeModal();
  renderCart();
}

// ==================================================
// CONTADOR ATÉ MEIA-NOITE
// ==================================================
function startPromoTimer() {
  const hEl = document.getElementById("h");
  const mEl = document.getElementById("m");
  const sEl = document.getElementById("s");

  function update() {
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const diff = end - now;
    if (diff <= 0) return;

    hEl.textContent = String(Math.floor(diff / 3600000)).padStart(2, "0");
    mEl.textContent = String(Math.floor(diff / 60000) % 60).padStart(2, "0");
    sEl.textContent = String(Math.floor(diff / 1000) % 60).padStart(2, "0");
  }

  update();
  setInterval(update, 1000);
}

// ==================================================
// CATEGORIAS
// ==================================================
function renderCategories() {
  const nav = document.getElementById("categories");
  const grid = document.getElementById("products");
  if (!nav || !grid) return;

  nav.innerHTML = "";

  if (!data.categories.length) {
    grid.innerHTML = `
      <div style="padding:20px;text-align:center;opacity:.7">
        ❌ Cardápio indisponível no momento
      </div>
    `;
    return;
  }

  data.categories.forEach((cat, i) => {
    nav.innerHTML += `
      <button class="${i === 0 ? "active" : ""}"
        data-action="category"
        data-category="${cat}">
        ${cat}
      </button>
    `;
  });

  renderProducts(data.categories[0]);
}

// ==================================================
// PRODUTOS
// ==================================================
function renderProducts(category) {
  const grid = document.getElementById("products");
  if (!grid) return;

  grid.innerHTML = "";

  data.products
    .filter(p => p.category === category)
    .forEach(p => {
      grid.innerHTML += `
        <div class="product-card">
          ${p.image ? `<img src="${p.image}">` : ""}
          <h3>${p.name}</h3>
          <p>${p.desc || ""}</p>
          <button class="btn btn-green" onclick="startOrder(${p.id})">
            Adicionar
          </button>
        </div>
      `;
    });
}

// ==================================================
// EVENTOS
// ==================================================
document.addEventListener("click", e => {
  const el = e.target.closest("[data-action]");
  if (!el) return;

  if (el.dataset.action === "category") {
    document.querySelectorAll(".categories button")
      .forEach(b => b.classList.remove("active"));
    el.classList.add("active");
    renderProducts(el.dataset.category);
  }

  if (el.dataset.action === "close-modal") closeModal();
});

// ==================================================
// MODAL
// ==================================================
function openModal(html) {
  closeModal();
  const modal = document.createElement("div");
  modal.className = "promo-overlay";
  modal.innerHTML = `
    <div class="promo-card">
      ${html}
      <button class="btn btn-ghost" data-action="close-modal">Cancelar</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeModal() {
  document.querySelectorAll(".promo-overlay").forEach(m => m.remove());
}