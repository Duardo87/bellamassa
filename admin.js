// ==================================================
// CONFIG
// ==================================================
const ADMIN_USER = "admin";
const ADMIN_PASS = "123456";
const KEY = "pizzaria-data";

const $ = id => document.getElementById(id);

// ==================================================
// DEFAULT DATA
// ==================================================
const DEFAULT_DATA = {
  store: { name: "", phone: "", open: "", close: "" },
  categories: [],
  products: [],
  extras: [],
  borders: [],
  promo: {
    active: false,
    description: "",
    price: 0
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
// STORAGE
// ==================================================
function loadDB() {
  try {
    return { ...DEFAULT_DATA, ...JSON.parse(localStorage.getItem(KEY)) };
  } catch {
    return structuredClone(DEFAULT_DATA);
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

  $("storeName").value = d.store.name;
  $("storePhone").value = d.store.phone;
  $("openTime").value = d.store.open;
  $("closeTime").value = d.store.close;

  renderCategories();
  renderProducts();
  renderExtras();
  renderBorders();
  renderPromo();
}

// ==================================================
// STORE
// ==================================================
function saveStore() {
  const d = loadDB();
  d.store.name = $("storeName").value.trim();
  d.store.phone = $("storePhone").value.replace(/\D/g, "");
  saveDB(d);
  alert("Dados salvos");
}

function saveHours() {
  const d = loadDB();
  d.store.open = $("openTime").value;
  d.store.close = $("closeTime").value;
  saveDB(d);
  alert("Horário salvo");
}

// ==================================================
// CATEGORIES
// ==================================================
function addCategory() {
  const d = loadDB();
  const name = $("catName").value.trim();
  if (!name) return;
  d.categories.push(name);
  $("catName").value = "";
  saveDB(d);
  renderCategories();
}

function renderCategories() {
  const d = loadDB();
  $("catList").innerHTML = d.categories.map((c, i) => `
    <div>
      <input value="${c}" onchange="editCategory(${i},this.value)">
      <button onclick="deleteCategory(${i})">🗑</button>
    </div>
  `).join("");

  $("prodCat").innerHTML =
    `<option value="">Selecione</option>` +
    d.categories.map(c => `<option>${c}</option>`).join("");
}

function editCategory(i, val) {
  const d = loadDB();
  const old = d.categories[i];
  d.categories[i] = val.trim();
  d.products.forEach(p => { if (p.category === old) p.category = val.trim(); });
  saveDB(d);
  renderCategories();
}

function deleteCategory(i) {
  const d = loadDB();
  d.categories.splice(i, 1);
  saveDB(d);
  renderCategories();
  renderProducts();
}

// ==================================================
// PRODUCTS
// ==================================================
function addProduct() {
  const d = loadDB();

  const prices = {
    P: Number($("priceP").value) || null,
    M: Number($("priceM").value) || null,
    G: Number($("priceG").value) || null
  };

  if (!prices.P && !prices.M && !prices.G) {
    return alert("Informe ao menos um preço");
  }

  const p = {
    id: Date.now(),
    name: $("prodName").value,
    desc: $("prodDesc").value,
    category: $("prodCat").value,
    maxFlavors: Number($("prodFlavors").value) || 2,
    prices,
    image: null,
    active: true
  };

  d.products.push(p);
  saveDB(d);
  renderProducts();

  $("prodName").value = "";
  $("prodDesc").value = "";
  $("prodFlavors").value = "";
  $("priceP").value = "";
  $("priceM").value = "";
  $("priceG").value = "";
}

function renderProducts() {
  const d = loadDB();
  $("productList").innerHTML = d.products.map(p => `
    <div>
      ${p.name}
      <button onclick="toggleProduct(${p.id})">${p.active ? "⏸" : "▶️"}</button>
      <button onclick="deleteProduct(${p.id})">🗑</button>
    </div>
  `).join("");
}

function toggleProduct(id) {
  const d = loadDB();
  const p = d.products.find(x => x.id === id);
  p.active = !p.active;
  saveDB(d);
  renderProducts();
}

function deleteProduct(id) {
  const d = loadDB();
  d.products = d.products.filter(p => p.id !== id);
  saveDB(d);
  renderProducts();
}

// ==================================================
// EXTRAS
// ==================================================
function addExtra() {
  const d = loadDB();
  d.extras.push({
    id: Date.now(),
    name: $("extraName").value,
    price: Number($("extraPrice").value),
    active: true
  });
  saveDB(d);
  renderExtras();
}

function renderExtras() {
  const d = loadDB();
  $("extraList").innerHTML = d.extras.map(e => `
    <div>${e.name} - R$ ${e.price}</div>
  `).join("");
}

// ==================================================
// BORDERS
// ==================================================
function addBorder() {
  const d = loadDB();
  d.borders.push({
    id: Date.now(),
    name: $("borderName").value,
    price: Number($("borderPrice").value),
    active: true
  });
  saveDB(d);
  renderBorders();
}

function renderBorders() {
  const d = loadDB();
  $("borderList").innerHTML = d.borders.map(b => `
    <div>${b.name} - R$ ${b.price}</div>
  `).join("");
}

// ==================================================
// PROMOÇÃO
// ==================================================
function savePromo() {
  const d = loadDB();
  d.promo.description = $("promoDesc").value;
  d.promo.price = Number($("promoPrice").value);
  d.promo.active = true;
  saveDB(d);
  renderPromo();
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
  $("promoStatus").textContent = d.promo.active ? "ATIVA" : "PAUSADA";
}