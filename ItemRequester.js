const EventEmitter = require('events');
const ContainerInteractor = require('./ContainerInteractor');
const SkyBlockItem = require('./SkyBlockItem');
const InventoryListener = require('./InventoryListener');
const fs = require('fs');
const path = require('path');
const { text } = require('stream/consumers');

const basePath = process.pkg ? path.dirname(process.execPath) : __dirname;
const estadoPath = path.join(basePath, 'estado.json');

class ItemRequester extends EventEmitter {
  constructor(bot, id, customName, cantidad, tiempoAviso = 60, enMinutos = false) {
    super();
    this.destroyed = false;
    this.bot = bot;
    this.id = id;
    this.customName = customName;
    this.cantidad = cantidad;
    this.tiempoAviso = enMinutos ? tiempoAviso * 60 : tiempoAviso;
    this.timers = {};
    this.filledDisparado = false;
    this.minDelay = 200;
    this.maxDelay = 400;
    this.finishedCollecting = false;

    

    this.container = new ContainerInteractor(bot);
    this.skyBlock = new SkyBlockItem();
    this.containerListener = new InventoryListener(bot);

    this.precioTotal = null;
    this.container.setDelay(this.minDelay, this.maxDelay);

    this.startStopListener(); // 🔹 Iniciamos listener de stop
  }

  startStopListener() {
    this._checkStopInterval = setInterval(async () => {
      try {
        if (!fs.existsSync(estadoPath)) return;
        const estado = JSON.parse(fs.readFileSync(estadoPath));
        if (estado.finished) {
          console.log(`⚠️ ItemRequester ${this.id} detecta stop global. Deteniendo tareas...`);
          clearInterval(this._checkStopInterval);

          this.finishedCollecting = true;
          this.destroy();

          await new Promise(r => setTimeout(r, 1e9)); // delay infinito
        }
      } catch (err) {
        console.error('Error leyendo estado.json en ItemRequester:', err);
      }
    }, 1000);
  } 

  async esperar(ms) {
    const inicio = Date.now();
    while (Date.now() - inicio < ms) {
      await new Promise(r => setTimeout(r, 100));
    }
  }


  iniciarTimer() {
    let tiempoRestante = this.tiempoAviso;

    const intervalo = setInterval(() => {
      tiempoRestante--;

      if (tiempoRestante <= 0) {
        clearInterval(intervalo);
        
        this.emit('timerFinished', {
            id: this.id
          });

        if (!this.filledDisparado) {
          this.filledDisparado = true;

          const filledTask = this.getFilledTask();
          this.emit('readyForFilled', {
            id: this.id,
            nombre: this.customName,
            cantidad: this.cantidad,
            tiempo: this.tiempoAviso,
            task: filledTask
          });
        }
      }
    }, 1000);   
  }

  destroy() {
    try {
      // Limpiar todos los intervalos
      if (this.panel) {
        if (this._onStopAll) {
          this.panel.off('STOP_ALL_REQUESTERS', this._onStopAll);
          this._onStopAll = null;
        }
        if (this._onSendCmdAll) {
          this.panel.off('SEND_CMD_ALL', this._onSendCmdAll);
          this._onSendCmdAll = null;
        }
      }

      for (const key in this.timers) {
        clearInterval(this.timers[key]?.interval);
        delete this.timers[key];
      }

      this.destroyed = true;
      this.finishedCollecting = true;
      this.filledDisparado = true;

      this.removeAllListeners();

      if (this.container?.cerrarContenedor) this.container.cerrarContenedor();
    } catch (err) {
      console.error("Error al destruir ItemRequester:", err);
    }
  }


  limpiarNombre(itemName) {
    if (!itemName) return "";
    let limpio = itemName.replace(/§./g, ''); // quitar códigos de color
    limpio = limpio.replace(/^(BUY|SELL)\s+/i, ''); // quitar prefijos BUY/SELL
    limpio = limpio.replace(/\s*x\d+$/i, ''); // quitar " x64", " x59", etc.
    return limpio.trim();
}


  bindPanel(panel) {
  this.panel = panel;

  
  panel.once('STOP_ALL_REQUESTERS', this._onStopAll = () => {
    console.log(`🛑 Requester ${this.id} detenido por el panel`);
    this.destroy();
  }); 

}



  async start() {
    //console.log("Iniciando Requester..");
    
    //------------------------ RESTART -----------------------------
    
    
    if (this.customName == "restart") {
      console.log("=======================  Iniciando proceso de limpieza: Vaciando bazaar orders.. =======================");
      await this.esperar(1000);

      this.emit('sendCMD', { cmd: "/managebazaarorders" });

      await this.esperar(1000);
    
      // Obtener todos los items del contenedor
      const todosItems = this.containerListener.obtenerItemsValidos();

      // Filtrar solo los que están en la whitelist del usuario del panel
      const items = todosItems.filter(item => {
        const nombreLimpio = this.limpiarNombre(item.nombreCustom); // usar tu método
        return this.panel.whitelist[nombreLimpio]; // o this.whitelist si estás en Panel
      });

      console.log(items);

      const itemsINV = this.containerListener.obtenerItemsValidosInventario();
      const coincidencias = this.containerListener.compararItemsPorNombre(items, itemsINV);
      this.container.cerrarContenedor();
      await this.esperar(1400);
      //console.log("COINCIDENCIAS DEL INVENTARIO Y EL MANAGER:")
      //console.log(coincidencias)

      if (coincidencias.length > 0) {
        await this.esperar(400);
        this.emit('sendCMD', { cmd: "/boostercookie" });
        await this.esperar(1000);
        for (const item of coincidencias ){
          if (this.destroyed) break;
          let itemName = this.limpiarNombre(item.nombreCustom);
          await this.container.click({ contiene: itemName, tipo: 'inventario' });
          await this.esperar(1000);

        }
        //console.log("[ RESET ] Se ha terminado de limpiar el inventario")
        await this.esperar(1200);
        this.container.cerrarContenedor();
        await this.esperar(800);
        this.emit('sendCMD', { cmd: "/managebazaarorders" });
      }

      await this.esperar(1000);


    for (const item of items) {
      if (this.destroyed) break;
  const slot = item.slot;
  const itemName = this.limpiarNombre(item.nombreCustom); // <-- usamos la versión limpia
  //console.log(`🔹 Procesando item ${name} para reset de buy orders`);

  this.finishedCollecting = false;
  while (!this.finishedCollecting) {
    await this.esperar(1000);
    if (this.destroyed) break;
    const contenedorAbierto = this.containerListener.nombreContenedorAbierto() || "";

    if (!contenedorAbierto.toLowerCase().includes("your bazaar orders")) {
      //console.log(`⚠️ Item ${name}: Contenedor no abierto, cerrando y abriendo /managebazaarorders`);
      await this.container.cerrarContenedor();
      await this.esperar(1300);
      this.emit('sendCMD', { cmd: "/managebazaarorders" });
      await this.esperar(1300);
    }

    const maxIntentos = 1000;
    let intentos = 0;

    if (!this.containerListener.existeItemEnContenedor({ contiene: itemName, tipo: "contenedor" })){
      //console.log(`⚠️No se ha encontrado el item. Muy probablemente ya haya sido procesado`);
        this.finishedCollecting = true;
    }

    while (intentos < maxIntentos) {
      if (this.destroyed) break;

      // Chequeos de inventario y contenedor antes de intentar click
      if (this.containerListener.inventarioMayormenteLleno()) {
        const inicio = Date.now();
        while (this.containerListener.inventarioMayormenteLleno()) {
          if (Date.now() - inicio >= 3000) {
            console.log("⚠️ Inventario mayormente lleno durante más de 3s");
            this.finishedCollecting = true;
            break;
          }
          await this.esperar(50);
        }
        if (this.finishedCollecting) break; // salir del while principal
      }

      if (!this.containerListener.existeItemEnContenedor({ contiene: itemName, tipo: "contenedor" })) {
        const inicio = Date.now();
        while (!this.containerListener.existeItemEnContenedor({ contiene: itemName, tipo: "contenedor" })) {
          if (Date.now() - inicio >= 3000) {
            console.log("🔹 [AVISO] No se han detectado más objetos durante más de 3s");
            this.finishedCollecting = true;
            break;
          }
          await this.esperar(50);
        }
        if (this.finishedCollecting) break; // salir del while principal
      }

      // Aquí seguimos con el click normal
      intentos++;
      await this.container.click({ contiene: itemName, tipo: 'contenedor' });
      await this.esperar(300);

      const ventana = this.containerListener.nombreContenedorAbierto();

      if (ventana === "order options" ||
          this.containerListener.existeItemEnContenedor({ nombreCustom: "Cancel Order", tipo: "contenedor" })) {
        console.log(`⚠️ Slot ${slot}: Cancelando orden porque se abrió "Order options"`);
        await this.esperar(1200);
        await this.container.click({ nombreCustom: "Cancel Order", tipo: 'contenedor' });
        this.finishedCollecting = true;
        break;
      }
    }



    if (!this.containerListener.existeItemEnContenedor({ contiene: itemName, tipo: "contenedor" })) {
        console.log(`🔹 Item ${itemName}: No hay más items en este slot, siguiente slot`);
        this.finishedCollecting = true;
      }

    //console.log(`🔹 Item ${name}: Cerrando contenedor y enviando /boostercookie`);
    await this.container.cerrarContenedor();
    await this.esperar(1000);
    this.emit('sendCMD', { cmd: "/boostercookie" });
    await this.esperar(1000);
    console.log(`Procesando venta de item ${itemName}...`);
    // Obtener todos los items válidos del contenedor o inventario
    // 1️⃣ Obtener todos los items del inventario
    const todosItemsInventario = this.containerListener.obtenerItemsValidosInventario();

// Comprobaciones de seguridad
if (!this.panel || !this.panel.whitelist) {
    console.error("❌ Panel o whitelist no definido");
} else {
    const itemsParaClick = todosItemsInventario.filter(item => {
        if (!item || !item.nombreCustom) return false;
        const nombreLimpio = this.limpiarNombre(item.nombreCustom);
        return !!this.panel.whitelist[nombreLimpio]; // forzar boolean
    });

    console.log("📦 Items en inventario filtrados por whitelist:", itemsParaClick.map(i => this.limpiarNombre(i.nombreCustom)));

    for (const item of itemsParaClick) {
        const itemName = this.limpiarNombre(item.nombreCustom);
        let intentos = 0;

        while (this.containerListener.existeItemEnContenedor({ contiene: itemName, tipo: 'inventario' }) && intentos < maxIntentos) {
            if (this.destroyed) break;

            await this.container.click({ contiene: itemName, tipo: 'inventario' });
            await this.esperar(250);

            intentos++;
        }

        console.log(`✅ Item ${itemName}: procesado del inventario`);
    }
}



  }
  
  console.log(`✅ Slot ${slot} con item ${itemName}: Reset completado`);
}


      console.log("✅ Todos los slots procesados para reset");
      this.emit('itemSearchFail', { id: this.id, nombre: this.customName });

      // Emitimos que terminó el reset y destruimos la instancia si es necesario
      this.emit('resetFinished', { id: this.id });
      this.emit('finished');
      this.destroy();
      return; // terminamos la ejecución de start
    }

//_____________________________________________


    try {
      const comprar = await this.skyBlock.isProfitable(this.customName);
      if (!comprar) {
        this.emit('itemSearchFail', { id: this.id, nombre: this.customName });
        console.log("Fallo en el ItemRequester con ID (No hay suficiente profit): ", this.id)
        this.container.cerrarContenedor();
        await this.esperar(300);
        this.emit('finished');
        this.destroy();
        return;
      }

      await this.container.cerrarContenedor();
      await this.esperar(1000);

      this.emit('sendCMD', { cmd: `/bz ${this.customName}` });
      await this.esperar(1000);

      const itemClick = await this.container.click({ nombreCustom: this.customName });
      if (!itemClick) {
        this.emit('itemSearchFail', { id: this.id, nombre: this.customName });
        //console.log("Fallo en el ItemRequester con ID: ", this.id)
        this.container.cerrarContenedor();
        await this.esperar(1500);
        this.emit('finished');
        this.destroy();
        return;
      } else {
        //console.log(
        //"ENVIANDO UN PAQUETE PARA CONTINUAR CON EL OBJETO DE LA TARJETA!!!! ID: ", this.id)
        //console.log(
        //"el nombre del ItemRequester es: ", this.customName)
        this.emit('itemSearchFound', { id: this.id, nombre: this.customName });
        this.iniciarTimer();
      }

      await this.esperar(1000);
      await this.container.click({ nombreCustom: "Create Buy Order", tipo: 'contenedor', slot: 15 });
      await this.esperar(1000);
      await this.container.click({ nombreCustom: "Custom Amount", tipo: 'contenedor', slot: 16 });
      await this.esperar(2000);
      this.container.interactuarConSeñal(this.cantidad);
      await this.esperar(2000);
      await this.container.click({ nombreCustom: "Top Order +0.1", tipo: 'contenedor' });
      await this.esperar(1000);
      await this.container.click({ nombreCustom: "Buy Order", tipo: 'contenedor' });

      this.emit('finished');
      this.emit('itemBought', {nombre: this.customName});
    } catch (err) {
      console.error(`Error en ItemRequester para "${this.customName}":`, err);
      this.emit('finished');
      
    }
  }

  detectarMensajes() {
    if (!this.panel) return;

    const nombre = this.customName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const regexSetup = new RegExp(`Buy Order Setup!.*${nombre}`, 'i');
    const regexComplete = new RegExp(`your buy order.*${nombre}.*was filled!`, 'i');

    this.panel.on('CHAT_MESSAGE', async (msg) => {
    const texto = msg.mensaje;

    if (texto.includes("co-op")) return;
    // SETUP
    if (regexSetup.test(texto)) {
      const match = texto.match(/for\s*([\d,.]+)\s*coins/i);
      if (match?.[1]) {
        this.precioTotal = match[1];
        this.emit('itemCostDetected', {
          id: this.id,
          nombre: this.customName,
          cost: this.precioTotal
        });
      }

      this.emit('updateStatus', {
        id: this.id,
        nombre: this.customName,
        estado: 'setup'
      });
    }

    // RESTART
    if (
      /was filled/i.test(texto) &&
      this.customName?.toLowerCase() === 'restart'
    ) {
      await this.esperar(1000);
      this.emit('cleanFilled');
    }

    // GOODS TO CLAIM
    if (/You have goods to claim on this order!/i.test(texto)) {
      await this.esperar(200);
      this.finishedCollecting = false;
    }

    // FILLED
    if (regexComplete.test(texto)) {
      const precioTotalNPC = await this.skyBlock.calcularPrecioTotal(
        this.customName,
        this.cantidad
      );

      const precioNum = Number(
        String(precioTotalNPC).replace(/,/g, '').replace(/coins/gi, '').trim()
      );
      const precioSetupNum = Number(
        String(this.precioTotal || 0).replace(/,/g, '').trim()
      );

      const ganancia = precioNum - precioSetupNum;

      this.emit('itemTotalDetected', {
        id: this.id,
        nombre: this.customName,
        cantidad: this.cantidad,
        precioTotal: precioNum,
        ganancia
      });

      this.emit('updateStatus', {
        id: this.id,
        nombre: this.customName,
        estado: 'setup_complete'
      });

      this.emit('readyForFilled', {
        id: this.id,
        nombre: this.customName,
        cantidad: this.cantidad,
        tiempo: this.tiempoAviso,
        task: this.getFilledTask()
      });
    }
  });
}


  getFilledTask() {
    const nombre = this.customName;
    const cantidad = this.cantidad;
    let itemName = this.limpiarNombre(this.customName);
    return async () => {

      // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
      // 👉 AQUÍ dentro puedes cambiar lo que quieras 👈
      // Esta es la parte que controla lo que hace la tarea de "filled".
      // Puedes borrar TODO el contenido entre estas marcas y poner tu propia lógica.
      
      
      const buyOrderName = `BUY ${nombre}`;

      //console.log(`🚀 [LOG] Iniciando tarea de filled para ${nombre} con id ${this.id}`);


while (!this.finishedCollecting) {
      if (this.destroyed) break;

      await this.esperar(1000);
      //console.log(`⏱️ [LOG] Espera inicial de 1s completada`);

      let contenedorAbierto = this.containerListener.nombreContenedorAbierto() || "";
      //console.log(`📦 [LOG] Contenedor abierto inicialmente: "${contenedorAbierto}"`);

      if (!contenedorAbierto.toLowerCase().includes("your bazaar orders")) {
          //console.log(`⚠️ [LOG] No está abierto "Your Bazaar Orders", cerrando contenedor si hay alguno...`);
          await this.container.cerrarContenedor();
          await this.esperar(1300);
          //console.log(`🔹 [LOG] Enviando comando /managebazaarorders`);
          this.emit('sendCMD', { cmd: "/managebazaarorders" });
          await this.esperar(1300);
      }

      if (!this.containerListener.existeItemEnContenedor({ nombreCustom: buyOrderName, tipo: "contenedor" })){
            //console.log(`⚠️No se ha encontrado el item. Muy probablemente ya haya sido procesado`);
              this.finishedCollecting = true;
          }

      //console.log(`📦 [LOG] Comprobando items en contenedor...`);
      let intentos = 0;
      const maxIntentos = 1000;

      while (intentos < maxIntentos) {
      if (this.destroyed) break;

      // Chequeos de inventario y contenedor antes de intentar click
      if (this.containerListener.inventarioMayormenteLleno()) {
        const inicio = Date.now();
        while (this.containerListener.inventarioMayormenteLleno()) {
          if (Date.now() - inicio >= 3000) {
            console.log("⚠️ Inventario mayormente lleno durante más de 3s");
            this.finishedCollecting = true;
            break;
          }
          await this.esperar(50);
        }
        if (this.finishedCollecting) break; // salir del while principal
      }

      if (!this.containerListener.existeItemEnContenedor({ contiene: itemName, tipo: "contenedor" })) {
        const inicio = Date.now();
        while (!this.containerListener.existeItemEnContenedor({ contiene: itemName, tipo: "contenedor" })) {
          if (Date.now() - inicio >= 3000) {
            console.log("🔹 [AVISO] No se han detectado más objetos durante más de 3s");
            this.finishedCollecting = true;
            break;
          }
          await this.esperar(50);
        }
        if (this.finishedCollecting) break; // salir del while principal
      }

      // Aquí seguimos con el click normal
      intentos++;
      await this.container.click({ contiene: itemName, tipo: 'contenedor' });
      await this.esperar(300);

      const ventana = this.containerListener.nombreContenedorAbierto();

      if (ventana === "order options" ||
          this.containerListener.existeItemEnContenedor({ nombreCustom: "Cancel Order", tipo: "contenedor" })) {
        await this.esperar(1200);
        await this.container.click({ nombreCustom: "Cancel Order", tipo: 'contenedor' });
        this.finishedCollecting = true;
        break;
      }
    }


      if (this.destroyed) break;
      //console.log(`🔹 [LOG] Cerrando contenedor después de procesar buy orders`);
      await this.container.cerrarContenedor();
      await this.esperar(1000);
      this.emit('sendCMD', { cmd: "/boostercookie" });
      await this.esperar(1000);

const todosItemsInventario = this.containerListener.obtenerItemsValidosInventario();

// Comprobaciones de seguridad
if (!this.panel || !this.panel.whitelist) {
    console.error("❌ Panel o whitelist no definido");
} else {
    const itemsParaClick = todosItemsInventario.filter(item => {
        if (!item || !item.nombreCustom) return false;
        const nombreLimpio = this.limpiarNombre(item.nombreCustom);
        return !!this.panel.whitelist[nombreLimpio]; // forzar boolean
    });

    console.log("📦 Items en inventario filtrados por whitelist:", itemsParaClick.map(i => this.limpiarNombre(i.nombreCustom)));

    for (const item of itemsParaClick) {
        const itemName = this.limpiarNombre(item.nombreCustom);
        let intentos = 0;

        while (this.containerListener.existeItemEnContenedor({ contiene: itemName, tipo: 'inventario' }) && intentos < maxIntentos) {
            if (this.destroyed) break;

            await this.container.click({ contiene: itemName, tipo: 'inventario' });
            await this.esperar(250);

            intentos++;
        }

        console.log(`✅ Item ${itemName}: procesado del inventario`);
    }
}



        await this.container.cerrarContenedor();
        await this.esperar(1000);
        this.emit('sendCMD', { cmd: "/managebazaarorders" });
        await this.esperar(1000);
        if (this.containerListener.existeItemEnContenedor({ nombreCustom: buyOrderName, tipo: "contenedor" })){
            //console.log(`⚠️No se ha encontrado el item. Muy probablemente ya haya sido procesado`);
              this.finishedCollecting = false;
              await this.esperar(1200);
              console.log("Siguen habiendo objetos para reclamar...")
          }
      //console.log(`🔹 [LOG] Espera final de 400ms antes de cerrar contenedor`);
      await this.esperar(1200);
      await this.container.cerrarContenedor();
}


      this.filledDisparado = false;
      this.destroy();
      const cantidadFinal = this.cantidad || 0; // cantidad que realmente se procesó
      const tiempoFinal = this.tiempoAviso || 60; // tiempo restante o predeterminado

console.log(`✅ [LOG] Marcando item "${nombre}" como filled`);
this.emit('updateItemStatus', {id: this.id, nombre: this.customName, estado: 'filled' });

// Reencolado (solo prepara los datos)
if (!this._yaReencolado) {
    this._yaReencolado = true;
}



  
        // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
      };
    }

}

module.exports = ItemRequester;



//PROBLEMONNNNNNNNNNNNNNNNNNNNN: El mensaje "You have goods to claim on this order!" es detectado por todos los requesters!!!!!!


/* 

POR HACER:

Si esta uno en rojo y todavia no han pasado menos de 1 minuto, el boton esta apagado.
Si esta en rojo despues de 30 segundos se descarta y se manda un error.


Poder usar 2 al mismo tiempo con el mismo item. 

VENDERLO
*/

//You have goods to claim on this order!