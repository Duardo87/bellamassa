const WHATS_PHONE="5562993343622";
let data=null,cart=[];

async function loadData(){
  const r=await fetch("./app.json?v="+Date.now());
  return await r.json();
}

document.addEventListener("DOMContentLoaded",async()=>{
  data=await loadData();
  document.getElementById("store-name").textContent=data.store.name;
  document.getElementById("store-phone").href=`https://wa.me/${data.store.phone}`;
});

/* (fluxo do pedido permanece igual ao seu atual) */

function renderCart(){
  let total=0;
  const c=document.getElementById("cart");
  c.innerHTML="<h3>Pedido</h3>";
  cart.forEach((i,idx)=>{
    total+=i.price;
    c.innerHTML+=`${i.name} - R$ ${i.price.toFixed(2)} <button onclick="cart.splice(${idx},1);renderCart()">❌</button><br>`;
  });
  c.innerHTML+=`
    <textarea id="note" placeholder="Observações"></textarea>
    <input id="address" placeholder="Endereço completo">
    <select id="pay">
      <option>Forma de pagamento</option>
      <option>Dinheiro</option>
      <option>Pix</option>
      <option>Cartão</option>
    </select>
    <strong>Total: R$ ${total.toFixed(2)}</strong>
    <button onclick="sendWhats()">Enviar WhatsApp</button>`;
}

function sendWhats(){
  let msg="🧾 Pedido\n\n";
  cart.forEach(i=>msg+=`• ${i.name} - R$ ${i.price.toFixed(2)}\n`);
  msg+=`\n📝 Obs: ${note.value}\n📍 Endereço: ${address.value}\n💳 Pagamento: ${pay.value}`;
  window.open(`https://wa.me/${WHATS_PHONE}?text=${encodeURIComponent(msg)}`);
}