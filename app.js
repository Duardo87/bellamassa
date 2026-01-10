let data=null,cart=[];
const $=id=>document.getElementById(id);

async function loadData(){
  const r=await fetch("./app.json?v="+Date.now(),{cache:"no-store"});
  return await r.json();
}

document.addEventListener("DOMContentLoaded",async()=>{
  data=await loadData();
  storeName.textContent=data.store.name;
  storePhone.href=`https://wa.me/${data.store.phone}`;
  whatsFloat.href=storePhone.href;
  loadPromo();
  renderCategories();
});

function loadPromo(){
  const p=data.promoWeek[new Date().getDay()];
  if(!p||!p.active)return;
  promoImg.src=p.image;
  promoTitle.textContent=p.title;
  promoDesc.textContent=p.desc;
  promoPrice.textContent=`R$ ${Number(p.price).toFixed(2)}`;
  promoUrgency.textContent=`⏰ Hoje • Entrega ${data.store.deliveryTime}`;
  promoBanner.classList.remove("hidden");
  promoBtn.onclick=()=>{
    cart.push({desc:p.title,total:+p.price});
    renderCart();
  };
}

function renderCategories(){
  categories.innerHTML="";
  data.categories.filter(c=>c.active).forEach((c,i)=>{
    categories.innerHTML+=`<button class="${i==0?'active':''}"
      onclick="renderProducts(${c.id},this)">${c.name}</button>`;
  });
  renderProducts(data.categories[0].id);
}

function renderProducts(id,btn){
  document.querySelectorAll(".categories button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  products.innerHTML="";
  data.products.filter(p=>p.active&&p.categoryId==id).forEach(p=>{
    let b=p.badges.bestseller?"🔥 Mais vendido":
          p.badges.promo?"⭐ Promoção":
          p.badges.offer?"💥 Oferta":"";
    products.innerHTML+=`
      <div class="product-card">
        ${b?`<span class="badge">${b}</span>`:""}
        ${p.image?`<img src="${p.image}">`:""}
        <h3>${p.name}</h3>
        <p>${p.desc||""}</p>
        <button onclick="cart.push({desc:p.name,total:p.prices.M});renderCart()">Escolher</button>
      </div>`;
  });
}

function renderCart(){
  cartBox.classList.remove("hidden");
  let t=0;
  cartItems.innerHTML=cart.map(i=>{t+=i.total; return `<p>${i.desc} R$ ${i.total}</p>`}).join("");
  if(data.store.deliveryFee>0){
    t+=data.store.deliveryFee;
    cartItems.innerHTML+=`<p>🚚 Entrega R$ ${data.store.deliveryFee}</p>`;
  }
  cartTotal.textContent=`Total R$ ${t.toFixed(2)}`;
}

function sendWhats(){
  let msg="🍕 *Pedido Bella Massa*%0A";
  let t=0;
  cart.forEach(i=>{t+=i.total; msg+=`• ${i.desc} R$ ${i.total}%0A`});
  if(data.store.deliveryFee>0){t+=data.store.deliveryFee; msg+=`🚚 Entrega R$ ${data.store.deliveryFee}%0A`}
  msg+=`⏰ ${data.store.deliveryTime}%0A`;
  if(data.store.whatsMsg) msg+=data.store.whatsMsg;
  msg+=`%0A💰 Total R$ ${t.toFixed(2)}`;
  window.open(`https://wa.me/${data.store.phone}?text=${msg}`);
}