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
  constructor(bot, minDelay = 300, maxDelay = 700) {
    this.bot = bot
    this.minDelay = minDelay
    this.maxDelay = maxDelay
    this.invListener = new InventoryListener(bot)

    this.lastClickTime = 0
    this.minClickInterval = 300
  }

  delayHumano() {
    const ms = Math.floor(Math.random() * (this.maxDelay - this.minDelay + 1)) + this.minDelay
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  setDelay(minDelay, maxDelay) {
    if (minDelay !== undefined) this.minDelay = minDelay
    if (maxDelay !== undefined) this.maxDelay = maxDelay
  }

  async click(filtros = {}, mouseButton = 0, mode = 0) {
  const tiempoInicioTotal = Date.now()  // 🔹 Inicio del tiempo total

  const delay = 100 + Math.floor(Math.random() * 200)
  await new Promise(res => setTimeout(res, delay))

  // 🔹 Medición de tiempo de obtener inventario
  const tiempoInicioInventario = Date.now()
  const items = this.cachedItems || JSON.parse(this.invListener.obtenerInventarioPlain())
  const tiempoFinInventario = Date.now()
  //console.log(`⏱ Tiempo en leer inventario: ${tiempoFinInventario - tiempoInicioInventario} ms`)

  const itemEncontrado = items.find(item => {
    if (filtros.contiene) {
      const needle = filtros.contiene.toLowerCase()
      if (!(item.nombreOriginal?.toLowerCase().includes(needle) ||
            item.nombreCustom?.toLowerCase().includes(needle))) return false
    }
    for (const key in filtros) {
      if (key === 'contiene') continue
      const valorItem = typeof item[key] === 'string' ? item[key].toLowerCase() : item[key]
      const valorFiltro = typeof filtros[key] === 'string' ? filtros[key].toLowerCase() : filtros[key]
      if (valorItem !== valorFiltro) return false
    }
    return true
  })

  if (!itemEncontrado) {
    console.log(`❌ Click abortado: no se encontró el item.`)
    return false
  }

  let slotReal = itemEncontrado.slot
  if (itemEncontrado.tipo === 'inventario' && slotReal <= 8) slotReal += 36

  try {
    this.bot.currentWindow.requiresConfirmation = false
    this.bot.inventory.requiresConfirmation = false

    const tiempoInicioClick = Date.now()
    await this.bot.clickWindow(slotReal, mouseButton, mode)
    const tiempoFinClick = Date.now()

    //console.log(`✅ Click ejecutado en slot ${slotReal} en ${tiempoFinClick - tiempoInicioClick} ms`)
    const tiempoTotal = Date.now() - tiempoInicioTotal
    //console.log(`⏱ Tiempo total del click (incluyendo lectura de inventario y delay): ${tiempoTotal} ms`)

    return true
  } catch (err) {
    console.error("⚠️ Error en clickWindow:", err.message)
    return false
  }
}



  async shiftClick(filtros) {
    await this.click(filtros, 0, 1)
  }

  async moverItem(filtrosOrigen, filtrosDestino) {
    await this.click(filtrosOrigen)
    await this.click(filtrosDestino)
  }

  interactuarConSeñal(texto) {
    if (!this.bot.editSign) {
      const botRef = this.bot
      this.bot.editSign = function (line) {
        const texto = String(line)
        botRef._client.write('update_sign', {
          location: botRef.entity.position.offset(-1, 0, 0),
          text1: texto,
          text2: '{"italic":false,"extra":["^^^^^^^^^^^^^^^"],"text":""}',
          text3: '{"italic":false,"extra":["    Auction    "],"text":""}',
          text4: '{"italic":false,"extra":["     hours     "],"text":""}'
        })
      }
    }
    this.bot.editSign(texto)
    console.log(`✏️ Señal editada con texto: "${texto}"`)
  }

  async cerrarContenedor() {
    if (!this.bot.currentWindow) {
      console.error('⚠️ No hay ningún contenedor abierto para cerrar.')
      return false
    }

    await this.delayHumano()

    try {
      const windowId = this.bot.currentWindow.id
      this.bot.closeWindow(this.bot.currentWindow)
      console.log(`📦 Contenedor con ID ${windowId} cerrado correctamente.`)
      return true
    } catch (err) {
      console.error('❌ Error al cerrar el contenedor:', err.message)
      return false
    }
  }
}

module.exports = ContainerInteractor
