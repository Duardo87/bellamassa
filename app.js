// ==================================================
// CONFIG
// ==================================================
const WHATS_PHONE = "5562993343622";
let data = null;
let cart = [];

// ==================================================
// LOAD app.json
// ==================================================
async function loadData() {
  try {
    const res = await fetch("./app.json?v=" + Date.now());
    return await res.json();
  } catch (e) {
    console.error("Erro ao carregar app.json", e);
    return {};
  }
}

// ==================================================
// INIT
// ==================================================
document.addEventListener("DOMContentLoaded", async () => {
  data = await loadData();
  renderHeader();
  renderCategories();
  showPromoOfDay();
});

// ==================================================
// HEADER
// ==================================================
function renderHeader() {
  document.getElementById("store-name").textContent =
    data.store?.name || "Delivery";

  if (data.store?.phone) {
    document.getElementById("store-phone").href =
      `https://wa.me/${data.store.phone}`;
  }
}

// ==================================================
// PROMOÇÃO POR DIA DA SEMANA
// ==================================================
function showPromoOfDay() {
  if (!data.promoWeek) return;

  const day = new Date().getDay();
  const promo = data.promoWeek[day];
  if (!promo || !promo.active) return;

  openModal(`
    <div class="promo-top">🔥 Promoção de Hoje</div>

    ${promo.image ? `<img src="${promo.image}" style="width:100%;border-radius:10px">` : ""}

    <h3>${promo.title}</h3>
    <strong>R$ ${Number(promo.price || 0).toFixed(2)}</strong>

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
// CATEGORIAS
// ==================================================
function renderCategories() {
  const nav = document.getElementById("categories");
  nav.innerHTML = "";

  const categories = (data.categories || [])
    .filter(c => c.active)
    .sort((a, b) => a.order - b.order);

  categories.forEach((c, i) => {
    nav.innerHTML += `
      <button class="${i === 0 ? "active" : ""}" data-cat="${c.id}">
        ${c.name}
      </button>
    `;
  });

  if (categories.length) {
    renderProducts(categories[0].id);
  }
}

document.addEventListener("click", e => {
  if (e.target.dataset.cat) {
    document
      .querySelectorAll(".categories button")
      .forEach(b => b.classList.remove("active"));

    e.target.classList.add("active");
    renderProducts(Number(e.target.dataset.cat));
  }
});

// ==================================================
// PRODUTOS
// ==================================================
function renderProducts(categoryId) {
  const grid = document.getElementById("products");
  grid.innerHTML = "";

  const products = (data.products || [])
    .filter(p => p.active && p.categoryId === categoryId)
    .sort((a, b) => a.order - b.order);

  products.forEach(p => {
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
// FLUXO DO PEDIDO
// ==================================================
let currentProduct = null;
let selectedFlavors = [];
let selectedSize = null;
let selectedBorder = null;
let selectedExtras = [];

function startOrder(id) {
  currentProduct = data.products.find(p => p.id === id);
  selectedFlavors = [];
  selectedSize = null;
  selectedBorder = null;
  selectedExtras = [];
  renderFlavors();
}

// ---------------- SABORES ----------------
function renderFlavors() {
  openModal(`
    <h3>🍕 Escolha até ${currentProduct.maxFlavors} sabores</h3>

    ${data.products
      .filter(p => p.active && p.categoryId === currentProduct.categoryId)
      .map(p => `
        <label>
          <input type="checkbox" value="${p.name}">
          ${p.name}
        </label>
      `).join("")}

    <button class="btn btn-green" onclick="confirmFlavors()">Continuar</button>
  `);
}

function confirmFlavors() {
  selectedFlavors = [
    ...document.querySelectorAll(".promo-card input:checked")
  ].map(i => i.value);

  if (
    !selectedFlavors.length ||
    selectedFlavors.length > currentProduct.maxFlavors
  ) {
    alert(`Escolha até ${currentProduct.maxFlavors} sabores`);
    return;
  }

  renderSizes();
}

// ---------------- TAMANHOS ----------------
function renderSizes() {
  const prices = currentProduct.prices || {};

  openModal(`
    <button class="btn btn-ghost" onclick="renderFlavors()">⬅ Voltar</button>
    <h3>📏 Escolha o tamanho</h3>

    ${prices.P ? `<button class="btn btn-green" onclick="confirmSize('P',${prices.P})">Pequena • R$ ${prices.P}</button>` : ""}
    ${prices.M ? `<button class="btn btn-green" onclick="confirmSize('M',${prices.M})">Média • R$ ${prices.M}</button>` : ""}
    ${prices.G ? `<button class="btn btn-green" onclick="confirmSize('G',${prices.G})">Grande • R$ ${prices.G}</button>` : ""}
  `);
}

function confirmSize(label, price) {
  selectedSize = { label, price };
  renderBorders();
}

// ---------------- BORDAS ----------------
function renderBorders() {
  openModal(`
    <button class="btn btn-ghost" onclick="renderSizes()">⬅ Voltar</button>
    <h3>🥖 Borda</h3>

    <button class="btn btn-ghost" onclick="selectBorder(null)">Sem borda</button>

    ${(data.borders || [])
      .filter(b => b.active)
      .sort((a, b) => a.order - b.order)
      .map(b => `
        <button class="btn btn-green" onclick="selectBorder(${b.id})">
          ${b.name} + R$ ${b.price}
        </button>
      `).join("")}
  `);
}

function selectBorder(id) {
  selectedBorder = id;
  renderExtras();
}

// ---------------- EXTRAS ----------------
function renderExtras() {
  openModal(`
    <button class="btn btn-ghost" onclick="renderBorders()">⬅ Voltar</button>
    <h3>➕ Adicionais</h3>

    ${(data.extras || [])
      .filter(e => e.active)
      .sort((a, b) => a.order - b.order)
      .map(e => `
        <label>
          <input type="checkbox" value="${e.id}">
          ${e.name} + R$ ${e.price}
        </label>
      `).join("")}

    <button class="btn btn-green" onclick="finishOrder()">Adicionar ao pedido</button>
  `);
}

// ---------------- FINALIZAR ----------------
function finishOrder() {
  selectedExtras = [
    ...document.querySelectorAll(".promo-card input:checked")
  ].map(i => data.extras.find(e => e.id == i.value));

  let total = selectedSize.price;
  let desc = `${currentProduct.name} (${selectedFlavors.join("/")}) - ${selectedSize.label}`;

  if (selectedBorder) {
    const b = data.borders.find(x => x.id === selectedBorder);
    if (b) {
      total += b.price;
      desc += ` | Borda: ${b.name}`;
    }
  }

  selectedExtras.forEach(e => {
    total += e.price;
    desc += ` | Extra: ${e.name}`;
  });

  cart.push({ name: desc, price: total });

  closeModal();
  renderCart();
}

// ==================================================
// CARRINHO
// ==================================================
function renderCart() {
  const c = document.getElementById("cart");
  let total = 0;

  c.innerHTML = "<h3>🧾 Pedido</h3>";

  cart.forEach((i, idx) => {
    total += i.price;
    c.innerHTML += `
      <p>
        ${i.name} - R$ ${i.price.toFixed(2)}
        <button onclick="removeItem(${idx})">❌</button>
      </p>
    `;
  });

  c.innerHTML += `
    <strong>Total: R$ ${total.toFixed(2)}</strong>
    <button class="btn btn-green" onclick="sendWhats()">Enviar WhatsApp</button>
  `;
}

function removeItem(i) {
  cart.splice(i, 1);
  renderCart();
}

// ==================================================
// WHATSAPP
// ==================================================
function sendWhats() {
  let msg = "Pedido:\n";
  cart.forEach(i => (msg += `- ${i.name}\n`));
  window.open(
    `https://wa.me/${WHATS_PHONE}?text=${encodeURIComponent(msg)}`
  );
}

// ==================================================
// MODAL
// ==================================================
function openModal(html) {
  closeModal();
  const d = document.createElement("div");
  d.className = "promo-overlay";
  d.innerHTML = `<div class="promo-card">${html}</div>`;
  document.body.appendChild(d);
}

function closeModal() {
  document.querySelectorAll(".promo-overlay").forEach(m => m.remove());
}