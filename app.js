const STORAGE_KEY="pizzaria-data";
const WHATS_PHONE="5562993343622";

let data=null;
let cart=[];

function loadData(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{};}
  catch{return{};}
}

function renderPublic(){
  data=loadData();
  renderHeader();
  renderCategories();
  showPromoOfDay();
}
window.app={renderPublic};

// HEADER
function renderHeader(){
  document.getElementById("store-name").textContent=data.store?.name||"Delivery";
  if(data.store?.phone)
    document.getElementById("store-phone").href=`https://wa.me/${data.store.phone}`;
}

// PROMO DO DIA
function showPromoOfDay(){
  if(!data.promoWeek) return;
  const promo=data.promoWeek[new Date().getDay()];
  if(!promo||!promo.active) return;

  openModal(`
    <div class="promo-top">🔥 Promoção de Hoje</div>
    ${promo.image?`<img src="${promo.image}" style="width:100%;border-radius:10px">`:""}
    <h3>${promo.title}</h3>
    <strong>R$ ${Number(promo.price||0).toFixed(2)}</strong>
    <button class="btn btn-green" onclick="addPromo('${promo.title}',${promo.price})">Adicionar</button>
    <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
  `);
}
function addPromo(name,price){
  cart.push({name,price});
  closeModal();
  renderCart();
}

// CATEGORIES
function renderCategories(){
  const nav=document.getElementById("categories");
  nav.innerHTML="";
  (data.categories||[]).forEach((c,i)=>{
    nav.innerHTML+=`<button class="${i===0?"active":""}" data-cat="${c}">${c}</button>`;
  });
  if(data.categories?.length) renderProducts(data.categories[0]);
}
document.addEventListener("click",e=>{
  if(e.target.dataset.cat){
    document.querySelectorAll(".categories button").forEach(b=>b.classList.remove("active"));
    e.target.classList.add("active");
    renderProducts(e.target.dataset.cat);
  }
});

// PRODUCTS
function renderProducts(cat){
  const grid=document.getElementById("products");
  grid.innerHTML="";
  (data.products||[]).filter(p=>p.category===cat&&p.active!==false).forEach(p=>{
    grid.innerHTML+=`
      <div class="product-card">
        ${p.image?`<img src="${p.image}">`:""}
        <h3>${p.name}</h3>
        <p>${p.desc||""}</p>
        <button class="btn btn-green" onclick="startOrder(${p.id})">Adicionar</button>
      </div>`;
  });
}

// ORDER FLOW
let currentProduct,selectedFlavors,selectedSize,selectedBorder,selectedExtras;

function startOrder(id){
  currentProduct=data.products.find(p=>p.id===id);
  selectedFlavors=[];
  selectedSize=null;
  selectedBorder=null;
  selectedExtras=[];
  renderFlavors();
}

function renderFlavors(){
  openModal(`
    <h3>🍕 Escolha sabores (máx ${currentProduct.maxFlavors})</h3>
    ${data.products.filter(p=>p.category===currentProduct.category&&p.active!==false)
      .map(p=>`<label><input type="checkbox" value="${p.name}"> ${p.name}</label>`).join("")}
    <button class="btn btn-green" onclick="confirmFlavors()">Continuar</button>
  `);
}
function confirmFlavors(){
  selectedFlavors=[...document.querySelectorAll(".promo-card input:checked")].map(i=>i.value);
  if(!selectedFlavors.length||selectedFlavors.length>currentProduct.maxFlavors)
    return alert(`Escolha até ${currentProduct.maxFlavors} sabores`);
  renderSizes();
}

function renderSizes(){
  const pr=currentProduct.prices||{};
  openModal(`
    <button class="btn btn-ghost" onclick="renderFlavors()">⬅ Voltar</button>
    <h3>Tamanho</h3>
    ${pr.P?`<button class="btn btn-green" onclick="confirmSize('P',${pr.P})">Pequena R$${pr.P}</button>`:""}
    ${pr.M?`<button class="btn btn-green" onclick="confirmSize('M',${pr.M})">Média R$${pr.M}</button>`:""}
    ${pr.G?`<button class="btn btn-green" onclick="confirmSize('G',${pr.G})">Grande R$${pr.G}</button>`:""}
  `);
}
function confirmSize(l,p){ selectedSize={l,p}; renderBorders(); }

function renderBorders(){
  openModal(`
    <button class="btn btn-ghost" onclick="renderSizes()">⬅ Voltar</button>
    <h3>Borda</h3>
    <button class="btn btn-ghost" onclick="selectBorder(null)">Sem borda</button>
    ${(data.borders||[]).map(b=>`<button class="btn btn-green" onclick="selectBorder(${b.id})">${b.name} + R$${b.price}</button>`).join("")}
  `);
}
function selectBorder(id){ selectedBorder=id; renderExtras(); }

function renderExtras(){
  openModal(`
    <button class="btn btn-ghost" onclick="renderBorders()">⬅ Voltar</button>
    <h3>Adicionais</h3>
    ${(data.extras||[]).map(e=>`<label><input type="checkbox" value="${e.id}"> ${e.name} + R$${e.price}</label>`).join("")}
    <button class="btn btn-green" onclick="finishOrder()">Adicionar</button>
  `);
}

function finishOrder(){
  selectedExtras=[...document.querySelectorAll(".promo-card input:checked")]
    .map(i=>data.extras.find(e=>e.id==i.value));
  let total=selectedSize.p;
  if(selectedBorder){
    const b=data.borders.find(x=>x.id===selectedBorder);
    if(b) total+=b.price;
  }
  selectedExtras.forEach(e=>total+=e.price);
  cart.push({name:`${currentProduct.name} (${selectedFlavors.join("/")})`,price:total});
  closeModal();
  renderCart();
}

// CART
function renderCart(){
  const c=document.getElementById("cart");
  let t=0;
  c.innerHTML="<h3>Pedido</h3>";
  cart.forEach((i,idx)=>{
    t+=i.price;
    c.innerHTML+=`<p>${i.name} - R$${i.price}<button onclick="cart.splice(${idx},1);renderCart()">❌</button></p>`;
  });
  c.innerHTML+=`<strong>Total R$ ${t}</strong>
    <button class="btn btn-green" onclick="sendWhats()">Enviar WhatsApp</button>`;
}
function sendWhats(){
  let msg="Pedido:\n";
  cart.forEach(i=>msg+=`- ${i.name}\n`);
  window.open(`https://wa.me/${WHATS_PHONE}?text=${encodeURIComponent(msg)}`);
}

// MODAL
function openModal(html){
  closeModal();
  const d=document.createElement("div");
  d.className="promo-overlay";
  d.innerHTML=`<div class="promo-card">${html}</div>`;
  document.body.appendChild(d);
}
function closeModal(){
  document.querySelectorAll(".promo-overlay").forEach(m=>m.remove());
}