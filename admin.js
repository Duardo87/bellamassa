// ================= CONFIG =================
const ADMIN_USER = "admin";
const ADMIN_PASS = "123456";
const STORAGE_KEY = "admin-data";
const $ = id => document.getElementById(id);

// ================= DATA =================
const DEFAULT_DATA = {
  store: { name:"", phone:"", open:"", close:"" },
  categories: [],
  products: [],
  extras: [],
  borders: [],
  promoWeek: {}
};

// ================= AUTH =================
function login(){
  if($("loginUser").value!==ADMIN_USER||$("loginPass").value!==ADMIN_PASS)
    return alert("Login inválido");
  $("login").classList.add("hidden");
  $("admin").classList.remove("hidden");
  loadAdmin();
}

// ================= STORAGE =================
function loadDB(){
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(DEFAULT_DATA);
}
function saveDB(d){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

// ================= INIT =================
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

// ================= STORE =================
function saveStore(){
  const d=loadDB();
  d.store={
    name:$("storeName").value,
    phone:$("storePhone").value.replace(/\D/g,""),
    open:$("openTime").value,
    close:$("closeTime").value
  };
  saveDB(d);
  alert("Dados salvos");
}

// ================= UTIL =================
const uid=()=>Date.now()+Math.floor(Math.random()*1000);

// ================= CATEGORIES =================
function addCategory(){
  const d=loadDB();
  d.categories.push({id:uid(),name:$("catName").value,order:d.categories.length+1,active:true});
  $("catName").value="";
  saveDB(d);
  renderCategories();
}
function renderCategories(){
  const d=loadDB();
  $("catList").innerHTML=d.categories.map((c,i)=>`
    <div class="row">
      <input value="${c.name}" onchange="editCategory(${c.id},this.value)">
      <button onclick="toggleCategory(${c.id})">${c.active?"👁":"🚫"}</button>
      <button onclick="moveCategory(${i},-1)">⬆</button>
      <button onclick="moveCategory(${i},1)">⬇</button>
      <button onclick="deleteCategory(${c.id})">🗑</button>
    </div>
  `).join("");
  $("prodCat").innerHTML=d.categories.map(c=>`<option value="${c.id}">${c.name}</option>`).join("");
}
function editCategory(id,v){const d=loadDB();d.categories.find(c=>c.id===id).name=v;saveDB(d);}
function toggleCategory(id){const d=loadDB();const c=d.categories.find(x=>x.id===id);c.active=!c.active;saveDB(d);renderCategories();}
function moveCategory(i,dn){const d=loadDB();const a=d.categories;if(!a[i+dn])return;[a[i].order,a[i+dn].order]=[a[i+dn].order,a[i].order];saveDB(d);renderCategories();}
function deleteCategory(id){const d=loadDB();d.categories=d.categories.filter(c=>c.id!==id);d.products=d.products.filter(p=>p.categoryId!==id);saveDB(d);renderCategories();renderProducts();}

// ================= PRODUCTS =================
function addProduct(){
  const d=loadDB();
  d.products.push({
    id:uid(),
    categoryId:Number($("prodCat").value),
    name:$("prodName").value,
    desc:$("prodDesc").value,
    prices:{P:+$("priceP").value||null,M:+$("priceM").value||null,G:+$("priceG").value||null},
    maxFlavors:+$("prodFlavors").value||2,
    image:null,
    order:d.products.length+1,
    active:true
  });
  saveDB(d);
  renderProducts();
}
function renderProducts(){
  const d=loadDB();
  $("productList").innerHTML=d.products.map((p,i)=>`
    <div class="row">
      <input value="${p.name}" onchange="editProduct(${p.id},'name',this.value)">
      <button onclick="toggleProduct(${p.id})">${p.active?"👁":"🚫"}</button>
      <button onclick="moveProduct(${i},-1)">⬆</button>
      <button onclick="moveProduct(${i},1)">⬇</button>
      <button onclick="deleteProduct(${p.id})">🗑</button>
    </div>
  `).join("");
}
function editProduct(id,f,v){const d=loadDB();d.products.find(p=>p.id===id)[f]=v;saveDB(d);}
function toggleProduct(id){const d=loadDB();const p=d.products.find(x=>x.id===id);p.active=!p.active;saveDB(d);renderProducts();}
function moveProduct(i,dn){const d=loadDB();const a=d.products;if(!a[i+dn])return;[a[i].order,a[i+dn].order]=[a[i+dn].order,a[i].order];saveDB(d);renderProducts();}
function deleteProduct(id){const d=loadDB();d.products=d.products.filter(p=>p.id!==id);saveDB(d);renderProducts();}

// ================= EXTRAS =================
function addExtra(){const d=loadDB();d.extras.push({id:uid(),name:extraName.value,price:+extraPrice.value,order:d.extras.length+1,active:true});saveDB(d);renderExtras();}
function renderExtras(){const d=loadDB();extraList.innerHTML=d.extras.map((e,i)=>`
  <div class="row">
    <input value="${e.name}">
    <input type="number" value="${e.price}">
    <button onclick="deleteExtra(${e.id})">🗑</button>
  </div>`).join("");}
function deleteExtra(id){const d=loadDB();d.extras=d.extras.filter(e=>e.id!==id);saveDB(d);renderExtras();}

// ================= BORDERS =================
function addBorder(){const d=loadDB();d.borders.push({id:uid(),name:borderName.value,price:+borderPrice.value,order:d.borders.length+1,active:true});saveDB(d);renderBorders();}
function renderBorders(){const d=loadDB();borderList.innerHTML=d.borders.map((b,i)=>`
  <div class="row">
    <input value="${b.name}">
    <input type="number" value="${b.price}">
    <button onclick="deleteBorder(${b.id})">🗑</button>
  </div>`).join("");}
function deleteBorder(id){const d=loadDB();d.borders=d.borders.filter(b=>b.id!==id);saveDB(d);renderBorders();}

// ================= PROMO =================
function renderPromoWeek(){
  const d=loadDB();
  const days=["Dom","Seg","Ter","Qua","Qui","Sex","Sab"];
  promoWeek.innerHTML=days.map((day,i)=>`
    <div class="row">
      <strong>${day}</strong>
      <input placeholder="Título" value="${d.promoWeek[i]?.title||""}"
        onchange="setPromo(${i},'title',this.value)">
      <input type="number" placeholder="Preço" value="${d.promoWeek[i]?.price||""}"
        onchange="setPromo(${i},'price',this.value)">
      <input type="checkbox" ${d.promoWeek[i]?.active?"checked":""}
        onchange="setPromo(${i},'active',this.checked)">
    </div>
  `).join("");
}
function setPromo(i,f,v){const d=loadDB();d.promoWeek[i]=d.promoWeek[i]||{};d.promoWeek[i][f]=f==="price"?+v:v;saveDB(d);}

// ================= EXPORT =================
function exportAppJSON(){
  const d=loadDB();
  const blob=new Blob([JSON.stringify(d,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="app.json";
  a.click();
}