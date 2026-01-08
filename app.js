// ==================================================
// CONFIG
// ==================================================
const STORAGE_KEY = "pizzaria-data";
const WHATS_PHONE = "5562993343622";

// ==================================================
// LOAD DATA
// ==================================================
function loadData() {
  let raw = {};
  try { raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch {}

  return {
    store: raw.store || {},
    categories: raw.categories || [],
    products: raw.products || [],
    extras: raw.extras || [],
    borders: raw.borders || [],
    promo: raw.promo && raw.promo.active ? raw.promo : null
  };
}

// ==================================================
// STATE
// ==================================================
let data = null;
let cart = [];

// ==================================================
// INIT
// ==================================================
function renderPublic() {
  data = loadData();
  renderHeader();
  renderPromo();
}
window.app = { renderPublic };

// ==================================================
// HEADER
// ==================================================
function renderHeader() {
  document.getElementById("store-name").textContent =
    data.store.name || "Delivery";
}

// ==================================================
// PROMOÇÃO + CONTADOR
// ==================================================
function renderPromo() {
  if (!data.promo) return;

  const grid = document.getElementById("products");
  let countdown = "";

  if (data.promo.endTime) {
    countdown = `<div id="promo-timer" style="font-weight:bold;color:#b11212"></div>`;
    startCountdown(data.promo.endTime);
  }

  grid.innerHTML = `
    <div class="product-card" style="border:2px solid #25d366">
      ${data.promo.image ? `<img src="${data.promo.image}">` : ""}
      <h3>🔥 Promoção do Dia</h3>
      <p>${data.promo.description}</p>
      <strong>R$ ${data.promo.price}</strong>
      ${countdown}
      <button class="btn btn-green" onclick="addPromo()">Adicionar Promo</button>
    </div>
  `;
}

function startCountdown(endTime) {
  const el = document.getElementById("promo-timer");
  const end = new Date(endTime).getTime();

  setInterval(() => {
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) {
      el.textContent = "Promoção encerrada";
      return;
    }

    const h = Math.floor(diff / 1000 / 60 / 60);
    const m = Math.floor(diff / 1000 / 60) % 60;
    const s = Math.floor(diff / 1000) % 60;

    el.textContent = `⏰ Termina em ${h}h ${m}m ${s}s`;
  }, 1000);
}

function addPromo() {
  cart.push({
    name: "🔥 Promoção do Dia",
    price: data.promo.price
  });
  renderCart();
}

// ==================================================
// CARRINHO
// ==================================================
function renderCart() {
  const div = document.getElementById("cart");
  let total = 0;

  div.innerHTML = `<h3>🧾 Pedido</h3>`;
  cart.forEach(i => {
    total += i.price;
    div.innerHTML += `<p>${i.name}</p>`;
  });

  div.innerHTML += `
    <strong>Total: R$ ${total}</strong>
    <button class="btn btn-green" onclick="sendWhats()">Enviar WhatsApp</button>
  `;
}

function sendWhats() {
  let msg = "Pedido:\n";
  cart.forEach(i => msg += `- ${i.name}\n`);
  window.open(`https://wa.me/${WHATS_PHONE}?text=${encodeURIComponent(msg)}`);
}