const DATA = JSON.parse(localStorage.getItem("pizzaria-data"));
const WHATS = "5562993343622";

let cart = [];

function renderPublic() {
  document.getElementById("store-name").innerText = DATA.store.name;
  document.getElementById("store-phone").href = `https://wa.me/${WHATS}`;

  const grid = document.getElementById("products");
  grid.innerHTML = "";

  DATA.products.forEach(p => {
    grid.innerHTML += `
      <div class="product-card">
        <img src="${p.image}">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>

        <select id="size-${p.id}">
          <option value="P">P - R$ ${p.prices.P}</option>
          <option value="M">M - R$ ${p.prices.M}</option>
          <option value="G">G - R$ ${p.prices.G}</option>
        </select>

        <button class="btn btn-green" onclick="add(${p.id})">
          Adicionar
        </button>
      </div>
    `;
  });
}

function add(id) {
  const p = DATA.products.find(x => x.id === id);
  const size = document.getElementById(`size-${id}`).value;

  cart.push({
    name: `${p.name} (${size})`,
    price: p.prices[size]
  });

  renderCart();
}

function renderCart() {
  const cartEl = document.getElementById("cart");
  let total = 0;

  cartEl.innerHTML = "<h3>🧾 Pedido</h3>";

  cart.forEach(i => {
    total += i.price;
    cartEl.innerHTML += `<p>${i.name} - R$ ${i.price}</p>`;
  });

  cartEl.innerHTML += `
    <strong>Total: R$ ${total}</strong>

    <input id="addr" placeholder="Endereço">
    <select id="pay">
      <option>Dinheiro</option>
      <option>Pix</option>
      <option>Cartão</option>
    </select>

    <button class="btn btn-green" onclick="send()">Enviar WhatsApp</button>
  `;

  cartEl.classList.remove("hidden");
}

function send() {
  let msg = `Pedido Bella Massa\n\n`;
  let total = 0;

  cart.forEach(i => {
    total += i.price;
    msg += `• ${i.name} - R$ ${i.price}\n`;
  });

  msg += `\nTotal: R$ ${total}`;
  msg += `\nEndereço: ${addr.value}`;
  msg += `\nPagamento: ${pay.value}`;

  window.open(
    `https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

window.app = { renderPublic };