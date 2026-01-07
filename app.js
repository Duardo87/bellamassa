// ==================================================
// CONFIGURAÇÃO GLOBAL
// ==================================================
const STORAGE_KEY = "pizzaria-data";
const ORDERS_KEY = "pizzaria-orders";
const WHATS_PHONE = "5562993343622";

// ==================================================
// LOAD DATA
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

  if (data.categories[0]) renderProducts(data.categories[0]);
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
          <button class="btn btn-green"
            onclick="startOrder(${p.id})">
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
    document.querySelectorAll(".categories button").forEach(b => b.classList.remove("active"));
    el.classList.add("active");
    renderProducts(el.dataset.category);
  }

  if (el.dataset.action === "close-modal") closeModal();
});

// ==================================================
// FLUXO DO PEDIDO COM VOLTAR
// ==================================================
function startOrder(id) {
  currentProduct = data.products.find(p => p.id == id);
  selectedFlavors = [];
  selectedSize = null;
  selectedBorder = null;
  selectedExtras = [];

  renderFlavors();
}

// -------- SABORES --------
function renderFlavors() {
  openModal(`
    <h3>🍕 Escolha até ${currentProduct.maxFlavors || 2} sabores</h3>

    ${data.products
      .filter(p => p.category === currentProduct.category)
      .map(p => `
        <label class="extra-item">
          <input type="checkbox" value="${p.name}">
          <span>${p.name}</span>
        </label>`).join("")}

    <button class="btn btn-green" onclick="confirmFlavors()">Continuar</button>
  `);
}

function confirmFlavors() {
  selectedFlavors = [...document.querySelectorAll(".promo-card input:checked")]
    .map(i => i.value);

  if (!selectedFlavors.length) return alert("Escolha ao menos 1 sabor");
  renderSizes();
}

// -------- TAMANHO --------
function renderSizes() {
  openModal(`
    <button class="btn btn-ghost" onclick="renderFlavors()">⬅ Voltar</button>

    <h3>📏 Escolha o tamanho</h3>
    <div class="size-grid">
      <button class="btn btn-green" onclick="confirmSize('Pequena',35)">Pequena<br>R$35</button>
      <button class="btn btn-green" onclick="confirmSize('Média',45)">Média<br>R$45</button>
      <button class="btn btn-green" onclick="confirmSize('Grande',55)">Grande<br>R$55</button>
    </div>
  `);
}

function confirmSize(label, price) {
  selectedSize = { label, price };
  renderBorders();
}

// -------- BORDA --------
function renderBorders() {
  openModal(`
    <button class="btn btn-ghost" onclick="renderSizes()">⬅ Voltar</button>

    <h3>🥖 Escolha a borda</h3>

    <button class="btn btn-ghost" onclick="selectedBorder=null;renderExtras()">Sem borda</button>

    ${data.borders.filter(b => b.active).map(b => `
      <button class="btn btn-green"
        onclick="selectedBorder=${b.id};renderExtras()">
        ${b.name} + R$ ${b.price.toFixed(2)}
      </button>`).join("")}
  `);
}

// -------- ADICIONAIS --------
function renderExtras() {
  openModal(`
    <button class="btn btn-ghost" onclick="renderBorders()">⬅ Voltar</button>

    <h3>➕ Adicionais (opcional)</h3>

    ${data.extras.filter(e => e.active).map(e => `
      <label class="extra-item">
        <input type="checkbox" value="${e.id}">
        <span>${e.name} + R$ ${e.price.toFixed(2)}</span>
      </label>`).join("")}

    <button class="btn btn-green" onclick="finishPizza()">Adicionar ao pedido</button>
  `);
}

function finishPizza() {
  selectedExtras = [...document.querySelectorAll(".promo-card input:checked")]
    .map(i => data.extras.find(e => e.id == i.value));

  let total = selectedSize.price;
  let breakdown = [`Pizza ${selectedSize.label} — R$ ${selectedSize.price.toFixed(2)}`];

  if (selectedBorder) {
    const b = data.borders.find(x => x.id == selectedBorder);
    if (b) {
      total += b.price;
      breakdown.push(`Borda ${b.name} — R$ ${b.price.toFixed(2)}`);
    }
  }

  selectedExtras.forEach(e => {
    total += e.price;
    breakdown.push(`${e.name} — R$ ${e.price.toFixed(2)}`);
  });

  cart.push({
    name: `${currentProduct.name} (${selectedFlavors.join("/")}) • ${selectedSize.label}`,
    price: total,
    breakdown
  });

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
    html += `<p><strong>${i.name}</strong></p>`;
    i.breakdown.forEach(b => html += `<small>• ${b}</small><br>`);
    html += `<strong>Subtotal: R$ ${i.price.toFixed(2)}</strong><hr>`;
  });

  html += `
    <strong>Total: R$ ${total.toFixed(2)}</strong>
    <input id="address" placeholder="Endereço completo">
    <select id="payment">
      <option>Dinheiro</option>
      <option>Pix</option>
      <option>Cartão</option>
    </select>
    <button class="btn btn-green" onclick="sendWhats()">Enviar no WhatsApp</button>
  `;

  div.innerHTML = html;
  div.classList.remove("hidden");
}

// ==================================================
// WHATSAPP
// ==================================================
function sendWhats() {
  const addr = document.getElementById("address").value || "Não informado";
  const pay = document.getElementById("payment").value || "Não informado";

  let msg = `Pedido - ${data.store.name}\n\n`;
  let total = 0;

  cart.forEach(i => {
    total += i.price;
    msg += `• ${i.name}\n`;
    i.breakdown.forEach(b => msg += `   - ${b}\n`);
  });

  msg += `\nTotal: R$ ${total.toFixed(2)}\nEndereço: ${addr}\nPagamento: ${pay}`;

  saveOrder({ cart, total, address: addr, payment: pay, date: new Date() });

  window.open(`https://wa.me/${WHATS_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
}

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