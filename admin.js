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
  store: { name: "", phone: "" },
  promoWeek: {
    0: { active:false, title:"", price:0, image:null }, // Domingo
    1: { active:false, title:"", price:0, image:null }, // Segunda
    2: { active:false, title:"", price:0, image:null },
    3: { active:false, title:"", price:0, image:null },
    4: { active:false, title:"", price:0, image:null },
    5: { active:false, title:"", price:0, image:null }, // Sexta
    6: { active:false, title:"", price:0, image:null }  // Sábado
  }
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
  renderPromoWeek();
}

// ==================================================
// PROMOÇÃO POR DIA
// ==================================================
function renderPromoWeek() {
  const d = loadDB();
  const days = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

  $("promoWeek").innerHTML = days.map((day,i)=>{
    const p = d.promoWeek[i];
    return `
      <div class="admin-card">
        <h3>${day}</h3>

        <label>
          <input type="checkbox" ${p.active?"checked":""}
            onchange="togglePromoDay(${i},this.checked)">
          Promo ativa
        </label>

        <input placeholder="Descrição"
          value="${p.title}"
          onchange="updatePromoDay(${i},'title',this.value)">

        <input type="number" placeholder="Preço"
          value="${p.price}"
          onchange="updatePromoDay(${i},'price',this.value)">

        <input type="file" accept="image/*"
          onchange="updatePromoImage(${i},this.files[0])">
      </div>
    `;
  }).join("");
}

function togglePromoDay(day, val) {
  const d = loadDB();
  d.promoWeek[day].active = val;
  saveDB(d);
}

function updatePromoDay(day, field, val) {
  const d = loadDB();
  d.promoWeek[day][field] = field === "price" ? Number(val) : val;
  saveDB(d);
}

function updatePromoImage(day, file) {
  if (!file) return;
  const d = loadDB();
  const r = new FileReader();
  r.onload = () => {
    d.promoWeek[day].image = r.result;
    saveDB(d);
  };
  r.readAsDataURL(file);
}