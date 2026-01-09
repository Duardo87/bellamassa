let data=null, cart=[], currentProduct=null;
let step=1, selection={size:null,flavors:[],border:null,extras:[]};
const $=id=>document.getElementById(id);

async function loadData(){
  const res=await fetch("./app.json?v="+Date.now());
  return res.json();
}

document.addEventListener("DOMContentLoaded",async()=>{
  data=await loadData();
  $("storeName").textContent=data.store.name;
  $("storePhone").href=`https://wa.me/${data.store.phone}`;
  $("whatsFloat").href=`https://wa.me/${data.store.phone}`;
  $("btnCart").onclick=()=>toggleCart();
  renderCategories();
});

function renderCategories(){
  const cats=data.categories.filter(c=>c.active).sort((a,b)=>a.order-b.order);
  $("categories").innerHTML="";
  cats.forEach((c,i)=>{
    $("categories").innerHTML+=
      `<button class="${i===0?'active':''}" onclick="renderProducts(${c.id},this)">${c.name}</button>`;
  });
  if(cats.length) renderProducts(cats[0].id);
}

function renderProducts(catId,btn){
  document.querySelectorAll(".categories button").forEach(b=>b.classList.remove("active"));
  if(btn) btn.classList.add("active");
  $("products").innerHTML="";
  data.products.filter(p=>p.active && p.categoryId===catId).forEach(p=>{
    $("products").innerHTML+=`
      <div class="product-card">
        <h3>${p.name}</h3>
        <p>${p.desc||""}</p>
        <button onclick="startOrder(${p.id})">Escolher</button>
      </div>`;
  });
}

/* ===== WIZARD ===== */
function startOrder(id){
  currentProduct=data.products.find(p=>p.id===id);
  step=1;
  selection={size:null,flavors:[],border:null,extras:[]};
  $("modal").classList.remove("hidden");
  renderStep();
}

$("prevStep").onclick=()=>{ if(step>1){ step--; renderStep(); }};
$("nextStep").onclick=()=>nextStep();

function renderStep(){
  if(step===1) stepSize();
  if(step===2) stepFlavors();
  if(step===3) stepBorder();
  if(step===4) stepExtras();
}

function stepSize(){
  $("stepTitle").innerHTML="📏 Tamanho";
  let html="";
  Object.entries(currentProduct.prices).forEach(([k,v])=>{
    html+=`<label><input type="radio" name="size" value="${k}" data-price="${v}"> ${k} - R$ ${v}</label><br>`;
  });
  $("stepContent").innerHTML=html;
}

function stepFlavors(){
  if(!currentProduct.maxFlavors || currentProduct.maxFlavors===1){
    step++; renderStep(); return;
  }
  $("stepTitle").innerHTML=`🍕 Escolha até ${currentProduct.maxFlavors} sabores`;
  let html="";
  data.products.filter(p=>p.categoryId===currentProduct.categoryId && p.prices)
    .forEach(p=>{
      html+=`<label><input type="checkbox" value="${p.name}" data-prices='${JSON.stringify(p.prices)}'> ${p.name}</label><br>`;
    });
  $("stepContent").innerHTML=html;
}

function stepBorder(){
  $("stepTitle").innerHTML="🥖 Borda (opcional)";
  let html="";
  (data.borders||[]).filter(b=>b.active).forEach(b=>{
    html+=`<label><input type="radio" name="border" value="${b.name}" data-price="${b.price}"> ${b.name} (+R$ ${b.price})</label><br>`;
  });
  $("stepContent").innerHTML=html;
}

function stepExtras(){
  $("stepTitle").innerHTML="➕ Adicionais";
  let html="";
  (data.extras||[]).filter(e=>e.active).forEach(e=>{
    html+=`<label><input type="checkbox" value="${e.name}" data-price="${e.price}"> ${e.name} (+R$ ${e.price})</label><br>`;
  });
  $("stepContent").innerHTML=html;
  $("nextStep").textContent="Adicionar ao carrinho";
}

function nextStep(){
  if(step===1){
    const s=document.querySelector("input[name=size]:checked");
    if(!s){alert("Escolha o tamanho");return;}
    selection.size=s;
  }
  if(step===2 && currentProduct.maxFlavors>1){
    const f=[...$("stepContent").querySelectorAll("input:checked")];
    if(!f.length){alert("Escolha ao menos 1 sabor");return;}
    if(f.length>currentProduct.maxFlavors){alert("Excedeu o limite");return;}
    selection.flavors=f;
  }
  if(step===3){
    selection.border=document.querySelector("input[name=border]:checked");
  }
  if(step===4){
    selection.extras=[...$("stepContent").querySelectorAll("input:checked")];
    finalizeItem(); return;
  }
  step++; renderStep();
}

function finalizeItem(){
  let total=Number(selection.size.dataset.price);
  let desc=currentProduct.name+" ("+selection.size.value+")";

  if(selection.flavors.length){
    let max=0;
    selection.flavors.forEach(f=>{
      const p=JSON.parse(f.dataset.prices)[selection.size.value]||0;
      max=Math.max(max,p);
    });
    total=max;
    desc+=" – "+selection.flavors.map(f=>f.value).join(" + ");
  }

  if(selection.border){
    total+=Number(selection.border.dataset.price);
    desc+=" + Borda "+selection.border.value;
  }

  selection.extras.forEach(e=>{
    total+=Number(e.dataset.price);
    desc+=" + "+e.value;
  });

  cart.push({desc,total});
  $("modal").classList.add("hidden");
  $("nextStep").textContent="Continuar";
  renderCart();
}

/* ===== CARRINHO ===== */
function renderCart(){
  $("cartBox").innerHTML="<h3>Pedido</h3>";
  let t=0;
  cart.forEach((i,idx)=>{
    t+=i.total;
    $("cartBox").innerHTML+=
      `<p>${i.desc} - R$ ${i.total.toFixed(2)}
      <button onclick="cart.splice(${idx},1);renderCart()">❌</button></p>`;
  });
  $("cartBox").innerHTML+=
    `<strong>Total: R$ ${t.toFixed(2)}</strong>
     <button onclick="sendWhats()">Enviar WhatsApp</button>`;
  $("cartBox").classList.remove("hidden");
}

function toggleCart(){ $("cartBox").classList.toggle("hidden"); }

function sendWhats(){
  let msg="🧾 Pedido:%0A";
  cart.forEach(i=>msg+=`- ${i.desc} R$ ${i.total.toFixed(2)}%0A`);
  window.open(`https://wa.me/${data.store.phone}?text=${msg}`);
}