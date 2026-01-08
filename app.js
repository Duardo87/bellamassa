// ==================================================
// CONFIGURAÇÃO GLOBAL
// ==================================================
const STORAGE_KEY = "pizzaria-data";
const ORDERS_KEY = "pizzaria-orders";
const WHATS_PHONE = "5562993343622";

// ==================================================
// LOAD DATA (LOCAL)
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
let selectedSize = null;

// ==================================================
// INIT
// ==================================================
function renderPublic() {
  data = loadData();
  renderHeader();
  renderCategories();
  renderPromo();
  renderCart();
}
window.app = { renderPublic };

// ==================================================
// HEADER
// ==================================================
function renderHeader() {
  document.getElementById("store-name").textContent = data.store.name;
  document.getElementById("store-phone").href =
    `https://wa.me/${data.store.phone || WHATS_PHONE}`;
}

// ==================================================
// PROMOÇÃO
// ==================================================
function renderPromo() {
  if (!data.promo) return;

  openModal(`
    ${data.promo.image ? `<img src="${data.promo.image}">` : ""}
    <h2>🔥 Promoção do Dia</h2>
    <p>${data.promo.description}</p>
    <strong>R$ ${Number(data.promo.price).toFixed(2)}</strong>
    <button class="btn btn-green" onclick="addPromoToCart()">Adicionar</button>
  `);
}

function addPromoToCart() {
  cart.push({
    name: data.promo.description,
    size: "Promo",
    price: Number(data.promo.price)
  });
  closeModal();
  renderCart();
}

// ==================================================
// CATEGORIAS
// ==================================================
function renderCategories() {
  const nav = document.getElementById("categories");
  nav.innerHTML = "";

  if (!data.categories.length) {
    document.getElementById("products").innerHTML =
      "<p style='padding:20px'>Nenhum produto cadastrado</p>";
    return;
  }

  data.categories.forEach((cat, i) => {
    nav.innerHTML += `
      <button class="${i === 0 ? "active" : ""}"
        data-action="category"
        data-category="${cat}">
        ${cat}
      </button>`;
  });

  renderProducts(data.categories[0]);
}

// ==================================================
// PRODUTOS
// ==================================================
function renderProducts(category) {
  const grid = document.getElementById("products");
  grid.innerHTML = "";

  data.products
    .filter(p => p.category === category)
    .forEach(p => {
      grid.innerHTML += `
        <div class="product-card">
          ${p.image ? `<img src="${p.image}">` : ""}
          <h3>${p.name}</h3>
          <p>${p.desc || ""}</p>
          <button class="btn btn-green" onclick="selectProduct(${p.id})">
            Escolher
          </button>
        </div>`;
    });
}

// ==================================================
// SELEÇÃO DE PRODUTO + TAMANHO
// ==================================================
function selectProduct(id) {
  currentProduct = data.products.find(p => p.id === id);
  selectedSize = null;

  openModal(`
    <h2>${currentProduct.name}</h2>
    <div class="size-grid">
      <button class="btn" onclick="selectSize('P')">P</button>
      <button class="btn" onclick="selectSize('M')">M</button>
      <button class="btn" onclick="selectSize('G')">G</button>
    </div>
  `);
}

function selectSize(size) {
  selectedSize = size;
  const price = currentProduct.prices[size];

  cart.push({
    name: currentProduct.name,
    size,
    price
  });

  closeModal();
  renderCart();
}

// ==================================================
// CARRINHO
// ==================================================
function renderCart() {
  const el = document.getElementById("cart");
  if (!cart.length) {
    el.innerHTML = "<small>Carrinho vazio</small>";
    return;
  }

  let total = 0;
  el.innerHTML = cart.map(item => {
    total += item.price;
    return `<div>${item.name} (${item.size}) - R$ ${item.price.toFixed(2)}</div>`;
  }).join("");

  el.innerHTML += `
    <hr>
    <strong>Total: R$ ${total.toFixed(2)}</strong>
    <button class="btn btn-green" onclick="sendWhatsApp()">Enviar pedido</button>
  `;
}

// ==================================================
// WHATSAPP
// ==================================================
function sendWhatsApp() {
  let msg = `🍕 *Pedido Bella Massa*%0A`;
  let total = 0;

  cart.forEach(i => {
    msg += `- ${i.name} (${i.size}) R$ ${i.price.toFixed(2)}%0A`;
    total += i.price;
  });

  msg += `%0A*Total:* R$ ${total.toFixed(2)}`;

  saveOrder({ items: cart, total, date: new Date().toISOString() });
  window.open(`https://wa.me/${data.store.phone}?text=${msg}`, "_blank");

  cart = [];
  renderCart();
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
    </div>`;
  document.body.appendChild(modal);
}

function closeModal() {
  document.querySelectorAll(".promo-overlay").forEach(m => m.remove());
}