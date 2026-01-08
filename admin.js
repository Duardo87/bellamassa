// ==================================================
// CONFIG
// ==================================================
const ADMIN_USER = "admin";
const ADMIN_PASS = "123456";
const KEY = "pizzaria-data";
const ORDERS_KEY = "pizzaria-orders";

const $ = id => document.getElementById(id);

// ==================================================
// DEFAULT (NORMALIZADO)
// ==================================================
const DEFAULT_DATA = {
  store: {
    name: "",
    phone: "",
    logo: null
  },
  categories: [],
  products: [],
  extras: [],
  borders: [],
  promo: {
    active: false,
    description: "",
    price: 0,
    image: null
  }
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
// STORAGE (SEGURO)
// ==================================================
function normalizeDB(raw = {}) {
  return {
    store: { ...DEFAULT_DATA.store, ...(raw.store || {}) },
    categories: Array.isArray(raw.categories) ? raw.categories : [],
    products: Array.isArray(raw.products) ? raw.products : [],
    extras: Array.isArray(raw.extras) ? raw.extras : [],
    borders: Array.isArray(raw.borders) ? raw.borders : [],
    promo: { ...DEFAULT_DATA.promo, ...(raw.promo || {}) }
  };
}

function loadDB() {
  try {
    return normalizeDB(JSON.parse(localStorage.getItem(KEY)) || {});
  } catch {
    return normalizeDB();
  }
}

function saveDB(d) {
  localStorage.setItem(KEY, JSON.stringify(normalizeDB(d)));
}

// ==================================================
// INIT
// ==================================================
function loadAdmin() {
  const d = loadDB();

  $("storeName").value = d.store.name || "";
  $("storePhone").value = d.store.phone || "";

  if (d.store.logo && $("logoImg")) {
    $("logoImg").src = d.store.logo;
    $("logoPreview").style.display = "flex";
  }

  renderCategories();
  renderProducts();
  renderPromo();
  renderOrders();
}
window.loadAdmin = loadAdmin;

// ==================================================
// STORE (COM LOGO)
// ==================================================
function saveStore() {
  const d = loadDB();

  d.store.name = $("storeName").value.trim();
  d.store.phone = $("storePhone").value.replace(/\D/g, "");

  const logoInput = $("storeLogo");
  const file = logoInput?.files?.[0];

  if (file) {
    const r = new FileReader();
    r.onload = () => {
      d.store.logo = r.result;
      saveDB(d);
      alert("Loja e logo salvas");
    };
    r.readAsDataURL(file);
  } else {
    saveDB(d);
    alert("Loja salva");
  }
}

// ==================================================
// CATEGORIES (EDITAR / APAGAR)
// ==================================================
function addCategory() {
  const d = loadDB();
  const name = $("catName").value.trim();
  if (!name) return;

  if (!d.categories.includes(name)) d.categories.push(name);

  saveDB(d);
  $("catName").value = "";
  renderCategories();
}

function renderCategories() {
  const d = loadDB();

  $("catList").innerHTML = d.categories.map((c, i) => `
    <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">
      <input value="${c}" style="flex:1"
        onchange="editCategory(${i}, this.value)">
      <button onclick="deleteCategory(${i})">🗑</button>
    </div>
  `).join("");

  $("prodCat").innerHTML =
    `<option value="">Selecione</option>` +
    d.categories.map(c => `<option value="${c}">${c}</option>`).join("");
}

function editCategory(index, newName) {
  const d = loadDB();
  newName = newName.trim();
  if (!newName) return;

  const old = d.categories[index];
  d.categories[index] = newName;

  d.products.forEach(p => {
    if (p.category === old) p.category = newName;
  });

  saveDB(d);
  renderCategories();
}

function deleteCategory(index) {
  if (!confirm("Excluir esta categoria?")) return;

  const d = loadDB();
  const removed = d.categories[index];
  d.categories.splice(index, 1);

  d.products.forEach(p => {
    if (p.category === removed) p.category = "";
  });

  saveDB(d);
  renderCategories();
  renderProducts();
}

// ==================================================
// PRODUCTS
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
  $("productList").innerHTML = d.products.map((p, i) => `
    <div style="border-bottom:1px solid #eee;padding:10px 0">
      <input value="${p.name}" onchange="editProduct(${p.id},'name',this.value)">
      <input value="${p.desc || ""}" onchange="editProduct(${p.id},'desc',this.value)">
      <input type="number" value="${p.maxFlavors}"
        onchange="editProduct(${p.id},'maxFlavors',this.value)">
      <div style="margin-top:6px">
        <button onclick="toggleProduct(${p.id})">${p.active ? "⏸ Pausar" : "▶️ Ativar"}</button>
        <button onclick="moveProduct(${i},-1)">⬆️</button>
        <button onclick="moveProduct(${i},1)">⬇️</button>
        <button onclick="deleteProduct(${p.id})">🗑</button>
      </div>
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
  const ni = index + dir;
  if (ni < 0 || ni >= arr.length) return;
  [arr[index], arr[ni]] = [arr[ni], arr[index]];
  saveDB(d);
  renderProducts();
}

// ==================================================
// PROMOÇÃO
// ==================================================
function savePromo() {
  const d = loadDB();
  const desc = $("promoDesc").value.trim();
  const price = Number($("promoPrice").value);
  const imgEl = $("promoImage");

  if (!desc || !price) return alert("Preencha descrição e preço");

  const save = img => {
    d.promo = { ...d.promo, description: desc, price, image: img };
    saveDB(d);
    renderPromo();
    alert("Promoção salva");
  };

  const file = imgEl?.files?.[0];
  if (file) {
    const r = new FileReader();
    r.onload = () => save(r.result);
    r.readAsDataURL(file);
  } else save(d.promo.image || null);
}

function togglePromo() {
  const d = loadDB();
  d.promo.active = !d.promo.active;
  saveDB(d);
  renderPromo();
}

function renderPromo() {
  const d = loadDB();
  if ($("promoStatus"))
    $("promoStatus").textContent = d.promo.active ? "ATIVA" : "PAUSADA";
}

// ==================================================
// PEDIDOS
// ==================================================
function renderOrders() {
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  let total = 0;
  orders.forEach(o => total += o.total || 0);

  $("ordersSummary").innerHTML = `
    <p>📦 Pedidos: ${orders.length}</p>
    <p>💰 Faturamento: R$ ${total.toFixed(2)}</p>
  `;
}