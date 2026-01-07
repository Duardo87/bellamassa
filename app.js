// ==================================================
// CONFIGURAÇÃO GLOBAL
// ==================================================
const STORAGE_KEY = "pizzaria-data";
const ORDERS_KEY = "pizzaria-orders";
const WHATS_PHONE = "5562993343622";

// ==================================================
// LOAD DATA (ADMIN → SITE)
// ==================================================
function loadData() {
  let raw = {};
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {}

  return {
    store: raw.store || { name: "Bella Massa", phone: WHATS_PHONE },
    categories: Array.isArray(raw.categories) ? raw.categories : [],
    products: Array.isArray(raw.products) ? raw.products : [],
    extras: Array.isArray(raw.extras) ? raw.extras : [],
    borders: Array.isArray(raw.borders) ? raw.borders : [],
    promo: raw.promo || null
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
let data = loadData();
let cart = [];

let currentProduct = null;
let selectedFlavors = [];
let selectedSize = null;
let selectedBorder = null;
let selectedExtras = [];

// ==================================================
// INIT
// ==================================================
function renderPublic() {
  data = loadData();
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
  if (phoneEl) phoneEl.href = `https://wa.me/${WHATS_PHONE}`;
}

// ==================================================
// CATEGORIAS
// ==================================================
function renderCategories() {
  const nav = document.getElementById("categories");
  if (!nav) return;

  nav.innerHTML = "";

  data.categories.forEach((cat, i) => {
    nav.innerHTML += `
      <button class="${i === 0 ? "active" : ""}"
        data-action="category"
        data-category="${cat}">
        ${cat}
      </button>
    `;
  });

  if (data.categories[0]) {
    renderProducts(data.categories[0]);
  }
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
          <div class="price">R$ ${p.price.toFixed(2)}</div>
          <button class="btn btn-green"
            data-action="start"
            data-id="${p.id}">
            Adicionar
          </button>
        </div>
      `;
    });
}

// ==================================================
// EVENTOS GLOBAIS
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

  if (action === "start") startOrder(el.dataset.id);
  if (action === "confirm-flavors") confirmFlavors();
  if (action === "confirm-size") confirmSize();
  if (action === "confirm-border") confirmBorder();
  if (action === "confirm-extras") confirmExtras();
  if (action === "send-whats") sendWhats();
  if (action === "close-modal") closeModal();
});

// ==================================================
// FLUXO DO PEDIDO
// ==================================================
function startOrder(id) {
  currentProduct = data.products.find(p => p.id == id);
  selectedFlavors = [];
  selectedExtras = [];
  selectedBorder = null;
  selectedSize = null;

  openModal(`
    <h3>🍕 Escolha até ${currentProduct.maxFlavors || 2} sabores</h3>
    ${data.products
      .filter(p => p.category === currentProduct.category)
      .map(p => `
        <label class="extra-item">
          <input type="checkbox" value="${p.name}">
          <span>${p.name}</span>
        </label>
      `).join("")}
    <button class="btn btn-green" data-action="confirm-flavors">Continuar</button>
  `);
}

function confirmFlavors() {
  selectedFlavors = [...document.querySelectorAll(".promo-card input:checked")]
    .map(i => i.value);

  if (!selectedFlavors.length) return alert("Escolha ao menos 1 sabor");

  openModal(`
    <h3>📏 Escolha o tamanho</h3>
    <button class="btn btn-green" data-size="P" onclick="selectedSize='P';confirmSize()">Pequena</button>
    <button class="btn btn-green" data-size="M" onclick="selectedSize='M';confirmSize()">Média</button>
    <button class="btn btn-green" data-size="G" onclick="selectedSize='G';confirmSize()">Grande</button>
  `);
}

function confirmSize() {
  openModal(`
    <h3>🥖 Escolha a borda</h3>
    <button class="btn btn-ghost" onclick="selectedBorder=null;confirmBorder()">Sem borda</button>
    ${data.borders.filter(b => b.active).map(b => `
      <button class="btn btn-green"
        onclick="selectedBorder=${b.id};confirmBorder()">
        ${b.name} + R$ ${b.price.toFixed(2)}
      </button>
    `).join("")}
  `);
}

function confirmBorder() {
  openModal(`
    <h3>➕ Adicionais</h3>
    ${data.extras.filter(e => e.active).map(e => `
      <label class="extra-item">
        <input type="checkbox" value="${e.id}">
        <span>${e.name}</span>
        <strong>R$ ${e.price.toFixed(2)}</strong>
      </label>
    `).join("")}
    <button class="btn btn-green" data-action="confirm-extras">
      Adicionar ao carrinho
    </button>
  `);
}

function confirmExtras() {
  selectedExtras = [...document.querySelectorAll(".promo-card input:checked")]
    .map(i => data.extras.find(e => e.id == i.value));

  let total = currentProduct.price;
  let name = `${currentProduct.name} (${selectedFlavors.join("/")}) ${selectedSize}`;

  if (selectedBorder) {
    const b = data.borders.find(x => x.id == selectedBorder);
    if (b) {
      total += b.price;
      name += ` • Borda ${b.name}`;
    }
  }

  selectedExtras.forEach(e => total += e.price);

  cart.push({ name, price: total });

  closeModal();
  renderCart();
}

// ==================================================
// CARRINHO
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
    <strong>Total: R$ ${total.toFixed(2)}</strong>
    <input id="address" placeholder="Endereço completo">
    <select id="payment">
      <option>Dinheiro</option>
      <option>Pix</option>
      <option>Cartão</option>
    </select>
    <button class="btn btn-green" data-action="send-whats">
      Enviar no WhatsApp
    </button>
  `;

  div.innerHTML = html;
  div.classList.remove("hidden");
}

// ==================================================
// PROMOÇÃO DO DIA
// ==================================================
function renderPromo() {
  if (!data.promo || !data.promo.active) return;

  openModal(`
    ${data.promo.image ? `<img src="${data.promo.image}">` : ""}
    <h2>🔥 Promoção do Dia</h2>
    <p>${data.promo.description}</p>
    <strong>R$ ${data.promo.price.toFixed(2)}</strong>
    <button class="btn btn-green"
      onclick="cart.push({name:'${data.promo.description}',price:${data.promo.price}});closeModal();renderCart()">
      Adicionar
    </button>
  `);
}

// ==================================================
// WHATSAPP + SALVAR PEDIDO
// ==================================================
function sendWhats() {
  const addr = document.getElementById("address").value;
  const pay = document.getElementById("payment").value;

  let msg = `Pedido - ${data.store.name}\n\n`;
  let total = 0;

  cart.forEach(i => {
    total += i.price;
    msg += `• ${i.name} - R$ ${i.price.toFixed(2)}\n`;
  });

  msg += `\nTotal: R$ ${total.toFixed(2)}`;
  msg += `\nEndereço: ${addr}`;
  msg += `\nPagamento: ${pay}`;

  saveOrder({ cart, total, address: addr, payment: pay, date: new Date() });

  window.open(
    `https://wa.me/${WHATS_PHONE}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

// ==================================================
// MODAL
// ==================================================
function openModal(html) {
  closeModal();
  const modal = document.createElement("div");
  modal.className = "promo-overlay";
  modal.innerHTML = `<div class="promo-card">${html}<button class="btn btn-ghost" data-action="close-modal">Cancelar</button></div>`;
  document.body.appendChild(modal);
}

function closeModal() {
  document.querySelectorAll(".promo-overlay").forEach(m => m.remove());
}