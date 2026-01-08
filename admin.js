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
    price: 0,
    image: null,
    endTime: "" // ⏱ contador
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

  $("promoDesc").value = d.promo.description;
  $("promoPrice").value = d.promo.price;
  $("promoEnd").value = d.promo.endTime || "";

  renderPromoStatus();
}

// ==================================================
// STORE
// ==================================================
function saveStore() {
  const d = loadDB();
  d.store.name = $("storeName").value.trim();
  d.store.phone = $("storePhone").value.replace(/\D/g, "");
  saveDB(d);
  alert("Dados da loja salvos");
}

function saveHours() {
  const d = loadDB();
  d.store.open = $("openTime").value;
  d.store.close = $("closeTime").value;
  saveDB(d);
  alert("Horário salvo");
}

// ==================================================
// PROMOÇÃO (COM IMAGEM + CONTADOR)
// ==================================================
function savePromo() {
  const d = loadDB();

  d.promo.description = $("promoDesc").value.trim();
  d.promo.price = Number($("promoPrice").value) || 0;
  d.promo.endTime = $("promoEnd").value || "";

  const file = $("promoImage").files[0];

  if (file) {
    const r = new FileReader();
    r.onload = () => {
      d.promo.image = r.result;
      saveDB(d);
      renderPromoStatus();
      alert("Promoção salva");
    };
    r.readAsDataURL(file);
  } else {
    saveDB(d);
    renderPromoStatus();
    alert("Promoção salva");
  }
}

function togglePromo() {
  const d = loadDB();
  d.promo.active = !d.promo.active;
  saveDB(d);
  renderPromoStatus();
}

function renderPromoStatus() {
  const d = loadDB();
  $("promoStatus").textContent = d.promo.active ? "ATIVA" : "PAUSADA";
}