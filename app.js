// ==================================================
// CONFIG
// ==================================================
const STORAGE_KEY = "pizzaria-data";
const WHATS_PHONE = "5562993343622";

// ==================================================
// LOAD DATA
// ==================================================
function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

// ==================================================
// INIT
// ==================================================
let data = null;
let cart = [];

function renderPublic() {
  data = loadData();
  renderHeader();
  showPromoOfDay();
}
window.app = { renderPublic };

// ==================================================
// HEADER
// ==================================================
function renderHeader() {
  document.getElementById("store-name").textContent =
    data.store?.name || "Delivery";
}

// ==================================================
// PROMO DO DIA (AUTOMÁTICA)
// ==================================================
function showPromoOfDay() {
  if (!data.promoWeek) return;

  const day = new Date().getDay();
  const promo = data.promoWeek[day];
  if (!promo || !promo.active) return;

  openModal(`
    <div class="promo-top">
      <span>🔥 Promoção de Hoje</span>
    </div>

    ${promo.image ? `<img src="${promo.image}">` : ""}

    <h3>${promo.title}</h3>
    <strong>R$ ${promo.price.toFixed(2)}</strong>

    <button class="btn btn-green" onclick="addPromo('${promo.title}',${promo.price})">
      Adicionar ao pedido
    </button>

    <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
  `);
}

function addPromo(name, price) {
  cart.push({ name, price });
  closeModal();
  renderCart();
}

// ==================================================
// CARRINHO
// ==================================================
function renderCart() {
  const c = document.getElementById("cart");
  let total = 0;
  c.innerHTML = "<h3>Pedido</h3>";
  cart.forEach(i=>{
    total+=i.price;
    c.innerHTML+=`<p>${i.name} - R$ ${i.price}</p>`;
  });
  c.innerHTML+=`
    <strong>Total: R$ ${total}</strong>
    <button class="btn btn-green" onclick="sendWhats()">Enviar WhatsApp</button>
  `;
}

function sendWhats() {
  let msg="Pedido:\n";
  cart.forEach(i=>msg+=`- ${i.name}\n`);
  window.open(`https://wa.me/${WHATS_PHONE}?text=${encodeURIComponent(msg)}`);
}

// ==================================================
// MODAL
// ==================================================
function openModal(html) {
  closeModal();
  const d=document.createElement("div");
  d.className="promo-overlay";
  d.innerHTML=`<div class="promo-card">${html}</div>`;
  document.body.appendChild(d);
}
function closeModal() {
  document.querySelectorAll(".promo-overlay")?.remove();
}