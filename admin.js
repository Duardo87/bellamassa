// ==================================================
// LOGIN CONFIG
// ==================================================
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

const KEY = "pizzaria-data";

// ==================================================
// DOM
// ==================================================
const $ = id => document.getElementById(id);

let loginDiv, adminDiv;
let inputUser, inputPass;

// ==================================================
// INIT
// ==================================================
document.addEventListener("DOMContentLoaded", () => {
  loginDiv = $("login");
  adminDiv = $("admin");

  inputUser = $("loginUser");
  inputPass = $("loginPass");
});

// ==================================================
// LOGIN
// ==================================================
function login() {
  const user = inputUser?.value.trim();
  const pass = inputPass?.value.trim();

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    loginDiv.classList.add("hidden");
    adminDiv.classList.remove("hidden");
    loadAdmin();
  } else {
    alert("Login inválido");
  }
}

function logout() {
  location.reload();
}

// ==================================================
// STORAGE
// ==================================================
const DEFAULT_DATA = {
  store: { name: "", phone: "" },
  categories: [],
  products: [],
  extras: [],
  borders: [],
  promo: null
};

function loadDB() {
  let raw = {};
  try {
    raw = JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {}

  return {
    ...DEFAULT_DATA,
    ...raw,
    categories: raw.categories || [],
    products: raw.products || [],
    extras: raw.extras || [],
    borders: raw.borders || []
  };
}

function saveDB(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

// ==================================================
// ADMIN LOAD
// ==================================================
function loadAdmin() {
  const d = loadDB();

  $("storeName").value = d.store.name || "";
  $("storePhone").value = d.store.phone || "";

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
  d.store.phone = $("storePhone").value.trim();
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
  d.categories.push(name);
  saveDB(d);
  $("catName").value = "";
  renderCategories();
}

function renderCategories() {
  const d = loadDB();
  const list = $("catList");
  const select = $("prodCat");

  list.innerHTML = "";
  select.innerHTML = "";

  d.categories.forEach(cat => {
    list.innerHTML += `<p>${cat}</p>`;
    select.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

// ==================================================
// PRODUTOS
// ==================================================
function addProduct() {
  const name = $("prodName").value;
  const price = Number($("prodPrice").value);
  const cat = $("prodCat").value;
  const img = $("prodImage").files[0];

  if (!name || !price || !cat || !img) {
    return alert("Preencha todos os campos");
  }

  const reader = new FileReader();
  reader.onload = () => {
    const d = loadDB();
    d.products.push({
      id: Date.now(),
      name,
      desc: $("prodDesc").value,
      price,
      category: cat,
      image: reader.result,
      maxFlavors: Number($("prodFlavors").value) || 2,
      best: $("prodBest").checked
    });

    saveDB(d);
    renderProducts();
    alert("Produto adicionado");
  };

  reader.readAsDataURL(img);
}

function renderProducts() {
  const d = loadDB();
  const list = $("productList");
  list.innerHTML = "";

  d.products.forEach(p => {
    list.innerHTML += `<p>${p.name} — R$ ${p.price.toFixed(2)}</p>`;
  });
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
  $("extraList").innerHTML = d.extras
    .map(e => `<p>${e.name} — R$ ${e.price}</p>`)
    .join("");
}

// ==================================================
// BORDAS
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
  $("borderList").innerHTML = d.borders
    .map(b => `<p>${b.name} — R$ ${b.price}</p>`)
    .join("");
}