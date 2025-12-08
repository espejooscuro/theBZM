// SkyBlockItem.js
const fetch = globalThis.fetch; // Node 18+ ya tiene fetch

class SkyBlockItem {
  constructor() {
    this.itemsData = null; // Aquí guardaremos los items descargados
  }

  // Método para cargar la lista de items desde la API
  async cargarItems() {
    if (this.itemsData) return; // ya cargados

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

  // Método recursivo para buscar un item por nombre humano
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

  // Método público: dado un nombre y una cantidad, devuelve el precio total
  async calcularPrecioTotal(nombre, cantidad) {
    await this.cargarItems(); // Asegurarnos de tener los datos

    const nombreLower = nombre.toLowerCase();
    const item = this.buscarRecursivo(this.itemsData, nombreLower);

    if (!item) {
      console.log(`⚠️ No se encontró el item "${nombre}"`);
      return null;
    }

    const precioUnitario = item.npc_sell_price ?? 0; // fallback a 0 si no existe
    const precioTotal = precioUnitario * cantidad;

    console.log(`✅ ${item.name} - Precio unitario: ${precioUnitario} coins`);
    console.log(`💰 Cantidad: ${cantidad} → Precio total: ${precioTotal} coins`);

    return precioTotal;
  }
}

// Exportamos la clase para usar en otros ficheros
module.exports = SkyBlockItem;
