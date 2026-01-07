// ==================================================
// CONFIG / STORAGE
// ==================================================
const STORAGE_KEY = "pizzaria-data";

const DEFAULT_DATA = {
  store: { name: "Bella Massa", phone: "" },
  products: [],
  extras: [],
  borders: [], // 🔥 bordas separadas
  promo: null,
  theme: "auto"
};

function loadData() {
  const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  return {
    ...DEFAULT_DATA,
    ...raw,
    store: { ...DEFAULT_DATA.store, ...(raw.store || {}) },
    products: Array.isArray(raw.products) ? raw.products : [],
    extras: Array.isArray(raw.extras) ? raw.extras : [],
    borders: Array.isArray(raw.borders) ? raw.borders : [],
    promo: raw.promo || null
  };
}

let data = loadData();
let cart = [];

// estado temporário do pedido
let selectedProduct = null;
let selectedFlavors = [];
let selectedExtras = [];

// ==================================================
// INIT
// ==================================================
function renderPublic() {
  data = loadData();
  applyTheme();
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

  if (nameEl) nameEl.textContent = data.store.name || "";
  if (phoneEl && data.store.phone) {
    phoneEl.href = "https://wa.me/" + data.store.phone;
  }
}

// ==================================================
// THEME
// ==================================================
function applyTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme =
    data.theme === "auto" ? (prefersDark ? "dark" : "light") : data.theme;
  document.body.classList.toggle("dark", theme === "dark");
}

// ==================================================
// CATEGORIAS
// ==================================================
function renderCategories() {
  const nav = document.getElementById("categories");
  if (!nav) return;

  const categories = [
    ...new Set(data.products.map(p => p.category).filter(Boolean))
  ];

  nav.innerHTML = "";
  if (!categories.length) return;

  categories.forEach((cat, i) => {
    nav.insertAdjacentHTML(
      "beforeend",
      `<button data-action="category" data-category="${cat}"
        class="${i === 0 ? "active" : ""}">${cat}</button>`
    );
  });

  renderProducts(categories[0]);
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
      grid.insertAdjacentHTML(
        "beforeend",
        `<div class="product-card">
          ${p.best ? `<span class="badge">⭐ Mais pedido</span>` : ""}
          ${p.image ? `<img src="${p.image}" alt="${p.name}">` : ""}
          <h3>${p.name}</h3>
          <p>${p.desc || ""}</p>
          <div class="price">R$ ${p.price.toFixed(2)}</div>
          <button class="btn btn-green"
            data-action="start-order"
            data-id="${p.id}">
            Adicionar
          </button>
        </div>`
      );
    });
}

// ==================================================
// EVENT DELEGATION (🔥 IOS SAFE)
// ==================================================
document.addEventListener("click", e => {
  const el = e.target.closest("[data-action]");
  if (!el) return;

  const action = el.dataset.action;

  if (action === "category") {
    document
      .querySelectorAll(".categories button")
      .forEach(b => b.classList.remove("active"));
    el.classList.add("active");
    renderProducts(el.dataset.category);
  }

  if (action === "start-order") startFlavors(Number(el.dataset.id));
  if (action === "confirm-flavors") confirmFlavors();
  if (action === "confirm-extras") confirmExtras();
  if (action === "confirm-border") confirmBorder();

  if (action === "accept-promo") acceptPromo();
  if (action === "close-promo") closePromo();
  if (action === "close-modal") closeAnyModal();

  if (action === "send-whats") sendToWhatsApp();
});

// ==================================================
// 1️⃣ SABORES (ATÉ 2)
// ==================================================
function startFlavors(id) {
  selectedProduct = data.products.find(p => p.id === id);
  if (!selectedProduct) return;

  selectedFlavors = [];
  selectedExtras = [];

  closeAnyModal();

  const flavors = data.products.filter(
    p => p.category === selectedProduct.category
  );

  const max = selectedProduct.maxFlavors || 2;

  const modal = document.createElement("div");
  modal.className = "promo-overlay";
  modal.innerHTML = `
    <div class="promo-card">
      <h3>🍕 Escolha até ${max} sabores</h3>

      ${flavors
        .map(
          f => `
        <label class="extra-item">
          <input type="checkbox" value="${f.name}">
          <span>${f.name}</span>
        </label>`
        )
        .join("")}

      <button class="btn btn-green" data-action="confirm-flavors">
        Continuar
      </button>
      <button class="btn btn-ghost" data-action="close-modal">Cancelar</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function confirmFlavors() {
  const checks = [...document.querySelectorAll(".promo-card input:checked")];
  const max = selectedProduct.maxFlavors || 2;

  if (!checks.length) return alert("Escolha pelo menos 1 sabor");
  if (checks.length > max) return alert(`Máximo de ${max} sabores`);

  selectedFlavors = checks.map(c => c.value);
  openExtras();
}

// ==================================================
// 2️⃣ ADICIONAIS
// ==================================================
function openExtras() {
  closeAnyModal();

  const extras = data.extras.filter(e => e.active);

  const modal = document.createElement("div");
  modal.className = "promo-overlay";
  modal.innerHTML = `
    <div class="promo-card">
      <h3>➕ Adicionais</h3>

      ${
        extras.length
          ? extras
              .map(
                e => `
          <label class="extra-item">
            <input type="checkbox" value="${e.id}">
            <span>${e.name}</span>
            <strong>R$ ${e.price.toFixed(2)}</strong>
          </label>`
              )
              .join("")
          : `<p style="opacity:.6">Nenhum adicional</p>`
      }

      <button class="btn btn-green" data-action="confirm-extras">
        Continuar
      </button>
      <button class="btn btn-ghost" data-action="close-modal">Cancelar</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function confirmExtras() {
  selectedExtras = [];

  document
    .querySelectorAll(".promo-card input:checked")
    .forEach(chk => {
      const extra = data.extras.find(e => e.id == chk.value);
      if (extra) selectedExtras.push(extra);
    });

  openBorders();
}

// ==================================================
// 3️⃣ BORDA
// ==================================================
function openBorders() {
  closeAnyModal();

  const borders = data.borders.filter(b => b.active);

  const modal = document.createElement("div");
  modal.className = "promo-overlay";
  modal.innerHTML = `
    <div class="promo-card">
      <h3>🥖 Borda</h3>

      <label class="extra-item">
        <input type="radio" name="border" value="none" checked>
        <span>Sem borda</span>
        <strong>R$ 0,00</strong>
      </label>

      ${borders
        .map(
          b => `
        <label class="extra-item">
          <input type="radio" name="border" value="${b.id}">
          <span>${b.name}</span>
          <strong>R$ ${b.price.toFixed(2)}</strong>
        </label>`
        )
        .join("")}

      <button class="btn btn-green" data-action="confirm-border">
        Adicionar ao pedido
      </button>
    </div>
  `;
  document.body.appendChild(modal);
}

function confirmBorder() {
  const selected = document.querySelector(
    '.promo-card input[name="border"]:checked'
  );

  let total = selectedProduct.price;
  let name = `${selectedProduct.name} (${selectedFlavors.join(" / ")})`;

  selectedExtras.forEach(e => {
    total += e.price;
    name += ` + ${e.name}`;
  });

  if (selected && selected.value !== "none") {
    const border = data.borders.find(b => b.id == selected.value);
    if (border) {
      total += border.price;
      name += ` • Borda ${border.name}`;
    }
  }

  cart.push({ name, price: total });

  selectedProduct = null;
  selectedFlavors = [];
  selectedExtras = [];

  closeAnyModal();
  renderCart();
}

// ==================================================
// PROMOÇÃO
// ==================================================
function renderPromo() {
  if (!data.promo || !data.promo.active) return;

  const key = "promoClosed-" + new Date().toISOString().slice(0, 10);
  if (localStorage.getItem(key)) return;

  closeAnyModal();

  const modal = document.createElement("div");
  modal.className = "promo-overlay";
  modal.innerHTML = `
    <div class="promo-card">
      ${data.promo.image ? `<img src="${data.promo.image}">` : ""}
      <h2>🔥 Promoção do Dia</h2>
      <p>${data.promo.description}</p>
      <strong>R$ ${data.promo.price.toFixed(2)}</strong>

      <button class="btn btn-green" data-action="accept-promo">Aproveitar</button>
      <button class="btn btn-ghost" data-action="close-promo">Depois</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function acceptPromo() {
  cart.push({
    name: data.promo.description,
    price: data.promo.price
  });
  closePromo();
  renderCart();
}

function closePromo() {
  const key = "promoClosed-" + new Date().toISOString().slice(0, 10);
  localStorage.setItem(key, "1");
  closeAnyModal();
}

// ==================================================
// CARRINHO
// ==================================================
function renderCart() {
  const div = document.getElementById("cart");
  if (!div) return;

  div.classList.remove("hidden");

  let total = 0;
  let html = "<h3>🧾 Seu pedido</h3>";

  cart.forEach(i => {
    total += i.price;
    html += `<p>${i.name} — R$ ${i.price.toFixed(2)}</p>`;
  });

  html += `
    <strong>Total: R$ ${total.toFixed(2)}</strong>
    <button class="btn btn-green" data-action="send-whats">
      Enviar no WhatsApp
    </button>
  `;

  div.innerHTML = html;
}

// ==================================================
// WHATSAPP
// ==================================================
function sendToWhatsApp() {
  if (!data.store.phone) {
    alert("WhatsApp não configurado no admin");
    return;
  }

  let msg = `Pedido - ${data.store.name}%0A%0A`;
  let total = 0;

  cart.forEach(i => {
    total += i.price;
    msg += `• ${i.name} R$ ${i.price.toFixed(2)}%0A`;
  });

  msg += `%0ATotal: R$ ${total.toFixed(2)}`;

  window.open(`https://wa.me/${data.store.phone}?text=${msg}`, "_blank");
}

// ==================================================
// UTIL
// ==================================================
function closeAnyModal() {
  document.querySelectorAll(".promo-overlay").forEach(m => m.remove());
}