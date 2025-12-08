class SkyBlockItem {
  constructor() {
    this.itemsData = null; // Aquí guardaremos los items descargados
  }

  async cargarItems() {
    if (this.itemsData) return;

    try {
      const res = await fetch('https://api.hypixel.net/resources/skyblock/items');
      const data = await res.json();

      if (!data.success) throw new Error('Error al cargar items de Hypixel');

      this.itemsData = data.items;
      console.log('✅ Lista de items cargada correctamente');
    } catch (err) {
      console.error('❌ Error al obtener items:', err);
    }
  }

  buscarRecursivo(obj, nombreLower) {
    for (const key in obj) {
      const val = obj[key];

      if (val && typeof val === 'object') {
        if (val.name && val.name.toLowerCase() === nombreLower) {
          return val;
        }
        const res = this.buscarRecursivo(val, nombreLower);
        if (res) return res;
      }
    }
    return null;
  }

  async calcularPrecioTotal(nombre, cantidad) {
    await this.cargarItems();

    const nombreLower = nombre.toLowerCase();
    const item = this.buscarRecursivo(this.itemsData, nombreLower);

    if (!item) {
      console.log(`⚠️ No se encontró el item "${nombre}"`);
      return null;
    }

    const precioUnitario = item.npc_sell_price ?? 0;
    const precioTotal = precioUnitario * cantidad;

    console.log(`✅ ${item.name} - Precio unitario: ${precioUnitario} coins`);
    console.log(`💰 Cantidad: ${cantidad} → Precio total: ${precioTotal} coins`);

    return precioTotal;
  }

  // NUEVO MÉTODO: obtener precio de buy order
  async obtenerBuyOrderPrice(nombre) {
  try {
    // Asegurarnos de tener los items cargados
    await this.cargarItems();

    // Buscar el item en itemsData por nombre (case insensitive)
    const nombreLower = nombre.toLowerCase();
    const item = this.itemsData.find(i => i.name.toLowerCase() === nombreLower);

    if (!item) {
      console.log(`⚠️ No se encontró el item "${nombre}" en la lista de items`);
      return 0;
    }

    const productId = item.id; // <-- Usamos la ID oficial

    // Fetch directo al Bazaar
    const res = await fetch('https://api.hypixel.net/skyblock/bazaar');
    const data = await res.json();

    if (!data.success || !data.products[productId]) {
      console.log(`⚠️ No se encontró el item "${nombre}" en el Bazaar`);
      return 0;
    }

    // Precio de buy order mínimo usando quick_status
    let buyPrice = data.products[productId].quick_status?.sellPrice ?? 0;
    buyPrice = parseFloat(buyPrice.toFixed(2));

    console.log(`💸 ${nombre} - Precio de Buy Order: ${buyPrice} coins`);
    return buyPrice;

  } catch (err) {
    console.error('❌ Error obteniendo Buy Order:', err);
    return 0;
  }
}


  async isProfitable(nombre, cantidad = 1) {
    const npcPrice = await this.calcularPrecioTotal(nombre, cantidad);
    const buyPrice = await this.obtenerBuyOrderPrice(nombre);

    if (npcPrice === null || buyPrice === 0) return false; // Evitar errores

    // Revisamos si NPC es al menos 30% mayor que buyPrice
    return npcPrice >= buyPrice * 1.05;
  }


  
async obtenerTop30NPCFlips() {
  await this.cargarItems();

  try {
    const res = await fetch("https://api.hypixel.net/skyblock/bazaar");
    const data = await res.json();
    if (!data.success) return [];

    const productos = data.products;
    const resultados = [];

    function abreviar(num) {
      if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
      if (num >= 1_000) return (num / 1_000).toFixed(2) + "K";
      return num.toFixed(0);
    }

    for (const productId in productos) {
      const p = productos[productId].quick_status;
      if (!p) continue;

      const item = this.itemsData.find(i => i.id === productId);
      if (!item || !item.npc_sell_price) continue;

      if (item.category && item.category.toLowerCase() === "oddities") continue;

      const buyPrice = Math.round(p.sellPrice * 100) / 100;
      const npcPrice = item.npc_sell_price;
      const profit = Math.round((npcPrice - buyPrice) * 100) / 100;
      if (profit <= 0) continue;

      const spread = Math.abs(buyPrice - p.buyPrice);
      if (buyPrice < 0.1) continue;

      let cantidadCon1M = Math.floor(1_000_000 / buyPrice);
      if (cantidadCon1M > 71000) cantidadCon1M = 71000;
      if (cantidadCon1M < 1000) continue;

      const instasellsWeek = (p.sellMovingWeek ?? 0);
      const instabuysWeek = (p.buyMovingWeek ?? 0);

      if (instasellsWeek < 3 * instabuysWeek) continue;

      const sellOrders = p.sellOrders ?? 0;
      if (sellOrders <= 20) continue;

      const instasells1h = instasellsWeek / 168;
      if (instasells1h < 20000) continue;

      const profitTotalNum = profit * cantidadCon1M;
      const profitTotal = abreviar(profitTotalNum);

      resultados.push({
        nombre: item.name,
        id: productId,
        buyPrice: buyPrice.toFixed(2),
        npcPrice: npcPrice.toFixed(2),
        profit: profit.toFixed(2),
        cantidadCon1M,
        profitTotal,  // ahora redondeado con K/M
        instasellsWeek: abreviar(instasellsWeek),
        instasells1h: abreviar(instasells1h),
        sellOrders,
        needEnchanted: cantidadCon1M === 71000 ? "Need Enchanted version" : ""
      });
    }

    resultados.sort((a, b) => {
      const getValue = x => {
        let val = x.profitTotal.replace('M','000000').replace('K','000');
        return parseFloat(val);
      };
      return getValue(b) - getValue(a);
    });

    const top30 = resultados.slice(0, 50);
    console.table(top30);

    return top30;
  } catch (err) {
    console.error(err);
    return [];
  }
}




}

module.exports = SkyBlockItem;