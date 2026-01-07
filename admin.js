// ================= CONFIG =================
const ADMIN_USER = "admin";
const ADMIN_PASS = "123456";
const KEY = "pizzaria-data";

// ================= HELPER =================
const $ = id => document.getElementById(id);

// ================= LOGIN =================
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

// ================= STORAGE =================
function loadDB() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {
      store: {},
      categories: [],
      products: [],
      extras: [],
      borders: [],
      promo: null
    };
  } catch {
    return {
      store: {},
      categories: [],
      products: [],
      extras: [],
      borders: [],
      promo: null
    };
  }
}

function saveDB(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

// ================= LOAD ADMIN =================
function loadAdmin() {
  const d = loadDB();
  $("storeName").value = d.store?.name || "";
  $("storePhone").value = d.store?.phone || "";
  renderCategories();
  renderProducts();
  renderExtras();
  renderBorders();
}

// ================= STORE =================
function saveStore() {
  const d = loadDB();
  d.store = {
    name: $("storeName").value.trim(),
    phone: $("storePhone").value.replace(/\D/g, "")
  };
  saveDB(d);
  alert("Loja salva");
}

// ================= CATEGORIAS =================
function addCategory() {
  const d = loadDB();
  const name = $("catName").value.trim();
  if (!name) return alert("Digite a categoria");
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

// ================= PRODUTOS =================
function addProduct() {
  const d = loadDB();
  const name = $("prodName").value.trim();
  const cat = $("prodCat").value;

  if (!name || !cat) return alert("Preencha produto e categoria");

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
  $("productList").innerHTML = d.products.map(p =>
    `<p>${p.name} (até ${p.maxFlavors} sabores)</p>`
  ).join("");
}

// ================= EXTRAS =================
function addExtra() {
  const d = loadDB();
  d.extras.push({
    id: Date.now(),
    name: $("extraName").value.trim(),
    price: Number($("extraPrice").value),
    active: true
  });
  saveDB(d);
  renderExtras();
}

function renderExtras() {
  const d = loadDB();
  $("extraList").innerHTML = d.extras.map(e =>
    `<p>${e.name} — R$ ${e.price.toFixed(2)}</p>`
  ).join("");
}

// ================= BORDAS =================
function addBorder() {
  const d = loadDB();
  d.borders.push({
    id: Date.now(),
    name: $("borderName").value.trim(),
    price: Number($("borderPrice").value),
    active: true
  });
  saveDB(d);
  renderBorders();
}

function renderBorders() {
  const d = loadDB();
  $("borderList").innerHTML = d.borders.map(b =>
    `<p>${b.name} — R$ ${b.price.toFixed(2)}</p>`
  ).join("");
}

// ================= PROMO (100% FUNCIONAL) =================
function savePromo() {
  const d = loadDB();
  const desc = $("promoDesc").value.trim();
  const price = Number($("promoPrice").value);
  const img = $("promoImage").files[0];

  if (!desc) return alert("Digite a descrição");
  if (!price || price <= 0) return alert("Digite o preço");

  const save = image => {
    d.promo = {
      active: true,
      description: desc,
      price,
      image
    };
    saveDB(d);
    alert("Promoção salva com sucesso 🔥");
  };

  if (img) {
    const r = new FileReader();
    r.onload = () => save(r.result);
    r.readAsDataURL(img);
  } else {
    save(null);
  }
}