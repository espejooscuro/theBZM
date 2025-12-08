/**
 * ContainerInteractor - Clase para interactuar con inventario y contenedores del bot
 *
 * DEPENDENCIAS:
 *   - Requiere InventoryListener.js para obtener el inventario completo y nombres customizados.
 *
 * CONSTRUCTOR:
 *   new ContainerInteractor(bot, minDelay = 100, maxDelay = 300)
 *     - bot: instancia del bot de Mineflayer
 *     - minDelay: delay mínimo en ms entre clicks (para simular comportamiento humano)
 *     - maxDelay: delay máximo en ms entre clicks
 *
 * MÉTODOS PRINCIPALES:
 *
 * 1️⃣ click(filtros, mouseButton = 0, mode = 0)
 *    - Hacer click en un item filtrando por propiedades:
 *        filtros: objeto con keys que pueden ser:
 *          - slot           -> número del slot
 *          - nombreOriginal -> nombre del item original
 *          - nombreCustom   -> nombre customizado (por GUI/servidor)
 *          - tipo           -> 'inventario' o 'contenedor'
 *    - mouseButton: 0 = click izquierdo, 1 = click derecho
 *    - mode: 0 = normal, 1 = shift-click
 *
 *    Ejemplo:
 *      await container.click({ nombreCustom: 'Boxed', tipo: 'contenedor' })
 *
 * 2️⃣ shiftClick(filtros)
 *    - Hace un shift-click usando los mismos filtros que click.
 *
 *    Ejemplo:
 *      await container.shiftClick({ slot: 5 })
 *
 * 3️⃣ moverItem(filtrosOrigen, filtrosDestino)
 *    - Mueve un item de un slot a otro usando los filtros para ambos.
 *
 *    Ejemplo:
 *      await container.moverItem(
 *        { nombreCustom: 'OpSurvival', tipo: 'contenedor' },
 *        { nombreOriginal: 'nether_star', tipo: 'inventario' }
 *      )
 *
 * NOTAS IMPORTANTES:
 *   - Si filtras un item en la hotbar (slots 0–8) dentro del inventario, la clase ajusta automáticamente
 *     el slot sumando 36 para que Mineflayer lo reconozca.
 *   - El método click añade un delay aleatorio entre minDelay y maxDelay para simular interacción humana
 *     y evitar clicks muy rápidos que podrían ser detectados por el servidor.
 */



/**
 * ContainerInteractor - Clase para interactuar con inventario y contenedores del bot
 *
 * DEPENDENCIAS:
 *   - Requiere InventoryListener.js para obtener el inventario completo y nombres customizados.
 *
 * CONSTRUCTOR:
 *   new ContainerInteractor(bot, minDelay = 100, maxDelay = 300)
 *     - bot: instancia del bot de Mineflayer
 *     - minDelay: delay mínimo en ms entre clicks (para simular comportamiento humano)
 *     - maxDelay: delay máximo en ms entre clicks
 *
 * NUEVA FUNCIÓN:
 *   - Se limita la frecuencia de clics para evitar ejecutar dos clics en menos de 300 ms.
 *   - Si se piden más clics durante ese tiempo, se encolan y se ejecutan en orden.
 */

const InventoryListener = require('./InventoryListener')

class ContainerInteractor {
  constructor(bot, minDelay = 100, maxDelay = 300) {
    this.bot = bot
    this.minDelay = minDelay
    this.maxDelay = maxDelay
    this.invListener = new InventoryListener(bot)

    // Control de clics consecutivos
    this.lastClickTime = 0
    this.clickQueue = Promise.resolve() // Cola de ejecución secuencial
    this.minClickInterval = 300 // ms mínimo entre clics
  }

  delayHumano() {
    const ms = Math.floor(Math.random() * (this.maxDelay - this.minDelay + 1)) + this.minDelay
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Ejecuta un click con control de frecuencia y cola acumulativa.
   * Ignora errores de transacción que detendrían el flujo.
   */
  async click(filtros = {}, mouseButton = 0, mode = 0) {
  this.clickQueue = this.clickQueue.then(async () => {
    const ahora = Date.now();
    const desdeUltimo = ahora - this.lastClickTime;

    if (desdeUltimo < this.minClickInterval) {
      await new Promise(res => setTimeout(res, this.minClickInterval - desdeUltimo));
    }

    await this.delayHumano();

    const items = JSON.parse(this.invListener.obtenerInventarioPlain());

    const itemEncontrado = items.find(item => {
      for (const key in filtros) {
        const valorItem = typeof item[key] === 'string' ? item[key].toLowerCase() : item[key];
        const valorFiltro = typeof filtros[key] === 'string' ? filtros[key].toLowerCase() : filtros[key];
        if (valorItem !== valorFiltro) return false;
      }
      return true;
    });

    if (!itemEncontrado) {
      console.warn('⚠️ No se encontró ningún item que cumpla los filtros:', filtros);
      return false; // 🔹 devolvemos false si no se encontró nada
    }

    let slotReal = itemEncontrado.slot;
    if (itemEncontrado.tipo === 'inventario' && slotReal >= 0 && slotReal <= 8)
      slotReal += 36;

    this.lastClickTime = Date.now();

    try {
  await this.bot.clickWindow(slotReal, mouseButton, mode);
  console.log(`🖱️ Click ejecutado en "${itemEncontrado.nombreCustom || itemEncontrado.nombreOriginal}" (slot ${slotReal})`);
  return true;
} catch (err) {
  // Si el error es por transacción, lo tratamos como advertencia pero seguimos
  if (err.message.includes('Server didn\'t respond to transaction')) {
    console.warn('⚠️ El servidor no confirmó la transacción, pero el clic probablemente se realizó.');
    return true; // 🔹 lo consideramos un éxito
  } else {
    console.warn('⚠️ Click ignorado (otro error):', err.message);
    return false;
  }
}

  });

  return this.clickQueue;
}


  async shiftClick(filtros) {
    await this.click(filtros, 0, 1)
  }

  async moverItem(filtrosOrigen, filtrosDestino) {
    await this.click(filtrosOrigen)
    await this.click(filtrosDestino)
  }

  /**
   * Interactúa con señales abiertas (carteles)
   * @param {string} texto Texto a poner en la señal
   */
  interactuarConSeñal(texto) {
  if (!this.bot.editSign) {
    const botRef = this.bot; // guardamos la referencia correcta
    this.bot.editSign = function (line) {
  const texto = String(line); // <-- convertimos a string
  botRef._client.write('update_sign', {
    location: botRef.entity.position.offset(-1, 0, 0),
    text1: texto,
    text2: '{"italic":false,"extra":["^^^^^^^^^^^^^^^"],"text":""}',
    text3: '{"italic":false,"extra":["    Auction    "],"text":""}',
    text4: '{"italic":false,"extra":["     hours     "],"text":""}'
  });
};

  }
  this.bot.editSign(texto)
  console.log(`✏️ Se ha editado la señal con texto: "${texto}"`)
}

async cerrarContenedor() {
    if (!this.bot.currentWindow) {
      console.warn('⚠️ No hay ningún contenedor abierto para cerrar.');
      return false;
    }

    await this.delayHumano();

    try {
      const windowId = this.bot.currentWindow.id;
      this.bot.closeWindow(this.bot.currentWindow);
      console.log(`📦 Contenedor con ID ${windowId} cerrado correctamente.`);
      return true;
    } catch (err) {
      console.error('❌ Error al cerrar el contenedor:', err.message);
      return false;
    }
  }




}

module.exports = ContainerInteractor
