/* ==================================================
   CONFIG
================================================== */
const KEY = "pizzaria-data";

const DEFAULT_DATA = {
  store: { name: "", phone: "" },
  categories: [],
  products: [],
  extras: [],
  borders: [],
  promo: null,
  theme: "auto"
};

/* ==================================================
   STORAGE
================================================== */
function loadDB() {
  let raw = {};
  try {
    raw = JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {}

  return {
    ...DEFAULT_DATA,
    ...raw,
    store: { ...DEFAULT_DATA.store, ...(raw.store || {}) },
    categories: Array.isArray(raw.categories) ? raw.categories : [],
    products: Array.isArray(raw.products) ? raw.products : [],
    extras: Array.isArray(raw.extras) ? raw.extras : [],
    borders: Array.isArray(raw.borders) ? raw.borders : [],
    promo: raw.promo || null
  };
}

function saveDB(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

/* ==================================================
   DOM
================================================== */
const $ = id => document.getElementById(id);

let loginDiv, adminDiv;
let storeName, storePhone;
let catName, catList, prodCat;
let prodName, prodDesc, prodPrice, prodImage, prodBest, prodFlavors, productList;
let extraName, extraPrice, extraList;
let borderName, borderPrice, borderList;
let promoDesc, promoPrice, promoImage;

document.addEventListener("DOMContentLoaded", () => {
  loginDiv = $("login");
  adminDiv = $("admin");

  storeName  = $("storeName");
  storePhone = $("storePhone");

  catName = $("catName");
  catList = $("catList");
  prodCat = $("prodCat");

  prodName    = $("prodName");
  prodDesc    = $("prodDesc");
  prodPrice   = $("prodPrice");
  prodImage   = $("prodImage");
  prodBest    = $("prodBest");
  prodFlavors = $("prodFlavors");
  productList = $("productList");

  extraName  = $("extraName");
  extraPrice = $("extraPrice");
  extraList  = $("extraList");

  borderName  = $("borderName");
  borderPrice = $("borderPrice");
  borderList  = $("borderList");

  promoDesc  = $("promoDesc");
  promoPrice = $("promoPrice");
  promoImage = $("promoImage");
});

/* ==================================================
   LOGIN
================================================== */
function login() {
  loginDiv.classList.add("hidden");
  adminDiv.classList.remove("hidden");
  loadAdmin();
}

function logout() {
  location.reload();
}

/* ==================================================
   LOAD
================================================== */
function loadAdmin() {
  const d = loadDB();
  storeName.value = d.store.name || "";
  storePhone.value = d.store.phone || "";
  renderCategories();
  renderProducts();
  renderExtras();
  renderBorders();
}

/* ==================================================
   STORE
================================================== */
function saveStore() {
  const d = loadDB();
  d.store.name = storeName.value.trim();
  d.store.phone = storePhone.value.trim();
  saveDB(d);
  alert("Loja salva");
}

/* ==================================================
   CATEGORIAS
================================================== */
function addCategory() {
  if (!catName.value.trim()) return;

  const d = loadDB();
  d.categories.push(catName.value.trim());
  saveDB(d);
  catName.value = "";
  renderCategories();
}

function renderCategories() {
  const d = loadDB();
  catList.innerHTML = "";
  prodCat.innerHTML = "";

  d.categories.forEach(cat => {
    catList.innerHTML += `<p>${cat}</p>`;
    prodCat.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

/* ==================================================
   PRODUTOS
================================================== */
function addProduct() {
  if (!prodImage.files[0]) return;

  const d = loadDB();
  const reader = new FileReader();

  reader.onload = () => {
    d.products.push({
      id: Date.now(),
      name: prodName.value,
      desc: prodDesc.value,
      price: Number(prodPrice.value),
      category: prodCat.value,
      image: reader.result,
      best: prodBest.checked,
      maxFlavors: Number(prodFlavors.value) || 2
    });

    saveDB(d);
    renderProducts();
  };

  reader.readAsDataURL(prodImage.files[0]);
}

function renderProducts() {
  const d = loadDB();
  productList.innerHTML = "";
  d.products.forEach(p => {
    productList.innerHTML += `<p>${p.name} — R$ ${p.price}</p>`;
  });
}

/* ==================================================
   EXTRAS
================================================== */
function addExtra() {
  const d = loadDB();
  d.extras.push({
    id: Date.now(),
    name: extraName.value,
    price: Number(extraPrice.value),
    active: true
  });
  saveDB(d);
  renderExtras();
}

function renderExtras() {
  const d = loadDB();
  extraList.innerHTML = "";
  d.extras.forEach(e => {
    extraList.innerHTML += `<p>${e.name} — R$ ${e.price}</p>`;
  });
}

/* ==================================================
   BORDAS
================================================== */
function addBorder() {
  const d = loadDB();
  d.borders.push({
    id: Date.now(),
    name: borderName.value,
    price: Number(borderPrice.value),
    active: true
  });
  saveDB(d);
  renderBorders();
}

function renderBorders() {
  const d = loadDB();
  borderList.innerHTML = "";
  d.borders.forEach(b => {
    borderList.innerHTML += `<p>${b.name} — R$ ${b.price}</p>`;
  });
}

/* ==================================================
   PROMO
================================================== */
function savePromo() {
  if (!promoImage.files[0]) return;

  const d = loadDB();
  const reader = new FileReader();

  reader.onload = () => {
    d.promo = {
      active: true,
      description: promoDesc.value,
      price: Number(promoPrice.value),
      image: reader.result
    };
    saveDB(d);
    alert("Promo salva");
  };

  reader.readAsDataURL(promoImage.files[0]);
}