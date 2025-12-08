/**
 * InventoryListener - Clase para obtener el inventario del bot y contenedores abiertos
 *
 * DEPENDENCIAS:
 *   - Mineflayer: requiere una instancia de bot válida.
 *
 * CONSTRUCTOR:
 *   new InventoryListener(bot)
 *     - bot: instancia del bot de Mineflayer
 *
 * MÉTODOS PRINCIPALES:
 *
 * 1️⃣ obtenerInventario()
 *    - Devuelve todos los items del inventario del jugador y del contenedor abierto (si lo hay)
 *      en formato JSON.
 *    - Cada item tiene la siguiente estructura:
 *        {
 *          slot: número del slot (0–53 en contenedor, 0–35 en inventario),
 *          nombreOriginal: nombre interno del item (ej: "nether_star"),
 *          nombreCustom: nombre mostrado en la GUI o NBT (ej: "OpSurvival"),
 *          id: ID numérico del item,
 *          cantidad: cantidad de ese item en el slot,
 *          tipo: 'inventario' o 'contenedor'
 *        }
 *
 *    - La función detecta automáticamente si hay un contenedor abierto y distingue los slots del
 *      contenedor de los del inventario del jugador.
 *    - También obtiene el nombre customizado del item usando:
 *        • NBT (si existe un nombre personalizado en el contenedor o GUI)
 *        • displayName (Mineflayer a veces lo genera automáticamente)
 *      Si no encuentra un nombre custom, devuelve el nombreOriginal.
 *
 * EJEMPLOS DE USO:
 *
 * const InventoryListener = require('./InventoryListener')
 * const invListener = new InventoryListener(bot)
 *
 * // Obtener inventario completo y contenedores abiertos
 * const inventarioJSON = invListener.obtenerInventario()
 * console.log(inventarioJSON)
 *
 * // Ejemplo de lectura de items individuales:
 * const items = JSON.parse(inventarioJSON)
 * items.forEach(item => {
 *   console.log(`${item.tipo} - slot ${item.slot}: ${item.nombreCustom} (${item.cantidad})`)
 * })
 *
 * NOTAS:
 *   - Los slots del hotbar se incluyen como parte del inventario.
 *   - Los slots del contenedor se calculan restando los últimos 36 slots del inventario.
 *   - Devuelve un JSON indentado para fácil lectura.
 */

class InventoryListener {
  constructor(bot) {
    this.bot = bot
  }

  obtenerInventario() {
    const window = this.bot.currentWindow
    let items = []

    const nombreCustom = (item) => {
      if (!item) return '' // si no hay item, devolvemos string vacío
      const nbt = item.nbt || { value: {} }
      if (nbt.value.display && nbt.value.display.value && nbt.value.display.value.Name) {
        return nbt.value.display.value.Name.value || ''
      }
      return item.name || ''
    }

    const processItem = (item, index, tipo) => ({
      slot: index,
      nombreOriginal: item?.name || '',
      nombreCustom: nombreCustom(item),
      id: item?.type || 0,
      cantidad: item?.count || 0,
      tipo,
      nbt: item?.nbt || { value: {} } // NUNCA null
    })

    if (window) {
      const containerSlots = window.slots.length - 36
      window.slots.forEach((item, index) => {
        if (!item) return // ⚠️ Si el slot está vacío, se salta
        const tipo = index < containerSlots ? 'contenedor' : 'inventario'
        items.push(processItem(item, index, tipo))
      })
    } else {
      this.bot.inventory.items().forEach(item => {
        if (!item) return // ⚠️ No procesa slots vacíos
        items.push(processItem(item, item.slot, 'inventario'))
      })
    }

    return JSON.stringify(items, null, 2)
  }

  obtenerInventarioPlain() {
    const removeColorCodes = (text) => text ? text.replace(/§[0-9a-fk-or]/gi, '') : ''
    const inventario = JSON.parse(this.obtenerInventario())

    return JSON.stringify(inventario.map(item => ({
      ...item,
      nombreOriginal: removeColorCodes(item.nombreOriginal),
      nombreCustom: removeColorCodes(item.nombreCustom)
    })), null, 2)
  }

  /**
   * 🧰 Verifica si un contenedor (no el inventario) está abierto
   * @returns {boolean} true si hay un contenedor abierto, false si no
   */
  nombreContenedorAbierto() {
    const window = this.bot.currentWindow;
    if (!window) return null;

    const title = window.title;
    const type = window.type || '';

    const esContenedor =
      type !== 'minecraft:inventory' &&
      !/inventory/i.test(title?.text || title || '');

    if (!esContenedor) return null;

    let texto = '';

    if (typeof title === 'string') {
      texto = title;
    } else if (typeof title === 'object') {
      if (title.extra && Array.isArray(title.extra)) {
        texto = title.extra.map(part => part.text || '').join('');
      } else if (title.text) {
        texto = title.text;
      } else {
        texto = JSON.stringify(title);
      }
    }

    // 🔹 Normalizamos el string:
    // 1. Quitamos códigos de color §
    // 2. Pasamos todo a minúsculas
    return texto.replace(/§[0-9a-fk-or]/gi, '').toLowerCase().trim();
  }



  existeItemEnContenedor(filtros = {}) {
    const window = this.bot.currentWindow;
    if (!window) return false;

    const containerSlots = window.slots.length - 36;

    const items = window.slots
      .map((item, index) => {
        if (!item) return null;
        const tipo = index < containerSlots ? 'contenedor' : 'inventario';

        const nbt = item.nbt || { value: {} };
        let nombreCustom = '';
        if (nbt.value.display?.value?.Name) {
          nombreCustom = nbt.value.display.value.Name.value || '';
        } else {
          nombreCustom = item.name || '';
        }

        return {
          slot: index,
          tipo,
          nombreOriginal: item.name || '',
          nombreCustom: nombreCustom.replace(/§[0-9a-fk-or]/gi, '') // sin colores
        };
      })
      .filter(Boolean);

      return items.some(item => {

      // 🔹 1. Coincidencia parcial: contiene
      if (filtros.contiene) {
        const needle = filtros.contiene.toLowerCase();

        const nombreOriginal = (item.nombreOriginal || '').toLowerCase();
        const nombreCustom   = (item.nombreCustom   || '').toLowerCase();

        const coincide =
          nombreOriginal.includes(needle) ||
          nombreCustom.includes(needle);

        if (!coincide) return false;
      }

      // 🔹 2. Coincidencias exactas (lo de siempre)
      for (const key in filtros) {
        if (key === 'contiene') continue; // ya lo procesamos antes

        const valorItem = item[key];
        const valorFiltro = filtros[key];

        if (typeof valorItem === 'string' && typeof valorFiltro === 'string') {
          if (valorItem.toLowerCase() !== valorFiltro.toLowerCase()) return false;
        } else if (valorItem !== valorFiltro) {
          return false;
        }
      }

      return true;
    });

  }



   /**
   * Comprueba si solo 1/3 o menos de los slots del inventario están vacíos
   * @returns {boolean} true si cumple la condición
   */
  inventarioMayormenteLleno() {
    const window = this.bot.currentWindow;
    if (!window) return false;

    // Tomamos los últimos 36 slots que corresponden al inventario del jugador
    const inventarioSlots = window.slots.slice(-36);

    const vacios = inventarioSlots.filter(slot => !slot).length;
    const totalSlots = inventarioSlots.length;

    // 1/3 de slots vacíos máximo
    return vacios <= totalSlots / 3;
  }



obtenerItemsValidos() {
  const window = this.bot.currentWindow;
  if (!window) return [];

  const containerSlots = window.slots.length - 36;
  const resultado = [];

  for (let slot = 0; slot < containerSlots; slot++) {
    const item = window.slots[slot];
    if (!item) continue;
    if (item.name === "stained_glass_pane") continue;

    let nombreCustom = "";
    const nbt = item.nbt || { value: {} };
    if (nbt.value.display?.value?.Name) {
      nombreCustom = nbt.value.display.value.Name.value;
    } else {
      nombreCustom = item.displayName || item.name;
    }

    const nombrePlano = nombreCustom.replace(/§[0-9a-fk-or]/gi, "").trim().toLowerCase();
    if (nombrePlano === "go back" || nombrePlano === "claim all coins") continue;

    resultado.push({
      slot,
      nombreOriginal: item.name,
      nombreCustom,
      nombrePlano,
      cantidad: item.count
    });
  }

  return resultado;
}

obtenerItemsValidosInventario() {
  const window = this.bot.currentWindow;
  if (!window) return [];

  // Los últimos 36 slots son el inventario del jugador
  const inicioInventario = window.slots.length - 36;
  const resultado = [];

  for (let slot = inicioInventario; slot < window.slots.length; slot++) {
    const item = window.slots[slot];
    if (!item) continue;
    if (item.name === "stained_glass_pane") continue;

    let nombreCustom = "";
    const nbt = item.nbt || { value: {} };
    if (nbt.value.display?.value?.Name) {
      nombreCustom = nbt.value.display.value.Name.value;
    } else {
      nombreCustom = item.displayName || item.name;
    }

    const nombrePlano = nombreCustom.replace(/§[0-9a-fk-or]/gi, "").trim().toLowerCase();
    if (nombrePlano === "go back" || nombrePlano === "claim all coins") continue;

    resultado.push({
      slot,
      nombreOriginal: item.name,
      nombreCustom,
      nombrePlano,
      cantidad: item.count
    });
  }

  return resultado;
}


compararItemsPorNombre(itemsContenedor, itemsInventario) {
  const resultado = [];

  for (const itemInv of itemsInventario) {
    const nombrePlano = itemInv.nombrePlano; // ya limpio y en minúsculas

    // Nombre base quitando "enchanted " si existe al inicio
    const nombreBase = nombrePlano.startsWith("enchanted ") 
      ? nombrePlano.slice(9) // quitar "enchanted "
      : nombrePlano;

    const coincide = itemsContenedor.some(itemCont => {
      return (
        itemCont.nombrePlano.includes(nombrePlano) || // coincidencia normal
        itemCont.nombrePlano.includes(nombreBase)    // coincidencia quitando "enchanted "
      );
    });

    if (coincide) {
      resultado.push(itemInv);
    }
  }

  return resultado;
}



}

module.exports = InventoryListener
