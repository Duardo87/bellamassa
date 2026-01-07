const KEY = "pizzaria-data";

const db = JSON.parse(localStorage.getItem(KEY)) || {
  store: { name: "Bella Massa", phone: "5562993343622" },
  products: [],
  extras: [],
  borders: []
};

function save() {
  localStorage.setItem(KEY, JSON.stringify(db));
}

function login() {
  if (user.value === "admin" && pass.value === "123") {
    login.style.display = "none";
    admin.classList.remove("hidden");
    render();
  } else {
    alert("Login inválido");
  }
}

function logout() {
  location.reload();
}

function saveStore() {
  db.store.name = storeName.value;
  db.store.phone = storePhone.value;
  save();
  alert("Salvo");
}

function addProduct() {
  const reader = new FileReader();
  reader.onload = () => {
    db.products.push({
      id: Date.now(),
      name: prodName.value,
      desc: prodDesc.value,
      prices: {
        P: Number(priceP.value),
        M: Number(priceM.value),
        G: Number(priceG.value)
      },
      image: reader.result
    });
    save();
    render();
  };
  reader.readAsDataURL(prodImage.files[0]);
}

function addExtra() {
  db.extras.push({
    id: Date.now(),
    name: extraName.value,
    price: Number(extraPrice.value)
  });
  save();
  render();
}

function addBorder() {
  db.borders.push({
    id: Date.now(),
    name: borderName.value,
    price: Number(borderPrice.value)
  });
  save();
  render();
}

function render() {
  productList.innerHTML = db.products.map(p =>
    `<p>${p.name} (P ${p.prices.P} | M ${p.prices.M} | G ${p.prices.G})</p>`
  ).join("");

  extraList.innerHTML = db.extras.map(e =>
    `<p>${e.name} - R$ ${e.price}</p>`
  ).join("");

  borderList.innerHTML = db.borders.map(b =>
    `<p>${b.name} - R$ ${b.price}</p>`
  ).join("");
}