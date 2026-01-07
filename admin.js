// ==================================================
// CONFIG
// ==================================================
const ADMIN_USER = "admin";
const ADMIN_PASS = "123456";
const KEY = "pizzaria-data";
const ORDERS_KEY = "pizzaria-orders";

const $ = id => document.getElementById(id);

// ==================================================
// DEFAULT
// ==================================================
const DEFAULT_DATA = {
  store: { name: "", phone: "" },
  categories: [],
  products: [],
  extras: [],
  borders: [],
  promo: { active: false }
};

// ==================================================
// AUTH
// ==================================================
function login() {
  if ($("loginUser").value !== ADMIN_USER || $("loginPass").value !== ADMIN_PASS) {
    return alert("Login inválido");
  }
  $("login").classList.add("hidden");
  $("admin").classList.remove("hidden");
  loadAdmin();
}

function logout() {
  location.reload();
}

// ==================================================
// STORAGE
// ==================================================
function loadDB() {
  try {
    return { ...DEFAULT_DATA, ...JSON.parse(localStorage.getItem(KEY)) };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function saveDB(d) {
  localStorage.setItem(KEY, JSON.stringify(d));
}

// ==================================================
// INIT
// ==================================================
function loadAdmin() {
  const d = loadDB();
  $("storeName").value = d.store.name || "";
  $("storePhone").value = d.store.phone || "";
  renderCategories();
  renderProducts();
  renderPromo();
  renderOrders();
}
window.loadAdmin = loadAdmin;

// ==================================================
// STORE
// ==================================================
function saveStore() {
  const d = loadDB();
  d.store.name = $("storeName").value.trim();
  d.store.phone = $("storePhone").value.replace(/\D/g, "");
  saveDB(d);
  alert("Loja salva");
}

// ==================================================
// CATEGORIES
// ==================================================
function addCategory() {
  const d = loadDB();
  const name = $("catName").value.trim();
  if (!name) return;
  d.categories.push(name);
  saveDB(d);
  $("catName").value = "";
  renderCategories();
}

function renderCategories() {
  const d = loadDB();
  $("catList").innerHTML = d.categories.map(c => `<p>${c}</p>`).join("");
  $("prodCat").innerHTML =
    `<option value="">Selecione</option>` +
    d.categories.map(c => `<option>${c}</option>`).join("");
}

// ==================================================
// PRODUCTS (INLINE EDIT)
// ==================================================
function addProduct() {
  const d = loadDB();
  const name = $("prodName").value.trim();
  const cat = $("prodCat").value;
  if (!name || !cat) return alert("Preencha nome e categoria");

  const save = img => {
    d.products.push({
      id: Date.now(),
      name,
      desc: $("prodDesc").value.trim(),
      category: cat,
      maxFlavors: Number($("prodFlavors").value) || 2,
      image: img,
      active: true
    });
    saveDB(d);
    renderProducts();
  };

  const file = $("prodImage").files[0];
  if (file) {
    const r = new FileReader();
    r.onload = () => save(r.result);
    r.readAsDataURL(file);
  } else save(null);
}

function renderProducts() {
  const d = loadDB();
  const list = $("productList");

  list.innerHTML = d.products.map((p, i) => `
    <div style="border-bottom:1px solid #eee;padding:8px 0">
      <input value="${p.name}" onchange="editProduct(${p.id},'name',this.value)">
      <input value="${p.desc || ""}" onchange="editProduct(${p.id},'desc',this.value)">
      <input type="number" value="${p.maxFlavors}" onchange="editProduct(${p.id},'maxFlavors',this.value)">
      
      <button onclick="toggleProduct(${p.id})">
        ${p.active ? "⏸ Pausar" : "▶️ Ativar"}
      </button>

      <button onclick="moveProduct(${i},-1)">⬆️</button>
      <button onclick="moveProduct(${i},1)">⬇️</button>
      <button onclick="deleteProduct(${p.id})">🗑</button>
    </div>
  `).join("");
}

function editProduct(id, field, value) {
  const d = loadDB();
  const p = d.products.find(p => p.id === id);
  if (!p) return;
  p[field] = field === "maxFlavors" ? Number(value) : value;
  saveDB(d);
}

function toggleProduct(id) {
  const d = loadDB();
  const p = d.products.find(p => p.id === id);
  p.active = !p.active;
  saveDB(d);
  renderProducts();
}

function deleteProduct(id) {
  if (!confirm("Excluir produto?")) return;
  const d = loadDB();
  d.products = d.products.filter(p => p.id !== id);
  saveDB(d);
  renderProducts();
}

function moveProduct(index, dir) {
  const d = loadDB();
  const arr = d.products;
  const newIndex = index + dir;
  if (newIndex < 0 || newIndex >= arr.length) return;
  [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
  saveDB(d);
  renderProducts();
}

// ==================================================
// PROMOÇÃO
// ==================================================
function savePromo() {
  const d = loadDB();
  d.promo = {
    active: true,
    description: $("promoDesc").value.trim(),
    price: Number($("promoPrice").value)
  };
  saveDB(d);
  alert("Promoção salva");
}

function togglePromo() {
  const d = loadDB();
  d.promo.active = !d.promo.active;
  saveDB(d);
  renderPromo();
}

function renderPromo() {
  const d = loadDB();
  if (!$("promoStatus")) return;
  $("promoStatus").innerHTML = d.promo?.active ? "🔥 ATIVA" : "⏸ PAUSADA";
}

// ==================================================
// PEDIDOS
// ==================================================
function renderOrders() {
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  if (!$("ordersSummary")) return;

  let total = 0;
  orders.forEach(o => total += o.total || 0);

  $("ordersSummary").innerHTML = `
    <p>📦 Pedidos: ${orders.length}</p>
    <p>💰 Faturamento: R$ ${total.toFixed(2)}</p>
  `;
}