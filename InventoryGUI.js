const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const ContainerInteractor = require('./ContainerInteractor')
const InventoryListener = require('./InventoryListener')

class InventoryGUI {
  constructor(bot, port = 3000) {
    this.bot = bot
    this.port = port
    this.app = express()
    this.server = http.createServer(this.app)
    this.io = new Server(this.server)
    this.container = new ContainerInteractor(bot)
    this.invListener = new InventoryListener(bot)
  }

  iniciar() {
    // Servir el frontend
    this.app.use(express.static(__dirname + '/public'))

    // Conexión socket
    this.io.on('connection', (socket) => {
      console.log('🖥️ Cliente conectado al panel web')

      // Enviar inventario al conectar
      socket.emit('inventario', this.obtenerInventario())

      // Petición de actualización
      socket.on('actualizarInventario', () => {
        socket.emit('inventario', this.obtenerInventario())
      })

    // Click por nombre (custom o básico)
    socket.on('clickNombre', async (data) => {
    try {
        const { nombre, tipo } = data

        // Busca tanto por nombreCustom como por nombreOriginal
        const filtro = {
        tipo,
        // no sabemos cuál de los dos coincide, así que se buscará manualmente luego
        nombreOriginal: nombre,
        nombreCustom: nombre
        }

        // Buscar todos los items actuales
        const items = JSON.parse(this.invListener.obtenerInventario())
        const itemEncontrado = items.find(item =>
        item.tipo === tipo &&
        (item.nombreOriginal.toLowerCase() === nombre.toLowerCase() ||
        item.nombreCustom.toLowerCase() === nombre.toLowerCase())
        )

        if (!itemEncontrado) {
        console.warn(`⚠️ No se encontró ningún item que cumpla los filtros: ${JSON.stringify(filtro)}`)
        return
        }

        // Si se encontró, usar el filtro exacto para click
        await this.container.click({ slot: itemEncontrado.slot, tipo: itemEncontrado.tipo })

        setTimeout(() => socket.emit('inventario', this.obtenerInventario()), 1000)
    } catch (err) {
        console.error('❌ Error al hacer click por nombre:', err)
    }
    })

    })

    // Iniciar servidor
    this.server.listen(this.port, () => {
      console.log(`🌐 Panel web activo en http://localhost:${this.port}`)
    })
  }

  obtenerInventario() {
    return JSON.parse(this.invListener.obtenerInventario())
  }
}

module.exports = InventoryGUI
