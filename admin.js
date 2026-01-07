// ==================================================
// LOGIN CONFIG
// ==================================================
const ADMIN_USER = "admin";
const ADMIN_PASS = "123456";

const KEY = "pizzaria-data";

// ==================================================
// HELPERS
// ==================================================
const $ = id => document.getElementById(id) || null;

// ==================================================
// DEFAULT DATA
// ==================================================
const DEFAULT_DATA = {
  store: { name: "", phone: "" },
  categories: [],
  products: [],
  extras: [],
  borders: [],
  promo: null
};

// ==================================================
// INIT
// ==================================================
document.addEventListener("DOMContentLoaded", () => {
  const pass = $("loginPass");
  if (pass) {
    pass.addEventListener("keydown", e => {
      if (e.key === "Enter") login();
    });
  }
});

// ==================================================
// LOGIN
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
// STORAGE — CORRIGIDO (PROMO NÃO SOME MAIS)
// ==================================================
function normalizeDB(raw = {}) {
  return {
    store: raw.store || { ...DEFAULT_DATA.store },
    categories: Array.isArray(raw.categories) ? raw.categories : [],
    products: Array.isArray(raw.products) ? raw.products : [],
    extras: Array.isArray(raw.extras) ? raw.extras : [],
    borders: Array.isArray(raw.borders) ? raw.borders : [],
    promo: raw.promo && raw.promo.active ? raw.promo : null
  };
}

function loadDB() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    return normalizeDB(raw);
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function saveDB(data) {
  const current = loadDB();

  // merge seguro — NÃO apaga promo existente
  const merged = {
    ...current,
    ...data,
    promo: data.promo !== undefined ? data.promo : current.promo
  };

  localStorage.setItem(KEY, JSON.stringify(normalizeDB(merged)));
}

// ==================================================
// LOAD ADMIN
// ==================================================
function loadAdmin() {
  const d = loadDB();

  if ($("storeName")) $("storeName").value = d.store.name;
  if ($("storePhone")) $("storePhone").value = d.store.phone;

  renderCategories();
  renderProducts();
  renderExtras();
  renderBorders();
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
// CATEGORIAS
// ==================================================
function addCategory() {
  const name = $("catName").value.trim();
  if (!name) return alert("Digite a categoria");

  const d = loadDB();
  if (!d.categories.includes(name)) d.categories.push(name);
  saveDB(d);

  $("catName").value = "";
  renderCategories();
}

function renderCategories() {
  const d = loadDB();
  $("catList").innerHTML = d.categories.map(c => `<p>${c}</p>`).join("");
  $("prodCat").innerHTML =
    `<option value="">Selecione...</option>` +
    d.categories.map(c => `<option value="${c}">${c}</option>`).join("");
}

// ==================================================
// PRODUTOS
// ==================================================
function addProduct() {
  const name = $("prodName").value.trim();
  const cat = $("prodCat").value.trim();

  if (!name) return alert("Digite o nome do produto");
  if (!cat) return alert("Selecione a categoria");

  const d = loadDB();

  const save = img => {
    d.products.push({
      id: Date.now(),
      name,
      desc: $("prodDesc").value.trim(),
      category: cat,
      image: img,
      maxFlavors: Number($("prodFlavors").value) || 2,
      best: $("prodBest").checked
    });

    saveDB(d);
    renderProducts();
    alert("Produto salvo");
  };

  const file = $("prodImage").files[0];
  if (file) {
    const r = new FileReader();
    r.onload = () => save(r.result);
    r.readAsDataURL(file);
  } else {
    save(null);
  }
}

function renderProducts() {
  const d = loadDB();
  $("productList").innerHTML = d.products.length
    ? d.products.map(p =>
        `<p>${p.name} <small>(até ${p.maxFlavors} sabores)</small></p>`
      ).join("")
    : "<p style='opacity:.6'>Nenhum produto</p>";
}

// ==================================================
// EXTRAS
// ==================================================
function addExtra() {
  const name = $("extraName").value.trim();
  const price = Number($("extraPrice").value);
  if (!name || !price) return alert("Preencha nome e preço");

  const d = loadDB();
  d.extras.push({ id: Date.now(), name, price, active: true });
  saveDB(d);
  renderExtras();
}

function renderExtras() {
  const d = loadDB();
  $("extraList").innerHTML = d.extras.map(e =>
    `<p>${e.name} — R$ ${e.price.toFixed(2)}</p>`
  ).join("");
}

// ==================================================
// BORDAS
// ==================================================
function addBorder() {
  const name = $("borderName").value.trim();
  const price = Number($("borderPrice").value);
  if (!name || !price) return alert("Preencha nome e preço");

  const d = loadDB();
  d.borders.push({ id: Date.now(), name, price, active: true });
  saveDB(d);
  renderBorders();
}

function renderBorders() {
  const d = loadDB();
  $("borderList").innerHTML = d.borders.map(b =>
    `<p>${b.name} — R$ ${b.price.toFixed(2)}</p>`
  ).join("");
}

// ==================================================
// PROMO — AGORA FUNCIONA DEFINITIVO
// ==================================================
function savePromo() {
  const desc = $("promoDesc").value.trim();
  const price = Number($("promoPrice").value);
  const imgEl = $("promoImage");

  if (!desc) return alert("Digite a descrição da promoção");
  if (!isFinite(price) || price <= 0) return alert("Digite um preço válido");

  const d = loadDB();

  const save = img => {
    d.promo = {
      active: true,
      description: desc,
      price,
      image: img || null
    };
    saveDB(d);
    alert("Promoção salva com sucesso 🔥");
    $("promoDesc").value = "";
    $("promoPrice").value = "";
    if (imgEl) imgEl.value = "";
  };

  const file = imgEl?.files?.[0];
  if (file) {
    const r = new FileReader();
    r.onload = () => save(r.result);
    r.readAsDataURL(file);
  } else {
    save(null);
  }
}