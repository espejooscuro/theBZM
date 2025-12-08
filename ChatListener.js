/**
 * ChatListener - Clase para escuchar, filtrar y ENVIAR mensajes en tiempo real
 *
 * OPCIONES DEL CONSTRUCTOR:
 *
 * new ChatListener(bot, opciones)
 *
 * @param {import('mineflayer').Bot} bot - Instancia del bot
 * @param {Object} opciones - Configuración de filtros y comportamiento
 *
 * Propiedades opcionales:
 *   - usuarios         : string[] | null   → jugadores a escuchar
 *   - mensajesExactos  : string[] | null   → frases exactas a detectar
 *   - palabras         : string[] | null   → palabras o fragmentos a incluir
 *   - excluirPalabras  : string[] | null   → palabras o fragmentos a EXCLUIR
 *   - tipos            : string[] | ['chat', 'sistema'] → tipos de mensajes a registrar
 *   - callback         : function          → se ejecuta cuando llega un mensaje que cumple filtros
 */

class ChatListener {
  constructor(bot, opciones = {}) {
    this.bot = bot
    this.mensajes = []

    this.usuarios = opciones.usuarios || null
    this.mensajesExactos = opciones.mensajesExactos || null
    this.palabras = opciones.palabras || null
    this.excluirPalabras = opciones.excluirPalabras || null // 🆕 NUEVO FILTRO
    this.tipos = opciones.tipos || ['chat', 'sistema']
    this.callback = opciones.callback || null

    this.iniciarEscucha()
  }

  iniciarEscucha() {
    // 🗣️ CHAT DE JUGADORES
    this.bot.on('chat', (username, mensaje) => {
      if (!this.tipos.includes('chat')) return
      if (this.usuarios && !this.usuarios.includes(username)) return
      if (this.mensajesExactos && !this.mensajesExactos.includes(mensaje)) return

      const mensajeLower = mensaje.toLowerCase()

      // ✅ Filtro de inclusión (palabras obligatorias)
      if (this.palabras) {
        const coincide = this.palabras.some(p =>
          mensajeLower.includes(p.toLowerCase())
        )
        if (!coincide) return
      }

      // 🚫 Filtro de exclusión (palabras prohibidas)
      if (this.excluirPalabras) {
        const contieneProhibida = this.excluirPalabras.some(p =>
          mensajeLower.includes(p.toLowerCase())
        )
        if (contieneProhibida) return
      }

      const registro = {
        tipo: 'chat',
        usuario: username,
        mensaje,
        timestamp: new Date()
      }

      this.mensajes.push(registro)
      console.log(`[CHAT] <${username}>: ${mensaje}`)
      if (this.callback) this.callback(registro)
    })

    // ⚙️ MENSAJES DEL SERVIDOR
    this.bot.on('message', (jsonMsg) => {
      if (!this.tipos.includes('sistema')) return
      const textoPlano = jsonMsg.toString().trim()
      const textoLower = textoPlano.toLowerCase()

      // ✅ Filtro de inclusión
      if (this.mensajesExactos && !this.mensajesExactos.includes(textoPlano)) return
      if (this.palabras) {
        const coincide = this.palabras.some(p => textoLower.includes(p.toLowerCase()))
        if (!coincide) return
      }

      // 🚫 Filtro de exclusión
      if (this.excluirPalabras) {
        const contieneProhibida = this.excluirPalabras.some(p =>
          textoLower.includes(p.toLowerCase())
        )
        if (contieneProhibida) return
      }

      const registro = {
        tipo: 'sistema',
        mensaje: textoPlano,
        timestamp: new Date()
      }

      this.mensajes.push(registro)
      console.log(`[SERVIDOR] ${textoPlano}`)
      if (this.callback) this.callback(registro)
    })
  }

  /**
   * 📜 Devuelve los últimos N mensajes recibidos
   * @param {number} n - cantidad de mensajes (por defecto 10)
   */
  obtenerUltimos(n = 10) {
    return this.mensajes.slice(-n)
  }

  /**
   * 💬 Envía un mensaje o comando al servidor
   * @param {string} texto - mensaje o comando (puede incluir '/')
   */
  enviar(texto) {
    if (!texto || typeof texto !== 'string') return
    console.log(`📤 Enviando: ${texto}`)
    this.bot.chat(texto)
  }


  onMensajeContiene(texto, callback) {
    if (!texto || typeof callback !== 'function') return

    this.bot.on('chat', (username, mensaje) => {
      const mensajeLower = mensaje.toLowerCase()
      const patron = typeof texto === 'string' ? texto.toLowerCase() : texto
      if (typeof patron === 'string' && mensajeLower.includes(patron)) callback({ tipo: 'chat', usuario: username, mensaje })
      else if (patron instanceof RegExp && patron.test(mensaje)) callback({ tipo: 'chat', usuario: username, mensaje })
    })

    this.bot.on('message', (jsonMsg) => {
      const textoPlano = jsonMsg.toString().trim()
      const textoLower = textoPlano.toLowerCase()
      const patron = typeof texto === 'string' ? texto.toLowerCase() : texto
      if (typeof patron === 'string' && textoLower.includes(patron)) callback({ tipo: 'sistema', mensaje: textoPlano })
      else if (patron instanceof RegExp && patron.test(textoPlano)) callback({ tipo: 'sistema', mensaje: textoPlano })
    })
  }




}

module.exports = ChatListener
