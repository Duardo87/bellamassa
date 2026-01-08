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
  promoWeek: {
    0:{active:false,title:"",price:0,image:null},
    1:{active:false,title:"",price:0,image:null},
    2:{active:false,title:"",price:0,image:null},
    3:{active:false,title:"",price:0,image:null},
    4:{active:false,title:"",price:0,image:null},
    5:{active:false,title:"",price:0,image:null},
    6:{active:false,title:"",price:0,image:null}
  }
};

// ==================================================
// AUTH
// ==================================================
function login(){
  if($("loginUser").value!==ADMIN_USER || $("loginPass").value!==ADMIN_PASS)
    return alert("Login inválido");
  $("login").classList.add("hidden");
  $("admin").classList.remove("hidden");
  loadAdmin();
}
function logout(){ location.reload(); }

// ==================================================
// STORAGE
// ==================================================
function loadDB(){
  try{
    return { ...DEFAULT_DATA, ...JSON.parse(localStorage.getItem(KEY)) };
  }catch{
    return structuredClone(DEFAULT_DATA);
  }
}
function saveDB(d){
  localStorage.setItem(KEY, JSON.stringify(d));
}

// ==================================================
// INIT
// ==================================================
function loadAdmin(){
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
function saveStore(){
  const d = loadDB();
  d.store.name = $("storeName").value.trim();
  d.store.phone = $("storePhone").value.replace(/\D/g,"");
  saveDB(d);
  alert("Dados da loja salvos");
}
function saveHours(){
  const d = loadDB();
  d.store.open = $("openTime").value;
  d.store.close = $("closeTime").value;
  saveDB(d);
  alert("Horário salvo");
}

// ==================================================
// CATEGORIES (EDITAR + MOVER)
// ==================================================
function addCategory(){
  const d = loadDB();
  const name = $("catName").value.trim();
  if(!name) return;
  d.categories.push(name);
  $("catName").value="";
  saveDB(d);
  renderCategories();
}

function renderCategories(){
  const d = loadDB();
  $("catList").innerHTML = d.categories.map((c,i)=>`
    <div class="row">
      <input value="${c}" onchange="editCategory(${i},this.value)">
      <button onclick="moveCategory(${i},-1)">⬆️</button>
      <button onclick="moveCategory(${i},1)">⬇️</button>
      <button onclick="deleteCategory(${i})">🗑</button>
    </div>
  `).join("");

  $("prodCat").innerHTML =
    `<option value="">Selecione</option>` +
    d.categories.map(c=>`<option>${c}</option>`).join("");
}

function editCategory(i,val){
  const d = loadDB();
  const old = d.categories[i];
  d.categories[i] = val.trim();
  d.products.forEach(p=>{
    if(p.category === old) p.category = val.trim();
  });
  saveDB(d);
}

function moveCategory(i,dir){
  const d = loadDB();
  const j = i + dir;
  if(j<0 || j>=d.categories.length) return;
  [d.categories[i], d.categories[j]] = [d.categories[j], d.categories[i]];
  saveDB(d);
  renderCategories();
}

function deleteCategory(i){
  const d = loadDB();
  const removed = d.categories[i];
  d.categories.splice(i,1);
  d.products = d.products.filter(p=>p.category!==removed);
  saveDB(d);
  renderCategories();
  renderProducts();
}

// ==================================================
// PRODUCTS (EDITAR + MOVER)
// ==================================================
function addProduct(){
  const d = loadDB();
  const prices = {
    P:Number($("priceP").value)||null,
    M:Number($("priceM").value)||null,
    G:Number($("priceG").value)||null
  };
  if(!prices.P && !prices.M && !prices.G)
    return alert("Informe ao menos um preço");

  const product = {
    id:Date.now(),
    name:$("prodName").value,
    desc:$("prodDesc").value,
    category:$("prodCat").value,
    maxFlavors:Number($("prodFlavors").value)||2,
    prices,
    image:null,
    active:true
  };

  const file = $("prodImage").files[0];
  if(file){
    const r=new FileReader();
    r.onload=()=>{
      product.image=r.result;
      d.products.push(product);
      saveDB(d);
      renderProducts();
    };
    r.readAsDataURL(file);
  }else{
    d.products.push(product);
    saveDB(d);
    renderProducts();
  }

  $("prodName").value="";
  $("prodDesc").value="";
  $("prodFlavors").value="";
  $("priceP").value="";
  $("priceM").value="";
  $("priceG").value="";
  $("prodImage").value="";
}

function renderProducts(){
  const d = loadDB();
  $("productList").innerHTML = d.products.map((p,i)=>`
    <div class="row">
      <input value="${p.name}" onchange="editProduct(${p.id},'name',this.value)">
      <button onclick="toggleProduct(${p.id})">${p.active?"⏸":"▶️"}</button>
      <button onclick="moveProduct(${i},-1)">⬆️</button>
      <button onclick="moveProduct(${i},1)">⬇️</button>
      <button onclick="deleteProduct(${p.id})">🗑</button>
    </div>
  `).join("");
}

function editProduct(id,field,val){
  const d = loadDB();
  const p = d.products.find(x=>x.id===id);
  if(!p) return;
  p[field]=val;
  saveDB(d);
}

function moveProduct(i,dir){
  const d = loadDB();
  const j = i + dir;
  if(j<0 || j>=d.products.length) return;
  [d.products[i], d.products[j]] = [d.products[j], d.products[i]];
  saveDB(d);
  renderProducts();
}

function deleteProduct(id){
  const d = loadDB();
  d.products = d.products.filter(p=>p.id!==id);
  saveDB(d);
  renderProducts();
}

function toggleProduct(id){
  const d = loadDB();
  const p = d.products.find(x=>x.id===id);
  p.active = !p.active;
  saveDB(d);
  renderProducts();
}

// ==================================================
// EXTRAS (EDITAR + MOVER)
// ==================================================
function addExtra(){
  const d = loadDB();
  d.extras.push({
    id:Date.now(),
    name:$("extraName").value,
    price:Number($("extraPrice").value),
    active:true
  });
  $("extraName").value="";
  $("extraPrice").value="";
  saveDB(d);
  renderExtras();
}

function renderExtras(){
  const d = loadDB();
  $("extraList").innerHTML = d.extras.map((e,i)=>`
    <div class="row">
      <input value="${e.name}" onchange="editExtra(${e.id},'name',this.value)">
      <input type="number" value="${e.price}" onchange="editExtra(${e.id},'price',this.value)">
      <button onclick="moveExtra(${i},-1)">⬆️</button>
      <button onclick="moveExtra(${i},1)">⬇️</button>
      <button onclick="deleteExtra(${e.id})">🗑</button>
    </div>
  `).join("");
}

function editExtra(id,field,val){
  const d = loadDB();
  const e = d.extras.find(x=>x.id===id);
  if(!e) return;
  e[field]=field==="price"?Number(val):val;
  saveDB(d);
}

function moveExtra(i,dir){
  const d = loadDB();
  const j = i + dir;
  if(j<0 || j>=d.extras.length) return;
  [d.extras[i], d.extras[j]] = [d.extras[j], d.extras[i]];
  saveDB(d);
  renderExtras();
}

function deleteExtra(id){
  const d = loadDB();
  d.extras = d.extras.filter(e=>e.id!==id);
  saveDB(d);
  renderExtras();
}

// ==================================================
// BORDERS (EDITAR + MOVER)
// ==================================================
function addBorder(){
  const d = loadDB();
  d.borders.push({
    id:Date.now(),
    name:$("borderName").value,
    price:Number($("borderPrice").value),
    active:true
  });
  $("borderName").value="";
  $("borderPrice").value="";
  saveDB(d);
  renderBorders();
}

function renderBorders(){
  const d = loadDB();
  $("borderList").innerHTML = d.borders.map((b,i)=>`
    <div class="row">
      <input value="${b.name}" onchange="editBorder(${b.id},'name',this.value)">
      <input type="number" value="${b.price}" onchange="editBorder(${b.id},'price',this.value)">
      <button onclick="moveBorder(${i},-1)">⬆️</button>
      <button onclick="moveBorder(${i},1)">⬇️</button>
      <button onclick="deleteBorder(${b.id})">🗑</button>
    </div>
  `).join("");
}

function editBorder(id,field,val){
  const d = loadDB();
  const b = d.borders.find(x=>x.id===id);
  if(!b) return;
  b[field]=field==="price"?Number(val):val;
  saveDB(d);
}

function moveBorder(i,dir){
  const d = loadDB();
  const j = i + dir;
  if(j<0 || j>=d.borders.length) return;
  [d.borders[i], d.borders[j]] = [d.borders[j], d.borders[i]];
  saveDB(d);
  renderBorders();
}

function deleteBorder(id){
  const d = loadDB();
  d.borders = d.borders.filter(b=>b.id!==id);
  saveDB(d);
  renderBorders();
}

// ==================================================
// PROMO POR DIA DA SEMANA
// ==================================================
function renderPromoWeek(){
  const d = loadDB();
  const days=["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
  $("promoWeek").innerHTML = days.map((day,i)=>`
    <div class="admin-card">
      <h3>${day}</h3>
      <label>
        <input type="checkbox" ${d.promoWeek[i].active?"checked":""}
          onchange="togglePromoDay(${i},this.checked)"> Ativa
      </label>
      <input value="${d.promoWeek[i].title}"
        onchange="updatePromoDay(${i},'title',this.value)" placeholder="Descrição">
      <input type="number" value="${d.promoWeek[i].price}"
        onchange="updatePromoDay(${i},'price',this.value)" placeholder="Preço">
      <input type="file" onchange="updatePromoImage(${i},this.files[0])">
    </div>
  `).join("");
}

function togglePromoDay(i,val){
  const d = loadDB();
  d.promoWeek[i].active = val;
  saveDB(d);
}

function updatePromoDay(i,field,val){
  const d = loadDB();
  d.promoWeek[i][field] = field==="price"?Number(val):val;
  saveDB(d);
}

function updatePromoImage(i,file){
  if(!file) return;
  const r=new FileReader();
  r.onload=()=>{
    const d=loadDB();
    d.promoWeek[i].image=r.result;
    saveDB(d);
  };
  r.readAsDataURL(file);
}// ==================================================
// EXPORTAR app.json
// ==================================================
function exportAppJSON() {
  const d = loadDB();

  const categories = d.categories.map((name, i) => ({
    id: i + 1,
    name,
    order: i + 1,
    active: true
  }));

  const products = d.products.map((p, i) => ({
    id: p.id,
    categoryId: categories.find(c => c.name === p.category)?.id,
    name: p.name,
    desc: p.desc,
    prices: p.prices,
    maxFlavors: p.maxFlavors,
    image: p.image || "",
    order: i + 1,
    active: p.active
  }));

  const extras = d.extras.map((e, i) => ({
    id: e.id,
    name: e.name,
    price: e.price,
    order: i + 1,
    active: e.active
  }));

  const borders = d.borders.map((b, i) => ({
    id: b.id,
    name: b.name,
    price: b.price,
    order: i + 1,
    active: b.active
  }));

  const appData = {
    store: d.store,
    categories,
    products,
    extras,
    borders,
    promoWeek: d.promoWeek
  };

  const blob = new Blob(
    [JSON.stringify(appData, null, 2)],
    { type: "application/json" }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "app.json";
  a.click();
}