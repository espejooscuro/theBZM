const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const EventEmitter = require('events');

const InventoryListener = require('./InventoryListener');
const ContainerInteractor = require('./ContainerInteractor');
const ChatListener = require('./ChatListener');
const ItemRequester = require('./ItemRequester');
const SkyBlockItem = require('./SkyBlockItem');

class Panel extends EventEmitter{
  constructor(bot, options = {}) {
  super();
  const { username = 'unknown', port } = options;
  this.username = username;
  this.port = port || 3000;



    this.bot = bot;
    this.invListener = new InventoryListener(bot);
    this.container = new ContainerInteractor(bot);
    this.currentPurse = null;
    this.skyblock = new SkyBlockItem();
    this.requesterQueue = [];
    this.requesterOcupado = false;
    this.filledProcesados = new Set();
    this.ultimoCantidad = {}; 
    this.ultimoTiempo = {};  
    this.ultimosComprados = [];
    this.chat = new ChatListener(bot, {
        excluirPalabras: ['APPEARING OFFLINE', '✎', 'Claimed', 'Claiming order...'],
        tipos: ['chat', 'sistema'],
        callback: msg => {
          this.io?.emit('chatMensaje', msg);
          this.emit('CHAT_MESSAGE', msg);
        },
    });

    // JSON para guardar si la web ya se abrió
    this.estadoPath = path.join(__dirname, "estado.json");

    // Leer si la web ya estaba abierta
    let webYaAbierta = false;
    try {
        const data = fs.readFileSync(this.estadoPath, "utf8");
        const estado = JSON.parse(data);
        webYaAbierta = estado.webAbierta;
    } catch (err) {
        console.log("No se pudo leer estado.json, se asume web no abierta.");
    }

    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server);

    this.viewerPort = 3002;
    this.viewerInstance = null;

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

    this.server.listen(this.port, () => {
        console.log(`🌐 Panel [${this.username}] → http://localhost:${this.port}`);
        const url = `http://localhost:${this.port}`;


        // Abrir web solo si no estaba abierta
        if (!webYaAbierta) {
            if (process.platform === 'win32') exec(`start ${url}`);
            else if (process.platform === 'darwin') exec(`open ${url}`);
            else exec(`xdg-open ${url}`);

            // Guardar que la web ya se abrió
            fs.writeFileSync(this.estadoPath, JSON.stringify({ webAbierta: true }, null, 2));
        }
    });

// ======================== WHITELIST POR USUARIO ========================
    const isPkg = typeof process.pkg !== "undefined";
    const basePath = isPkg ? path.dirname(process.execPath) : __dirname;

    this.whitelistPath = path.join(basePath, "whitelist.json");

    // Crear archivo si no existe
    if (!fs.existsSync(this.whitelistPath)) {
      fs.writeFileSync(this.whitelistPath, JSON.stringify({}, null, 2));
      console.log("📄 whitelist.json creado");
    }

    // Leer whitelist completa
    let fullWhitelist = {};
    try {
      fullWhitelist = JSON.parse(fs.readFileSync(this.whitelistPath, "utf8"));
    } catch {
      fullWhitelist = {};
    }

    // Crear entrada para el usuario si no existe
    if (!fullWhitelist[this.username]) {
      fullWhitelist[this.username] = {};
      fs.writeFileSync(this.whitelistPath, JSON.stringify(fullWhitelist, null, 2));
      console.log(`➕ Whitelist creada para ${this.username}`);
    }

    // SOLO la whitelist del usuario actual
    this.fullWhitelist = fullWhitelist;
    this.whitelist = fullWhitelist[this.username];


      this.setupSockets();


}




  obtenerInventario() {
    return JSON.parse(this.invListener.obtenerInventario());
  }

  async destroy() {
  console.log("🧹 Cerrando Panel...");

  // Detener todos los requesters
  if (this.requesterQueue) {
    for (const task of this.requesterQueue) {
      try { task.requester?.destroy?.(); } catch {}
      this.container = null;
    }
    this.requesterQueue = [];
    this.requesterOcupado = false;
  }

  // Quitar listeners de chat y sockets
  if (this.chat) {
    this.chat.removeListeners?.();
    this.chat.removeAllListeners?.();
    this.invListener = null;

  }
  if (this.io) {
    this.io.removeAllListeners?.();
    this.io.close?.();
  }

  // Detener servidor con timeout
  if (this.server) {
    await Promise.race([
      new Promise(res => this.server.close(res)),
      new Promise(res => setTimeout(res, 2000))
    ]);
  }

  this.emit('STOP_ALL_REQUESTERS');
  // Limpiar timers internos
  if (this._checkStopInterval) clearInterval(this._checkStopInterval);
  if (this._timers) Object.values(this._timers).forEach(t => clearTimeout(t));

  console.log("🛑 Panel destruido correctamente");
}

  //Reset manual usado al principio de la ejecucón para comenzar el reset y todos los itemRequesters
  manualReset() {
  console.log("🔄 Ejecutando manualReset desde el panel…");

  // 1️⃣ Avisar al cliente (solo animación)
  this.io.emit("manualReset");

  // 2️⃣ Resetear datos internos
  this.filledProcesados.clear();
  this.ultimoCantidad = {};
  this.ultimoTiempo = {};
  // this.requesterQueue = [];   ❗ NO se limpia aquí, se limpia al final del requester restart
  // this.requesterOcupado = false;

  console.log("🔄 Sistema interno preliminarmente reseteado.");

  // 3️⃣ Crear requester especial "restart"
  const nuevoId = Date.now();
  const nombre = "restart";
  const cantidad = 1;
  const tiempo = 9999;
  const enMinutos = false;

  const nuevoRequester = new ItemRequester(
    this.bot,
    nuevoId,
    nombre,
    cantidad,
    tiempo,
    enMinutos
  );
  nuevoRequester.panel = this;
  nuevoRequester.bindPanel(this);
  nuevoRequester.detectarMensajes();
  this.asignarListeners(nuevoRequester);

  this.io.emit("itemAdded", { id: nuevoId, nombre, cantidad, tiempo });

  console.log("🚀 Requester 'restart' creado:", {
    id: nuevoRequester.id,
    nombre: nuevoRequester.customName,
    cantidad: nuevoRequester.cantidad
  });

  // 4️⃣ Encolar y limpiar todo cuando termine
  this.requesterQueue.push({
    start: () => new Promise(async resolve => {
      nuevoRequester.once("finished", () => {
        console.log("✅ Requester 'restart' terminado. Reseteando sistema completamente…");

        this.requesterQueue = [];
        this.requesterOcupado = false;
        this.filledProcesados.clear();
        this.ultimoCantidad = {};
        this.ultimoTiempo = {};

        resolve();
      });

      await nuevoRequester.start();
    })
  });

  // 5️⃣ Si el sistema estaba detenido, empezar a procesar
  if (!this.requesterOcupado) this.procesarCola();

  // 6️⃣ Avisar al frontend que ya se inició el reset
  this.io.emit("itemSystemRestarted");
}

  async handleResetFinished(id) {
    console.log(`♻️ [PANEL] resetFinished recibido de ID ${id}`);

    // 1️⃣ Datos por defecto
    let tiempo = this.defaultResetTime ?? 300; 
    let enMinutos = this.defaultUnidadMinutos ?? false;
    if (enMinutos) tiempo *= 60;

    // 2️⃣ Leer whitelist actual
    if (!this.whitelist) {
        console.warn("⚠️ No hay whitelist configurada en el panel.");
        return;
    }

    const whitelistNombres = Object.keys(this.whitelist).filter(k => this.whitelist[k]);
    if (whitelistNombres.length === 0) {
        console.log("⚠️ No hay items activos en la whitelist, nada que reiniciar.");
        return;
    }

    // 3️⃣ Obtener top items desde API
    let topItems = [];
    try {
        topItems = await this.skyblock.obtenerTop30NPCFlips();
    } catch (err) {
        console.error("Error obteniendo top NPC flips:", err);
        return;
    }

    // 4️⃣ Filtrar solo los que están en la whitelist por nombre
    const itemsAReiniciar = topItems.filter(item => whitelistNombres.includes(item.nombre));
    if (itemsAReiniciar.length === 0) {
        console.log("⚠️ Ningún item del whitelist aparece en el top30. Abortando reinicio.");
        return;
    }
    // ------------------------------------------------
    // 5️⃣ Crear requesters para cada item filtrado
    // ------------------------------------------------
    for (const item of itemsAReiniciar) {
      const idRandom = Math.floor(Math.random() * 9999999) + 1;
      const nombre = item.nombre;
      const cantidad = item.cantidadCon1M; // o la que quieras usar

      console.log(`🎯 Reiniciando item: ${nombre} x${cantidad}`);

      const requester = new ItemRequester(this.bot, idRandom, nombre, cantidad, tiempo, enMinutos);
      requester.panel = this;
      requester.bindPanel(this);
      requester.detectarMensajes();
      this.asignarListeners(requester);
      this.io.emit('itemAdded', { id: idRandom, nombre, cantidad, tiempo });
      this.requesterQueue.push({
        start: () =>
          new Promise(resolve => {
            requester.once("finished", () => resolve());
            requester.start();
          })
      });
    }

    // ------------------------------------------------
    // 6️⃣ Procesar la cola si estaba vacía
    // ------------------------------------------------
    if (!this.requesterOcupado) this.procesarCola();
  }

  asignarListeners(requester) {

    requester.on('itemSearchFail', ({ id, nombre }) =>
      this.io.emit('stopItemSearch', { id, nombre })
    );


    requester.on('itemBought', ({nombre}) => {
            // Añadimos el nombre al final de la lista
            this.ultimosComprados.push(nombre);

            // Mantener máximo 3 elementos
            if (this.ultimosComprados.length > 3) {
                this.ultimosComprados.shift();
            }

            // Comprobar si el último nombre coincide con el anterior
            if (this.ultimosComprados.length >= 2 &&
                this.ultimosComprados[this.ultimosComprados.length - 1] === this.ultimosComprados[this.ultimosComprados.length - 2]) {
                console.log("Se ha detectado una compra duplicada! Reseteando el programa si vuelve a suceder..");
            }

            // Comprobar si hay 3 compras consecutivas iguales
            if (this.ultimosComprados.length === 3 &&
                this.ultimosComprados[0] === this.ultimosComprados[1] &&
                this.ultimosComprados[1] === this.ultimosComprados[2]) {
                console.log(`Se ha comprado 3 objetos iguales con el nombre ${nombre}. Cerrando programa...`);
                this.bot.emit('duplicateBoughtReset', {nombre});
            }
    });

    requester.on('sendCMD', ({cmd}) => {
      this.chat.enviar(cmd);
    });

    requester.on('itemSearchFound', ({ id, nombre }) => {
      this.io.emit('ContinueItemSearch', { id, nombre });
    });

    requester.on('itemCostDetected', ({ id, nombre, cost }) =>
      this.io.emit('itemCostDetected', { id, nombre, cost })
    );

    requester.on('itemTotalDetected', ({ id, nombre, cantidad, precioTotal, ganancia }) =>
      this.io.emit('updateItemTotal', { id, nombre, cantidad, precioTotal, ganancia })
    );

    requester.on('updateStatus', ({ id, nombre, estado }) =>
      this.io.emit('updateItemStatus', { id, nombre, estado })
    );

    requester.on('purseUpdate', value => {
      this.currentPurse = value;
      this.io.emit('purseUpdate', { value });
    });

    requester.on('timerFinished', ({ id }) =>
      this.io.emit('timerFinished', { id })
    );

    requester.on('resetFinished', ({ id }) => {
      this.handleResetFinished(id)
    }
          
        );


    requester.on('cleanFilled', () => {
    console.log("🔄 [Reset]  limpiando estado Filled...");

    this.requesterQueue = [];
    // this.requesterOcupado = false;
    this.filledProcesados.clear();
    this.ultimoCantidad = {};
    this.ultimoTiempo = {};

    if (this.esperandoResolucion) {
        this.esperandoResolucion();
        this.esperandoResolucion = null;
    }
});

    requester.on('readyForFilled', ({ id, nombre, task, cantidad, tiempo, enMinutos }) => {
      //console.log(`🔹 [LOG] readyForFilled -> id:${id} "${nombre}" cantidad:${cantidad} tiempo:${tiempo}`);

      if (cantidad !== undefined) this.ultimoCantidad[id] = cantidad;
      if (tiempo !== undefined) this.ultimoTiempo[id] = tiempo;

      cantidad = cantidad ?? this.ultimoCantidad[id];
      tiempo = tiempo ?? this.ultimoTiempo[id];

      if (!cantidad || !tiempo || cantidad <= 0 || tiempo <= 0) {
        console.log(`⚠️ Valores inválidos para id:${id} "${nombre}" -> cantidad:${cantidad} tiempo:${tiempo}`);
        return;
      }

      if (this.filledProcesados.has(id)) {
        //console.log(`⚠️ id:${id} "${nombre}" ya está procesándose. Ignorando duplicado…`);
        return;
      }

      this.filledProcesados.add(id);

      this.requesterQueue.push({
        start: async () => {
          try {
            await task();
          } catch (err) {
            console.error(`❌ Error llenando id:${id} "${nombre}"`, err);
          }

          // Marcar como filled
          this.io.emit('updateItemStatus', { id, nombre, estado: 'filled' });
          this.filledProcesados.delete(id);

          // Reemitir itemAdded
          const nuevoId = Math.floor(Math.random() * 9999999) + 1;
          this.io.emit('itemAdded', { id: nuevoId, nombre, cantidad, tiempo });

          // Crear nuevo requester y asignarle todos los listeners
          const nuevoRequester = new ItemRequester(this.bot, nuevoId, nombre, cantidad, tiempo, enMinutos);
          nuevoRequester.panel = this;
          nuevoRequester.bindPanel(this);
          nuevoRequester.detectarMensajes();
          this.asignarListeners(nuevoRequester);

          this.requesterQueue.push({
            start: () =>
              new Promise(resolve => {
                nuevoRequester.once('finished', () => resolve());
                nuevoRequester.start();
              })
          });

          if (!this.requesterOcupado) this.procesarCola();
        }
      });

      if (!this.requesterOcupado) this.procesarCola();
    });
  }

  setupSockets() {
    this.io.on('connection', socket => {
    console.log('🖥️ Cliente conectado al panel web');

    // Enviar whitelist al cliente
    socket.emit("whitelistData", this.whitelist);

    // Actualización desde web
    socket.on("actualizarWhitelist", (newWL) => {
      this.whitelist = newWL;

      // actualizar solo la sección del usuario
      this.fullWhitelist[this.username] = newWL;

      fs.writeFileSync(
        this.whitelistPath,
        JSON.stringify(this.fullWhitelist, null, 2)
      );

      console.log(`📄 Whitelist actualizada para ${this.username}`);
      this.io.emit("whitelistData", newWL);
    });



    socket.on('solicitarNPCFlips', async () => {
      console.log('Cliente pidió datos de NPC Flips');
      try {
        const resultados = await this.skyblock.obtenerTop30NPCFlips();
        socket.emit('npcFlipsData', resultados);
      } catch (err) {
        console.error('Error al calcular NPC Flips:', err);
        socket.emit('npcFlipsData', []); // enviar array vacío en caso de error
      }
    });




            // 🔄 RESTART DEL SISTEMA DE REQUESTERS
      socket.on("restartItemSystem", () => {
        console.log("🔄 [PANEL] Se recibió restartItemSystem desde el cliente.");

        // ======================================================
        // 1️⃣ RESETEAR TODA LA LÓGICA
        // ======================================================
/*
        this.requesterQueue = [];
        this.requesterOcupado = false;
*/
        this.filledProcesados.clear();

        this.ultimoCantidad = {};
        this.ultimoTiempo = {};

        console.log("🔄 [PANEL] Sistema interno reseteado.");

        // ======================================================
        // 2️⃣ CREAR REQUESTER ESPECIAL "restart"
        // ======================================================

            console.log("🔄 [PANEL] Se recibió restartItemSystem desde el cliente.");

      // Crear requester especial "restart" que solo limpia al terminar
      const nuevoId = Date.now();
      const nombre = "restart";
      const cantidad = 1;
      const tiempo = 9999;
      const enMinutos = false;

      const nuevoRequester = new ItemRequester(
        this.bot,
        nuevoId,
        nombre,
        cantidad,
        tiempo,
        enMinutos
      );
      nuevoRequester.panel = this;
      nuevoRequester.bindPanel(this);
      nuevoRequester.detectarMensajes();
      this.asignarListeners(nuevoRequester);
      
      this.io.emit('itemAdded', { id: nuevoId, nombre, cantidad, tiempo });

      console.log("🚀 Requester 'restart' creado:", {
        id: nuevoRequester.id,
        nombre: nuevoRequester.customName,
        cantidad: nuevoRequester.cantidad
      });

      // Encolarlo al final
      this.requesterQueue.push({
        start: () => new Promise(async resolve => {
          nuevoRequester.once('finished', () => {
            // Limpiar la cola y resetear estados
            console.log("✅ Requester 'restart' terminado, limpiando cola");
            this.requesterQueue = [];
            this.requesterOcupado = false;
            this.filledProcesados.clear();
            this.ultimoCantidad = {};
            this.ultimoTiempo = {};

            resolve();
          });

          await nuevoRequester.start();
        })
      });

      if (!this.requesterOcupado) this.procesarCola();

      this.io.emit("itemSystemRestarted");



        // 4️⃣ Lanzar procesamiento
        //this.procesarSiguienteRequester();

        // ======================================================
        // 5️⃣ Avisar opcionalmente al frontend
        // ======================================================
        this.io.emit("itemSystemRestarted");
      });



      socket.emit('inventario', this.obtenerInventario());
      socket.on('actualizarInventario', () => socket.emit('inventario', this.obtenerInventario()));
      socket.on('enviarComando', texto => this.chat.enviar(texto));
      if (this.currentPurse !== null) socket.emit('purseUpdate', { value: this.currentPurse });

      socket.on('solicitarItem', ({ id, nombre, cantidad, tiempo, enMinutos }) => {
        if (!nombre || !cantidad) return;

        console.log("Se ha solicitado un item con ID: ", id);
        socket.emit('itemAdded', { id, nombre, cantidad, tiempo: enMinutos ? tiempo * 60 : tiempo });

        // Crear requester inicial y asignarle listeners
        const requester = new ItemRequester(this.bot, id, nombre, cantidad, tiempo, enMinutos);
        requester.panel = this;
        requester.bindPanel(this);
        nuevoRequester.detectarMensajes();
        this.asignarListeners(requester);

        this.requesterQueue.push({
          start: () =>
            new Promise(resolve => {
              requester.once('finished', () => resolve());
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
