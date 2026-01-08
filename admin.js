// ==================================================
// CONFIG
// ==================================================
const ADMIN_USER = "admin";
const ADMIN_PASS = "123456";
const STORAGE_KEY = "admin-data";
const $ = id => document.getElementById(id);

// ==================================================
// DATA MODEL (IGUAL app.json)
// ==================================================
const DEFAULT_DATA = {
  store: { name: "", phone: "", open: "", close: "" },
  categories: [],
  products: [],
  extras: [],
  borders: [],
  promoWeek: {}
};

// ==================================================
// AUTH
// ==================================================
function login() {
  if ($("loginUser").value !== ADMIN_USER || $("loginPass").value !== ADMIN_PASS)
    return alert("Login inválido");
  $("login").classList.add("hidden");
  $("admin").classList.remove("hidden");
  loadAdmin();
}

// ==================================================
// STORAGE
// ==================================================
function loadDB() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(DEFAULT_DATA);
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}
function saveDB(d) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
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
  renderPromoWeek();
}

// ==================================================
// STORE
// ==================================================
function saveStore() {
  const d = loadDB();
  d.store = {
    name: $("storeName").value.trim(),
    phone: $("storePhone").value.replace(/\D/g, ""),
    open: $("openTime").value,
    close: $("closeTime").value
  };
  saveDB(d);
  alert("Dados da loja salvos");
}

// ==================================================
// UTIL
// ==================================================
function uid() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// ==================================================
// CATEGORIES (CONTROLE TOTAL)
// ==================================================
function addCategory() {
  const d = loadDB();
  d.categories.push({
    id: uid(),
    name: $("catName").value.trim(),
    order: d.categories.length + 1,
    active: true
  });
  $("catName").value = "";
  saveDB(d);
  renderCategories();
}

function renderCategories() {
  const d = loadDB();
  $("catList").innerHTML = d.categories
    .sort((a, b) => a.order - b.order)
    .map((c, i) => `
      <div class="row">
        <input value="${c.name}" onchange="editCategory(${c.id},this.value)">
        <button onclick="toggleCategory(${c.id})">${c.active ? "👁" : "🚫"}</button>
        <button onclick="moveCategory(${i},-1)">⬆</button>
        <button onclick="moveCategory(${i},1)">⬇</button>
        <button onclick="deleteCategory(${c.id})">🗑</button>
      </div>
    `).join("");

  $("prodCat").innerHTML =
    d.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}

function editCategory(id, val) {
  const d = loadDB();
  d.categories.find(c => c.id === id).name = val;
  saveDB(d);
}
function toggleCategory(id) {
  const d = loadDB();
  const c = d.categories.find(x => x.id === id);
  c.active = !c.active;
  saveDB(d);
  renderCategories();
}
function moveCategory(i, dir) {
  const d = loadDB();
  const arr = d.categories.sort((a, b) => a.order - b.order);
  if (!arr[i + dir]) return;
  [arr[i].order, arr[i + dir].order] = [arr[i + dir].order, arr[i].order];
  saveDB(d);
  renderCategories();
}
function deleteCategory(id) {
  const d = loadDB();
  d.categories = d.categories.filter(c => c.id !== id);
  d.products = d.products.filter(p => p.categoryId !== id);
  saveDB(d);
  renderCategories();
  renderProducts();
}

// ==================================================
// PRODUCTS (CONTROLE TOTAL)
// ==================================================
function addProduct() {
  const d = loadDB();
  d.products.push({
    id: uid(),
    categoryId: Number($("prodCat").value),
    name: $("prodName").value,
    desc: $("prodDesc").value,
    prices: {
      P: Number($("priceP").value) || null,
      M: Number($("priceM").value) || null,
      G: Number($("priceG").value) || null
    },
    maxFlavors: Number($("prodFlavors").value) || 2,
    image: null,
    order: d.products.length + 1,
    active: true
  });
  saveDB(d);
  renderProducts();
}

function renderProducts() {
  const d = loadDB();
  $("productList").innerHTML = d.products
    .sort((a, b) => a.order - b.order)
    .map((p, i) => `
      <div class="row">
        <input value="${p.name}" onchange="editProduct(${p.id},'name',this.value)">
        <button onclick="toggleProduct(${p.id})">${p.active ? "👁" : "🚫"}</button>
        <button onclick="moveProduct(${i},-1)">⬆</button>
        <button onclick="moveProduct(${i},1)">⬇</button>
        <button onclick="deleteProduct(${p.id})">🗑</button>
      </div>
    `).join("");
}

function editProduct(id, f, v) {
  const d = loadDB();
  d.products.find(p => p.id === id)[f] = v;
  saveDB(d);
}
function toggleProduct(id) {
  const d = loadDB();
  const p = d.products.find(x => x.id === id);
  p.active = !p.active;
  saveDB(d);
  renderProducts();
}
function moveProduct(i, dir) {
  const d = loadDB();
  const arr = d.products.sort((a, b) => a.order - b.order);
  if (!arr[i + dir]) return;
  [arr[i].order, arr[i + dir].order] = [arr[i + dir].order, arr[i].order];
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
// EXTRAS & BORDERS (MESMO PADRÃO)
// ==================================================
function simpleList(type, name, price) {
  const d = loadDB();
  d[type].push({ id: uid(), name, price, order: d[type].length + 1, active: true });
  saveDB(d);
}
function renderSimple(type, el) {
  const d = loadDB();
  el.innerHTML = d[type]
    .sort((a, b) => a.order - b.order)
    .map((e, i) => `
      <div class="row">
        <input value="${e.name}" onchange="editSimple('${type}',${e.id},'name',this.value)">
        <input type="number" value="${e.price}" onchange="editSimple('${type}',${e.id},'price',this.value)">
        <button onclick="toggleSimple('${type}',${e.id})">${e.active ? "👁" : "🚫"}</button>
        <button onclick="moveSimple('${type}',${i},-1)">⬆</button>
        <button onclick="moveSimple('${type}',${i},1)">⬇</button>
        <button onclick="deleteSimple('${type}',${e.id})">🗑</button>
      </div>
    `).join("");
}
function editSimple(t, id, f, v) {
  const d = loadDB();
  d[t].find(x => x.id === id)[f] = f === "price" ? Number(v) : v;
  saveDB(d);
}
function toggleSimple(t, id) {
  const d = loadDB();
  d[t].find(x => x.id === id).active = !d[t].find(x => x.id === id).active;
  saveDB(d);
  renderExtras();
  renderBorders();
}
function moveSimple(t, i, dir) {
  const d = loadDB();
  const arr = d[t].sort((a, b) => a.order - b.order);
  if (!arr[i + dir]) return;
  [arr[i].order, arr[i + dir].order] = [arr[i + dir].order, arr[i].order];
  saveDB(d);
  renderExtras();
  renderBorders();
}
function deleteSimple(t, id) {
  const d = loadDB();
  d[t] = d[t].filter(x => x.id !== id);
  saveDB(d);
  renderExtras();
  renderBorders();
}

// ==================================================
// PROMO WEEK
// ==================================================
function renderPromoWeek() {
  const d = loadDB();
  const days = ["Dom","Seg","Ter","Qua","Qui","Sex","Sab"];
  $("promoWeek").innerHTML = days.map((day, i) => `
    <div class="row">
      <strong>${day}</strong>
      <input placeholder="Título" value="${d.promoWeek[i]?.title || ""}"
        onchange="setPromo(${i},'title',this.value)">
      <input type="number" placeholder="Preço" value="${d.promoWeek[i]?.price || ""}"
        onchange="setPromo(${i},'price',this.value)">
      <input type="checkbox" ${d.promoWeek[i]?.active ? "checked" : ""}
        onchange="setPromo(${i},'active',this.checked)">
    </div>
  `).join("");
}
function setPromo(day, f, v) {
  const d = loadDB();
  d.promoWeek[day] = d.promoWeek[day] || {};
  d.promoWeek[day][f] = f === "price" ? Number(v) : v;
  saveDB(d);
}

// ==================================================
// EXPORT app.json
// ==================================================
function exportAppJSON() {
  const d = loadDB();
  const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "app.json";
  a.click();
}