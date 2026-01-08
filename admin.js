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
  if($("loginUser").value!==ADMIN_USER||$("loginPass").value!==ADMIN_PASS)
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
function saveDB(d){ localStorage.setItem(KEY, JSON.stringify(d)); }

// ==================================================
// INIT
// ==================================================
function loadAdmin(){
  const d=loadDB();
  $("storeName").value=d.store.name;
  $("storePhone").value=d.store.phone;
  $("openTime").value=d.store.open;
  $("closeTime").value=d.store.close;
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
  const d=loadDB();
  d.store.name=$("storeName").value.trim();
  d.store.phone=$("storePhone").value.replace(/\D/g,"");
  saveDB(d);
  alert("Dados da loja salvos");
}
function saveHours(){
  const d=loadDB();
  d.store.open=$("openTime").value;
  d.store.close=$("closeTime").value;
  saveDB(d);
  alert("Horário salvo");
}

// ==================================================
// CATEGORIES
// ==================================================
function addCategory(){
  const d=loadDB();
  const name=$("catName").value.trim();
  if(!name) return;
  d.categories.push(name);
  $("catName").value="";
  saveDB(d);
  renderCategories();
}
function renderCategories(){
  const d=loadDB();
  $("catList").innerHTML=d.categories.map((c,i)=>`
    <div>${c} <button onclick="deleteCategory(${i})">🗑</button></div>
  `).join("");
  $("prodCat").innerHTML=`<option value="">Selecione</option>`+
    d.categories.map(c=>`<option>${c}</option>`).join("");
}
function deleteCategory(i){
  const d=loadDB();
  const removed=d.categories[i];
  d.categories.splice(i,1);
  d.products=d.products.filter(p=>p.category!==removed);
  saveDB(d);
  renderCategories();
  renderProducts();
}

// ==================================================
// PRODUCTS
// ==================================================
function addProduct(){
  const d=loadDB();
  const prices={
    P:Number($("priceP").value)||null,
    M:Number($("priceM").value)||null,
    G:Number($("priceG").value)||null
  };
  if(!prices.P&&!prices.M&&!prices.G)
    return alert("Informe ao menos um preço");

  const product={
    id:Date.now(),
    name:$("prodName").value,
    desc:$("prodDesc").value,
    category:$("prodCat").value,
    maxFlavors:Number($("prodFlavors").value)||2,
    prices,
    image:null,
    active:true
  };

  const file=$("prodImage").files[0];
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
  const d=loadDB();
  $("productList").innerHTML=d.products.map(p=>`
    <div>${p.name}
      <button onclick="toggleProduct(${p.id})">${p.active?"⏸":"▶️"}</button>
    </div>
  `).join("");
}
function toggleProduct(id){
  const d=loadDB();
  const p=d.products.find(x=>x.id===id);
  p.active=!p.active;
  saveDB(d);
  renderProducts();
}

// ==================================================
// EXTRAS
// ==================================================
function addExtra(){
  const d=loadDB();
  d.extras.push({id:Date.now(),name:$("extraName").value,price:Number($("extraPrice").value),active:true});
  saveDB(d);
  renderExtras();
}
function renderExtras(){
  const d=loadDB();
  $("extraList").innerHTML=d.extras.map(e=>`<div>${e.name}</div>`).join("");
}

// ==================================================
// BORDERS
// ==================================================
function addBorder(){
  const d=loadDB();
  d.borders.push({id:Date.now(),name:$("borderName").value,price:Number($("borderPrice").value),active:true});
  saveDB(d);
  renderBorders();
}
function renderBorders(){
  const d=loadDB();
  $("borderList").innerHTML=d.borders.map(b=>`<div>${b.name}</div>`).join("");
}

// ==================================================
// PROMO POR DIA
// ==================================================
function renderPromoWeek(){
  const d=loadDB();
  const days=["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
  $("promoWeek").innerHTML=days.map((day,i)=>`
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
  const d=loadDB(); d.promoWeek[i].active=val; saveDB(d);
}
function updatePromoDay(i,f,v){
  const d=loadDB(); d.promoWeek[i][f]=f==="price"?Number(v):v; saveDB(d);
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
}