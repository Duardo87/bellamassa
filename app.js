// ==================================================
// CONFIG
// ==================================================
const STORAGE_KEY = "pizzaria-data";
const WHATS_PHONE = "5562993343622";

// ==================================================
// LOAD DATA (COMPATÍVEL COM ADMIN)
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

let data = loadData();
let cart = [];

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

  if (!data.categories.length) return;

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
          ${p.image ? `<img src="${p.image}" alt="${p.name}">` : ""}
          <h3>${p.name}</h3>
          <p>${p.desc || ""}</p>
          <div class="price">R$ ${p.price.toFixed(2)}</div>
          <button class="btn btn-green"
            data-action="add"
            data-id="${p.id}">
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

  const action = el.dataset.action;

  if (action === "category") {
    document.querySelectorAll(".categories button")
      .forEach(b => b.classList.remove("active"));
    el.classList.add("active");
    renderProducts(el.dataset.category);
  }

  if (action === "add") addToCart(el.dataset.id);
  if (action === "send-whats") sendWhats();
});

// ==================================================
// CARRINHO
// ==================================================
function addToCart(id) {
  const p = data.products.find(x => x.id == id);
  if (!p) return;

  cart.push({ name: p.name, price: p.price });
  renderCart();
}

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
// PROMOÇÃO DO DIA (ADMIN)
// ==================================================
function renderPromo() {
  if (!data.promo || !data.promo.active) return;

  const modal = document.createElement("div");
  modal.className = "promo-overlay";
  modal.innerHTML = `
    <div class="promo-card">
      ${data.promo.image ? `<img src="${data.promo.image}">` : ""}
      <h2>🔥 Promoção do Dia</h2>
      <p>${data.promo.description}</p>
      <strong>R$ ${data.promo.price.toFixed(2)}</strong>
      <button class="btn btn-green"
        onclick="cart.push({name:'${data.promo.description}',price:${data.promo.price}});renderCart();this.closest('.promo-overlay').remove()">
        Adicionar
      </button>
    </div>
  `;
  document.body.appendChild(modal);
}

// ==================================================
// WHATSAPP
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

  window.open(
    `https://wa.me/${WHATS_PHONE}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}