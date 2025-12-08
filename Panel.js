const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { exec } = require('child_process');

const inventoryViewer = require('mineflayer-web-inventory');
const InventoryListener = require('./InventoryListener');
const ContainerInteractor = require('./ContainerInteractor');
const ChatListener = require('./ChatListener');
const ItemRequester = require('./ItemRequester');

class Panel {
  constructor(bot, port = 3000) {
    this.bot = bot;
    this.invListener = new InventoryListener(bot);
    this.container = new ContainerInteractor(bot);
    this.currentPurse = null;

    this.requesterQueue = [];
    this.requesterOcupado = false;
    this.filledProcesados = new Set();

    this.chat = new ChatListener(bot, {
      excluirPalabras: ['APPEARING OFFLINE', '✎ Mana'],
      tipos: ['chat', 'sistema'],
      callback: msg => this.io?.emit('chatMensaje', msg),
    });

    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server);

    this.viewerPort = 3002;
    this.viewerInstance = null;
    this.iniciarViewer(bot);

    bot.on('spawn', () => this.iniciarViewer(bot));

    this.bot._client.on('packet', packet => {
      if (packet.prefix?.includes('Purse:')) {
        const combined = (packet.prefix || '') + (packet.suffix || '');
        const cleanText = combined.replace(/§[0-9a-fk-or]/gi, '').trim();
        const match = cleanText.match(/Purse:\s*([\d,]+)/);
        if (match?.[1]) {
          this.currentPurse = match[1];
          this.io.emit('purseUpdate', { value: this.currentPurse });
        }
      }
    });

    this.app.use(express.static(path.join(__dirname, 'public')));
    this.app.get('/viewer-port', (req, res) => res.json({ port: this.viewerPort }));

    this.server.listen(port, () => {
      console.log(`🌐 Panel web en http://localhost:${port}`);
      const url = `http://localhost:${port}`;
      if (process.platform === 'win32') exec(`start ${url}`);
      else if (process.platform === 'darwin') exec(`open ${url}`);
      else exec(`xdg-open ${url}`);
    });

    this.setupSockets();
  }

  obtenerInventario() {
    return JSON.parse(this.invListener.obtenerInventario());
  }

  iniciarViewer(bot) {
    if (this.viewerInstance) this.viewerInstance.stop();
    const port = 3002 + Math.floor(Math.random() * 100);
    this.viewerPort = port;

    const utils = require('mineflayer-web-inventory/utils');
    const originalAddItemData = utils.addItemData;
    utils.addItemData = function(item, slot) {
      if (!slot || !slot.nbt) return { id: 0, count: 0, slot: 0 };
      try { return originalAddItemData(item, slot); } catch { return { id: 0, count: 0, slot: 0 }; }
    };

    this.viewerInstance = inventoryViewer(bot, { port });
    this.io?.emit('viewer-update');
  }

  setupSockets() {
    this.io.on('connection', socket => {
      console.log('🖥️ Cliente conectado al panel web');

      // Inventario
      socket.emit('inventario', this.obtenerInventario());
      socket.on('actualizarInventario', () => socket.emit('inventario', this.obtenerInventario()));

      // Purse
      if (this.currentPurse !== null) socket.emit('purseUpdate', { value: this.currentPurse });

      // Solicitar item
      socket.on('solicitarItem', ({ nombre, cantidad, tiempo, enMinutos }) => {
        if (!nombre || !cantidad) return;

        socket.emit('itemAdded', {
          nombre,
          cantidad,
          tiempo: enMinutos ? tiempo * 60 : tiempo
        });

        const requester = new ItemRequester(this.bot, nombre, cantidad, tiempo, enMinutos);

        requester.on('itemSearchFail', ({ nombre }) => this.io.emit('stopItemSearch', { nombre }));
        requester.on('itemSearchFound', ({ nombre }) => this.io.emit('ContinueItemSearch', { nombre }));
        requester.on('itemCostDetected', ({ nombre, cost }) => this.io.emit('itemCostDetected', { nombre, cost }));
        requester.on('itemTotalDetected', ({ nombre, cantidad, precioTotal, ganancia }) =>
          this.io.emit('updateItemTotal', { nombre, cantidad, precioTotal, ganancia })
        );
        requester.on('updateStatus', ({ nombre, estado }) => this.io.emit('updateItemStatus', { nombre, estado }));
        requester.on('purseUpdate', value => { this.currentPurse = value; this.io.emit('purseUpdate', { value }); });

        requester.on('readyForFilled', ({ nombre, task }) => {
          if (!nombre || !task) return;

          // Evitamos duplicados (como ya tenías con filledProcesados)
          if (!this.filledProcesados) this.filledProcesados = new Set();
          if (this.filledProcesados.has(nombre)) return;
          this.filledProcesados.add(nombre);

          // Push de la tarea al final de la cola. El start() ejecuta la task que vino desde ItemRequester.
          this.requesterQueue.push({
            start: async () => {
              console.log(`🚀 Ejecutando tarea de filled (encolada) para ${nombre}`);
              try {
                await task(); // ejecuta la función async creada por ItemRequester
              } catch (err) {
                console.error(`Error en filled task de ${nombre}:`, err);
              }
              // Emitir al frontend que se completó (por si no lo emitió la task)
              this.io.emit('updateItemStatus', { nombre, estado: 'filled' });
            }
          });

          // Si la cola está libre, arrancamos el procesado
          if (!this.requesterOcupado) this.procesarCola();
        });


        // Metemos en la cola como promesa y liberamos automáticamente
        this.requesterQueue.push({
          start: () => new Promise(resolve => {
            requester.once('finished', () => {
              console.log(`✅ Requester terminado para ${nombre}`);
              resolve();
            });
            requester.start();
          })
        });

        this.procesarCola();
      });
    });
  }


  async procesarCola() {
    if (this.requesterOcupado || this.requesterQueue.length === 0) return;

    const siguiente = this.requesterQueue.shift();
    this.requesterOcupado = true;

    try {
      await siguiente.start();
    } catch (err) {
      console.error('Error en la tarea de la cola:', err);
    }

    this.requesterOcupado = false;
    this.procesarCola();
  }
}

module.exports = Panel;
