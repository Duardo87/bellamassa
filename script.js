let total = 0;
let itens = [];
let taxaEntrega = 0;

// Local fixo da pizzaria (Estação das Fontes 2)
const lojaLat = -16.6835; 
const lojaLng = -49.2875;

function add(nome, valor){
  itens.push(nome);
  total += valor;
  alert(nome + " adicionado ao carrinho");
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calcularEntrega(callback){
  if(!navigator.geolocation){
    alert("Ative a localização para calcular a entrega.");
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const userLat = pos.coords.latitude;
    const userLng = pos.coords.longitude;

    const distancia = calcularDistancia(
      lojaLat, lojaLng, userLat, userLng
    );

    if(distancia <= 3){
      taxaEntrega = 0;
    } else {
      taxaEntrega = (distancia - 3) * 2;
    }

    callback(distancia.toFixed(1));
  });
}

function finalizar(){
  if(itens.length === 0){
    alert("Seu carrinho está vazio");
    return;
  }

  calcularEntrega(distancia => {
    const totalFinal = total + taxaEntrega;

    let msg = "🍕 *Pedido Bella Massa*%0A%0A";
    itens.forEach(i => msg += "• " + i + "%0A");

    msg += "%0A📍 Distância: " + distancia + " km";
    msg += "%0A🚚 Entrega: " + 
      (taxaEntrega === 0 ? "GRÁTIS" : "R$ " + taxaEntrega.toFixed(2));

    msg += "%0A💰 Total: R$ " + totalFinal.toFixed(2);
    msg += "%0A%0A💳 *PIX:* 62 999193066";

    window.open(
      "https://wa.me/5562993343622?text=" + msg,
      "_blank"
    );
  });
}