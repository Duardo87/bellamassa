// ==================================================
// CONFIG / STORAGE
// ==================================================
const STORAGE_KEY = "pizzaria-data";

// 📞 WHATSAPP FIXO (FORMATO CORRETO)
const WHATS_PHONE = "5562993343622";

const DEFAULT_DATA = {
  store: { name: "Bella Massa", phone: WHATS_PHONE },
  products: [],
  extras: [],
  borders: [],
  promo: null,
  theme: "auto"
};

function loadData() {
  let raw = {};
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {}

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

// ==================================================
// STATE
// ==================================================
let data = loadData();
let cart = [];

let selectedProduct = null;
let selectedFlavors = [];
let selectedExtras = [];
let selectedBorder = null;

// ==================================================
// INIT
// ==================================================
function renderPublic() {
  data = loadData();
  applyTheme();
  renderHeader();
  renderCategories();
  renderComboOfDay();
}

window.app = { renderPublic };

// ==================================================
// HEADER
// ==================================================
function renderHeader() {
  const nameEl = document.getElementById("store-name");
  const phoneEl = document.getElementById("store-phone");

  if (nameEl) nameEl.textContent = data.store.name;
  if (phoneEl) phoneEl.href = `https://wa.me/${WHATS_PHONE}`;
}

// ==================================================
// THEME
// ==================================================
function applyTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.body.classList.toggle(
    "dark",
    data.theme === "dark" || (data.theme === "auto" && prefersDark)
  );
}

// ==================================================
// COMBO AUTOMÁTICO POR DIA
// ==================================================
function renderComboOfDay() {
  const day = new Date().getDay();

  const combos = {
    1: { name: "🍕 Segunda da Mussarela", price: 39.9 },
    2: { name: "🍕 Terça Calabresa", price: 42.9 },
    3: { name: "🍕 Quarta em Dobro", price: 59.9 },
    4: { name: "🍕 Quinta Especial", price: 49.9 },
    5: { name: "🍕 Sexta Família", price: 69.9 },
    6: { name: "🍕 Sábado Premium", price: 79.9 },
    0: { name: "🍕 Domingo Completo", price: 74.9 }
  };

  const combo = combos[day];
  if (!combo) return;

  openModal(`
    <h2>${combo.name}</h2>
    <strong>R$ ${combo.price.toFixed(2)}</strong>
    <button class="btn btn-green" data-action="accept-combo">
      Adicionar combo
    </button>
    <button class="btn btn-ghost" data-action="close-modal">
      Depois
    </button>
  `);

  document.addEventListener("click", e => {
    if (e.target.dataset.action === "accept-combo") {
      cart.push({ name: combo.name, price: combo.price });
      closeAnyModal();
      renderCart();
    }
  }, { once: true });
}

// ==================================================
// CATEGORIAS
// ==================================================
function renderCategories() {
  const nav = document.getElementById("categories");
  if (!nav) return;

  const categories = [...new Set(data.products.map(p => p.category))];
  nav.innerHTML = "";

  categories.forEach((cat, i) => {
    nav.innerHTML += `
      <button data-action="category" data-category="${cat}"
        class="${i === 0 ? "active" : ""}">
        ${cat}
      </button>`;
  });

  if (categories[0]) renderProducts(categories[0]);
}

// ==================================================
// PRODUTOS
// ==================================================
function renderProducts(category) {
  const grid = document.getElementById("products");
  if (!grid) return;

  grid.innerHTML = "";

  data.products.filter(p => p.category === category).forEach(p => {
    grid.innerHTML += `
      <div class="product-card">
        ${p.image ? `<img src="${p.image}">` : ""}
        <h3>${p.name}</h3>
        <p>${p.desc || ""}</p>
        <div class="price">R$ ${p.price.toFixed(2)}</div>
        <button class="btn btn-green"
          data-action="add-product"
          data-id="${p.id}">
          Adicionar
        </button>
      </div>`;
  });
}

// ==================================================
// EVENTOS
// ==================================================
document.addEventListener("click", e => {
  const el = e.target.closest("[data-action]");
  if (!el) return;

  const action = el.dataset.action;

  if (action === "category") {
    document.querySelectorAll(".categories button")
      .forEach(b => b.classList.remove("active"));
    el.classList.add("active");
    renderProducts(el.dataset.category);
  }

  if (action === "add-product") addProductToCart(el.dataset.id);
  if (action === "send-whats") sendToWhatsApp();
  if (action === "close-modal") closeAnyModal();
});

// ==================================================
// ADD PRODUTO
// ==================================================
function addProductToCart(id) {
  const p = data.products.find(x => x.id == id);
  if (!p) return;

  cart.push({ name: p.name, price: p.price });
  renderCart();
}

// ==================================================
// CARRINHO + ENDEREÇO + PAGAMENTO
// ==================================================
function renderCart() {
  const div = document.getElementById("cart");
  if (!div) return;

  let total = 0;
  let html = "<h3>🧾 Seu pedido</h3>";

  cart.forEach(i => {
    total += i.price;
    html += `<p>${i.name} — R$ ${i.price.toFixed(2)}</p>`;
  });

  html += `
    <p><strong>Total: R$ ${total.toFixed(2)}</strong></p>

    <input id="address" placeholder="Endereço completo" style="width:100%;padding:8px;margin:6px 0">
    <select id="payment" style="width:100%;padding:8px;margin-bottom:10px">
      <option value="Dinheiro">Dinheiro</option>
      <option value="Pix">Pix</option>
      <option value="Cartão">Cartão</option>
    </select>

    <button class="btn btn-green" data-action="send-whats">
      Enviar no WhatsApp
    </button>
  `;

  div.innerHTML = html;
  div.classList.remove("hidden");
}

// ==================================================
// WHATSAPP FINAL (SEM ERRO 404)
// ==================================================
function sendToWhatsApp() {
  const address = document.getElementById("address")?.value || "";
  const payment = document.getElementById("payment")?.value || "";

  let msg = `Pedido - ${data.store.name}\n\n`;
  let total = 0;

  cart.forEach(i => {
    total += i.price;
    msg += `• ${i.name} - R$ ${i.price.toFixed(2)}\n`;
  });

  msg += `\nTotal: R$ ${total.toFixed(2)}`;
  msg += `\n\nEndereço: ${address}`;
  msg += `\nPagamento: ${payment}`;

  window.open(
    `https://wa.me/${WHATS_PHONE}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

// ==================================================
// MODAL
// ==================================================
function openModal(content) {
  closeAnyModal();
  const modal = document.createElement("div");
  modal.className = "promo-overlay";
  modal.innerHTML = `<div class="promo-card">${content}</div>`;
  document.body.appendChild(modal);
}

function closeAnyModal() {
  document.querySelectorAll(".promo-overlay").forEach(m => m.remove());
}