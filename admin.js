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
  borders: []
};

// ==================================================
// AUTH
// ==================================================
function login() {
  if ($("loginUser").value !== ADMIN_USER ||
      $("loginPass").value !== ADMIN_PASS) {
    alert("Login inválido");
    return;
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
    return JSON.parse(localStorage.getItem(KEY)) || structuredClone(DEFAULT_DATA);
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
  d.products.forEach(p => {
    if (p.category === old) p.category = val.trim();
  });
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
    alert("Informe ao menos um preço");
    return;
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

  const file = $("prodImage").files[0];
  if (file) {
    const r = new FileReader();
    r.onload = () => {
      p.image = r.result;
      d.products.push(p);
      saveDB(d);
      renderProducts();
    };
    r.readAsDataURL(file);
  } else {
    d.products.push(p);
    saveDB(d);
    renderProducts();
  }

  $("prodName").value = "";
  $("prodDesc").value = "";
  $("prodFlavors").value = "";
  $("priceP").value = "";
  $("priceM").value = "";
  $("priceG").value = "";
  $("prodImage").value = "";
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
    <div>
      ${e.name} • R$ ${e.price}
      <button onclick="toggleExtra(${e.id})">${e.active ? "⏸" : "▶️"}</button>
      <button onclick="deleteExtra(${e.id})">🗑</button>
    </div>
  `).join("");
}

function toggleExtra(id) {
  const d = loadDB();
  const e = d.extras.find(x => x.id === id);
  e.active = !e.active;
  saveDB(d);
  renderExtras();
}

function deleteExtra(id) {
  const d = loadDB();
  d.extras = d.extras.filter(x => x.id !== id);
  saveDB(d);
  renderExtras();
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
    <div>
      ${b.name} • R$ ${b.price}
      <button onclick="toggleBorder(${b.id})">${b.active ? "⏸" : "▶️"}</button>
      <button onclick="deleteBorder(${b.id})">🗑</button>
    </div>
  `).join("");
}

function toggleBorder(id) {
  const d = loadDB();
  const b = d.borders.find(x => x.id === id);
  b.active = !b.active;
  saveDB(d);
  renderBorders();
}

function deleteBorder(id) {
  const d = loadDB();
  d.borders = d.borders.filter(x => x.id !== id);
  saveDB(d);
  renderBorders();
}