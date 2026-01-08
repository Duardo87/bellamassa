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
  document.getElementById("store-name").textContent = data.store.name || "Delivery";
  document.getElementById("store-phone").href =
    `https://wa.me/${data.store.phone || WHATS_PHONE}`;
}

// ==================================================
// PROMOÇÃO
// ==================================================
function renderPromo() {
  if (!data.promo) return;
  const grid = document.getElementById("products");

  grid.innerHTML = `
    <div class="product-card" style="border:2px solid #25d366">
      <h3>🔥 Promoção do Dia</h3>
      <p>${data.promo.description}</p>
      <strong>R$ ${data.promo.price}</strong>
      <button class="btn btn-green" onclick="addPromo()">Adicionar</button>
    </div>
  ` + grid.innerHTML;
}

function addPromo() {
  cart.push({
    name: "🔥 Promoção do Dia",
    price: data.promo.price,
    breakdown: [data.promo.description]
  });
  renderCart();
}

// ==================================================
// CATEGORIAS / PRODUTOS
// ==================================================
function renderCategories() {
  const nav = document.getElementById("categories");
  nav.innerHTML = "";
  data.categories.forEach((c, i) => {
    nav.innerHTML += `<button class="${i===0?"active":""}" data-cat="${c}">${c}</button>`;
  });
  if (data.categories[0]) renderProducts(data.categories[0]);
}

document.addEventListener("click", e => {
  if (e.target.dataset.cat) {
    document.querySelectorAll(".categories button").forEach(b=>b.classList.remove("active"));
    e.target.classList.add("active");
    renderProducts(e.target.dataset.cat);
  }
});

function renderProducts(cat) {
  const grid = document.getElementById("products");
  grid.innerHTML = "";
  data.products
    .filter(p => p.category === cat && p.active !== false)
    .forEach(p => {
      grid.innerHTML += `
        <div class="product-card">
          <h3>${p.name}</h3>
          <p>${p.desc || ""}</p>
          <button class="btn btn-green" onclick="startOrder(${p.id})">Adicionar</button>
        </div>
      `;
    });
}

// ==================================================
// FLUXO DO PEDIDO (COM VOLTAR)
// ==================================================
function startOrder(id) {
  currentProduct = data.products.find(p => p.id === id);
  selectedFlavors = [];
  selectedSize = null;
  selectedBorder = null;
  selectedExtras = [];
  renderFlavors();
}

function renderFlavors() {
  openModal(`
    <h3>🍕 Escolha sabores</h3>
    ${data.products.filter(p=>p.category===currentProduct.category && p.active!==false)
      .map(p=>`<label><input type="checkbox" value="${p.name}"> ${p.name}</label>`).join("")}
    <button class="btn btn-green" onclick="confirmFlavors()">Continuar</button>
  `);
}

function confirmFlavors() {
  selectedFlavors = [...document.querySelectorAll(".promo-card input:checked")].map(i=>i.value);
  if (!selectedFlavors.length) return alert("Escolha ao menos 1 sabor");
  renderSizes();
}

function renderSizes() {
  const prices = currentProduct.prices || {};
  openModal(`
    <button class="btn btn-ghost" onclick="renderFlavors()">⬅ Voltar</button>
    <h3>📏 Tamanho</h3>
    ${prices.P ? `<button class="btn btn-green" onclick="confirmSize('P',${prices.P})">Pequena R$${prices.P}</button>`:""}
    ${prices.M ? `<button class="btn btn-green" onclick="confirmSize('M',${prices.M})">Média R$${prices.M}</button>`:""}
    ${prices.G ? `<button class="btn btn-green" onclick="confirmSize('G',${prices.G})">Grande R$${prices.G}</button>`:""}
  `);
}

function confirmSize(label, price) {
  selectedSize = { label, price };
  renderBorders();
}

function renderBorders() {
  openModal(`
    <button class="btn btn-ghost" onclick="renderSizes()">⬅ Voltar</button>
    <h3>🥖 Borda</h3>
    <button class="btn btn-ghost" onclick="selectBorder(null)">Sem borda</button>
    ${data.borders.filter(b=>b.active)
      .map(b=>`<button class="btn btn-green" onclick="selectBorder(${b.id})">${b.name} + R$${b.price}</button>`).join("")}
  `);
}

function selectBorder(id) {
  selectedBorder = id;
  renderExtras();
}

function renderExtras() {
  openModal(`
    <button class="btn btn-ghost" onclick="renderBorders()">⬅ Voltar</button>
    <h3>➕ Adicionais</h3>
    ${data.extras.filter(e=>e.active)
      .map(e=>`<label><input type="checkbox" value="${e.id}"> ${e.name} + R$${e.price}</label>`).join("")}
    <button class="btn btn-green" onclick="finishPizza()">Adicionar</button>
  `);
}

function finishPizza() {
  selectedExtras = [...document.querySelectorAll(".promo-card input:checked")]
    .map(i=>data.extras.find(e=>e.id==i.value));

  let total = selectedSize.price;
  let breakdown = [];

  if (selectedBorder) {
    const b = data.borders.find(x=>x.id===selectedBorder);
    if (b) total += b.price;
  }

  selectedExtras.forEach(e=> total += e.price);

  cart.push({
    name: `${currentProduct.name} (${selectedFlavors.join("/")})`,
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
  let total = 0;
  div.innerHTML = `<h3>🧾 Pedido</h3>`;
  cart.forEach((i,idx)=>{
    total+=i.price;
    div.innerHTML+=`<p>${i.name} <button onclick="cart.splice(${idx},1);renderCart()">❌</button></p>`;
  });
  div.innerHTML+=`
    <strong>Total: R$ ${total}</strong>
    <textarea id="obs" placeholder="Observações"></textarea>
    <button class="btn btn-green" onclick="sendWhats()">Enviar WhatsApp</button>
  `;
  div.classList.remove("hidden");
}

function sendWhats() {
  const obs = document.getElementById("obs").value || "";
  let msg = "Pedido:\n";
  cart.forEach(i=> msg+=`- ${i.name}\n`);
  if (obs) msg+=`\nObs: ${obs}`;
  window.open(`https://wa.me/${WHATS_PHONE}?text=${encodeURIComponent(msg)}`);
}

// ==================================================
// MODAL
// ==================================================
function openModal(html) {
  closeModal();
  const d=document.createElement("div");
  d.className="promo-overlay";
  d.innerHTML=`<div class="promo-card">${html}<button onclick="closeModal()">Cancelar</button></div>`;
  document.body.appendChild(d);
}
function closeModal(){ document.querySelectorAll(".promo-overlay").forEach(m=>m.remove()); }