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
  renderCategories();
  showPromoOfDay();
}
window.app = { renderPublic };

// ==================================================
// HEADER
// ==================================================
function renderHeader() {
  document.getElementById("store-name").textContent =
    data.store?.name || "Delivery";

  const link = document.getElementById("store-phone");
  if (link && data.store?.phone) {
    link.href = `https://wa.me/${data.store.phone}`;
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
    <div class="promo-top">
      <span>🔥 Promoção de Hoje</span>
    </div>

    ${promo.image ? `<img src="${promo.image}" style="width:100%;border-radius:10px">` : ""}

    <h3>${promo.title}</h3>
    <strong style="font-size:22px">R$ ${promo.price.toFixed(2)}</strong>

    <button class="btn btn-green" onclick="addPromo('${promo.title}',${promo.price})">
      Adicionar ao pedido
    </button>

    <button class="btn btn-ghost" onclick="closeModal()">
      Cancelar
    </button>
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

  (data.categories || []).forEach((c, i) => {
    nav.innerHTML += `
      <button class="${i === 0 ? "active" : ""}" data-cat="${c}">
        ${c}
      </button>
    `;
  });

  if (data.categories?.length) {
    renderProducts(data.categories[0]);
  }
}

document.addEventListener("click", e => {
  if (e.target.dataset.cat) {
    document
      .querySelectorAll(".categories button")
      .forEach(b => b.classList.remove("active"));

    e.target.classList.add("active");
    renderProducts(e.target.dataset.cat);
  }
});

// ==================================================
// PRODUTOS
// ==================================================
function renderProducts(category) {
  const grid = document.getElementById("products");
  grid.innerHTML = "";

  (data.products || [])
    .filter(p => p.category === category && p.active !== false)
    .forEach(p => {
      grid.innerHTML += `
        <div class="product-card">
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
    <h3>🍕 Escolha os sabores</h3>

    ${data.products
      .filter(p => p.category === currentProduct.category && p.active !== false)
      .map(p => `
        <label>
          <input type="checkbox" value="${p.name}">
          ${p.name}
        </label>
      `).join("")}

    <button class="btn btn-green" onclick="confirmFlavors()">
      Continuar
    </button>
  `);
}

function confirmFlavors() {
  selectedFlavors = [
    ...document.querySelectorAll(".promo-card input:checked")
  ].map(i => i.value);

  if (!selectedFlavors.length) {
    alert("Escolha ao menos um sabor");
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

    ${prices.P ? `<button class="btn btn-green" onclick="confirmSize('Pequena',${prices.P})">Pequena • R$ ${prices.P}</button>` : ""}
    ${prices.M ? `<button class="btn btn-green" onclick="confirmSize('Média',${prices.M})">Média • R$ ${prices.M}</button>` : ""}
    ${prices.G ? `<button class="btn btn-green" onclick="confirmSize('Grande',${prices.G})">Grande • R$ ${prices.G}</button>` : ""}
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
    <h3>🥖 Escolha a borda</h3>

    <button class="btn btn-ghost" onclick="selectBorder(null)">
      Sem borda
    </button>

    ${(data.borders || []).filter(b => b.active !== false).map(b => `
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

    ${(data.extras || []).filter(e => e.active !== false).map(e => `
      <label>
        <input type="checkbox" value="${e.id}">
        ${e.name} + R$ ${e.price}
      </label>
    `).join("")}

    <button class="btn btn-green" onclick="finishOrder()">
      Adicionar ao pedido
    </button>
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
    <textarea id="obs" placeholder="Observações"></textarea>
    <button class="btn btn-green" onclick="sendWhats()">
      Enviar WhatsApp
    </button>
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
  const obs = document.getElementById("obs").value || "";
  let msg = "Pedido:\n";

  cart.forEach(i => msg += `- ${i.name}\n`);
  if (obs) msg += `\nObs: ${obs}`;

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