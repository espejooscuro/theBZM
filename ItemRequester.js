const EventEmitter = require('events');
const ChatListener = require('./ChatListener');
const ContainerInteractor = require('./ContainerInteractor');
const SkyBlockItem = require('./SkyBlockItem');
const InventoryListener = require('./InventoryListener');
const fs = require('fs');
const path = require('path');

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
    this.enPanico = false;
    this.minDelay = 150;
    this.maxDelay = 200;
    this.finishedCollecting = false;
    this.chat = new ChatListener(bot, {
      palabras: ['Connecting to', 'MiniEspe'],
      tipos: ['sistema']
    });

    this.container = new ContainerInteractor(bot);
    this.skyBlock = new SkyBlockItem();
    this.containerListener = new InventoryListener(bot);

    this.precioTotal = null;
    this.detectarMensajes();
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

  async checkPanic() {
    if (!this.enPanico) return;
    //console.log("🛑 MODO PÁNICO ACTIVADO — el bot se congela 1 minuto...");
    this.minDelay = this.minDelay + 400;
    this.maxDelay = this.maxDelay + 400;
    this.container.setDelay(this.minDelay, this.maxDelay);
    await this.esperar(60000);
    this.chat.enviar("/skyblock")
    await this.esperar(5000);
    this.chat.enviar("/warp garden")
    await this.esperar(5000);
    //console.log("🟢 MODO PÁNICO FINALIZADO");
    this.enPanico = false;
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
    for (const key in this.timers) {
      clearInterval(this.timers[key]?.interval);
      delete this.timers[key];
    }
    this.destroyed =true;
    // Marcar como terminado
    this.finishedCollecting = true;
    this.filledDisparado = true;
   
    // Quitar listeners de chat
    if (this.chat?.removeListeners) this.chat.removeListeners();
    
    // Quitar todos los listeners de EventEmitter
    this.removeAllListeners();

    // Opcional: cerrar contenedor si está abierto
    if (this.container?.cerrarContenedor) this.container.cerrarContenedor();
  
    //console.log(`🧹 ItemRequester "${this.customName}" destruido correctamente.`);
  } catch (err) {
    console.error("Error al destruir ItemRequester:", err);
  }
}

  limpiarNombre(itemName) {
  if (!itemName) return "";
  // Quitar códigos de color de Minecraft (§ + cualquier carácter)
  let limpio = itemName.replace(/§./g, '');
  // Quitar prefijos BUY / SELL
  limpio = limpio.replace(/^(BUY|SELL)\s+/i, '');
  // Quitar espacios al principio y final
  return limpio.trim();
}


  async start() {
    //console.log("Iniciando Requester..");
    
    //------------------------ RESTART -----------------------------
    
    
    if (this.customName == "restart") {
      console.log("=======================  Iniciando proceso de limpieza: Vaciando bazaar orders.. =======================");
      await this.esperar(1000);
      this.chat.enviar("/managebazaarorders");
      await this.esperar(1000);
    
      const items = this.containerListener.obtenerItemsValidos(); // todos los slots válidos
      const itemsINV = this.containerListener.obtenerItemsValidosInventario();
      const coincidencias = this.containerListener.compararItemsPorNombre(items, itemsINV);
      this.container.cerrarContenedor();
      await this.esperar(1400);
      //console.log("COINCIDENCIAS DEL INVENTARIO Y EL MANAGER:")
      //console.log(coincidencias)

      if (coincidencias.length > 0) {
        await this.esperar(400);
        this.chat.enviar("/boostercookie");
        await this.esperar(1000);
        for (const item of coincidencias ){
          if (this.destroyed) break;
          let name = this.limpiarNombre(item.nombreCustom);;
          await this.container.click({ contiene: name, tipo: 'inventario' });
          await this.esperar(1000);

        }
        //console.log("[ RESET ] Se ha terminado de limpiar el inventario")
        await this.esperar(1200);
        this.container.cerrarContenedor();
        await this.esperar(800);
        this.chat.enviar("/managebazaarorders");
      }

      await this.esperar(1000);


    for (const item of items) {
      if (this.destroyed) break;
  const slot = item.slot;
  const name = this.limpiarNombre(item.nombreCustom); // <-- usamos la versión limpia
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
      this.chat.enviar("/managebazaarorders");
      await this.esperar(1300);
    }

    const maxIntentos = 1000;
    let intentos = 0;

    if (!this.containerListener.existeItemEnContenedor({ contiene: name, tipo: "contenedor" })){
      //console.log(`⚠️No se ha encontrado el item. Muy probablemente ya haya sido procesado`);
        this.finishedCollecting = true;
    }

    while (this.containerListener.existeItemEnContenedor({ contiene: name, tipo: "contenedor" }) &&
          intentos < maxIntentos &&
          !this.containerListener.inventarioMayormenteLleno()) {
        
            if (this.destroyed) break;
      intentos++;
      //console.log(`🔹 Slot ${slot}: Intento ${intentos} de click`);
      await this.container.click({ contiene: name, tipo: 'contenedor' });
      //await this.esperar(250);
      await this.checkPanic();

      const ventana = this.containerListener.nombreContenedorAbierto();
      if (ventana === "order options" || this.containerListener.existeItemEnContenedor({ nombreCustom: "Cancel Order", tipo: "contenedor" })) {
        console.log(`⚠️ Slot ${slot}: Cancelando orden porque se abrió "Order options"`);
        await this.esperar(1200);
        await this.container.click({ nombreCustom: "Cancel Order", tipo: 'contenedor' });
        await this.checkPanic();
        this.finishedCollecting = true;
        break;
      }

                if (this.containerListener.inventarioMayormenteLleno()) {
            //console.log(`⚠️ [LOG] Inventario parece mayormente lleno. Comprobando de nuevo en 1 segundo para continuar...`);
            await this.esperar(250);
            if (this.containerListener.inventarioMayormenteLleno()) {
              //console.log(`⚠️ [LOG] Comprobación exitosa, Procediendo a vender los objetos...`);
            }
          }

          if (this.containerListener.existeItemEnContenedor({ nombreCustom: "Cancel Order", tipo: "contenedor" })) {
            console.log(`⚠️ [LOG] Contenedor "Order options" abierto, cancelando orden`);
              await this.esperar(1200);
              await this.container.click({ nombreCustom: "Cancel Order", tipo: 'contenedor' });
              await this.checkPanic();

              this.finishedCollecting = true;
          } 
          else if (!this.containerListener.existeItemEnContenedor({ contiene: name, tipo: "contenedor" })) {
            //console.log(`🔹 [AVISO] Parece que no se ha detectado más objetos, comprobando de nuevo en 1 segundo..`);
            await this.esperar(1200);
            if (!this.containerListener.existeItemEnContenedor({ contiene: name, tipo: "contenedor" })) {
              console.log(`🔹 [AVISO] No se ha encontrado nada después de 1 segundo, siguiendo con el proceso..`);
              this.finishedCollecting = true;
            }
            
          }
    }


    if (!this.containerListener.existeItemEnContenedor({ contiene: name, tipo: "contenedor" })) {
        console.log(`🔹 Item ${name}: No hay más items en este slot, siguiente slot`);
        this.finishedCollecting = true;
      }

    //console.log(`🔹 Item ${name}: Cerrando contenedor y enviando /boostercookie`);
    await this.container.cerrarContenedor();
    await this.esperar(1000);
    this.chat.enviar("/boostercookie");
    await this.esperar(1000);
    console.log(`Procesando venta de item ${name}...`);
    intentos = 0;
    
    if (!this.containerListener.existeItemEnContenedor({ contiene: name, tipo: 'inventario'})) console.log("Parece que no ha encontrado ningun objeto con ese nombre en el inventario..")

    while (this.containerListener.existeItemEnContenedor({ contiene: name, tipo: 'inventario'}) && intentos < maxIntentos) {
      if (this.destroyed) break;
      intentos++;
      //console.log(`🔹 [LOG] Intento ${intentos}: Click en inventario para "${name}"`);
      await this.container.click({ contiene: name, tipo: 'inventario' });
      await this.esperar(500);
      await this.checkPanic();
    }
  }
  
  console.log(`✅ Slot ${slot} con item ${name}: Reset completado`);
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

      this.chat.enviar(`/bz ${this.customName}`);
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
    const nombre = this.customName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const regexSetup = new RegExp(`Buy Order Setup!.*${nombre}`, 'i');
    const regexComplete = new RegExp(`your buy order.*${nombre}.*was filled!`, 'i');

    this.chat.onceMensajeContiene(
      /(You have 60 seconds to warp out!|You can't use this when the server is about to restart|Sending packets too fast!|A kick occurred)/i,
      () => {
        //console.log("⚠️ PANIC TRIGGER DETECTADO");
        this.enPanico = true;
      }
    );

    this.chat.onceMensajeContiene(regexSetup, (msg) => {
      const match = msg.mensaje.match(/for\s*([\d,.]+)\s*coins/i);
      if (match && match[1]) {
        this.precioTotal = match[1];
        this.emit('itemCostDetected', { id: this.id, nombre: this.customName, cost: this.precioTotal });
      }

      this.emit('updateStatus', { id: this.id, nombre: this.customName, estado: 'setup' });
      //console.log(`ItemRequester con id: ${this.id}, ha pasado a estado SETUP!`);

    });

    this.chat.onceMensajeContiene(/was filled/i, (msg) => {
      // Solo nos interesa emitir esto si este requester es el "restart"
      if (this.customName && this.customName.toLowerCase() === 'restart') {
        //console.log('🧹 [RESTART] Mensaje "was filled" detectado — emitiendo cleanFilled');
        this.esperar(1000);
        this.emit('cleanFilled');
      }
    });

    this.chat.onMensajeContiene("You have goods to claim on this order!", async () => {
      console.log(`ItemRequester con id: ${this.id}, parece que ha detectado más items para reclamar. Volviendo al bazaar para reclamarlos...`);
      await this.esperar(1000)
      this.finishedCollecting = false;
    })


    this.chat.onceMensajeContiene(regexComplete, async () => {
      const precioTotalNPC = await this.skyBlock.calcularPrecioTotal(this.customName, this.cantidad);
      const precioNum = Number(String(precioTotalNPC).replace(/,/g, '').replace(/coins/gi, '').trim());
      const precioSetupNum = Number(String(this.precioTotal || 0).replace(/,/g, '').trim());
      const ganancia = precioNum - precioSetupNum;
      //console.log(`ItemRequester con id: ${this.id}, ha pasado a estado FILLED!!!`);
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

      const filledTask = this.getFilledTask();
      this.emit('readyForFilled', {
        id: this.id,
        nombre: this.customName,
        cantidad: this.cantidad,
        tiempo: this.tiempoAviso,
        task: filledTask
      });
    });
  }

  getFilledTask() {
    const nombre = this.customName;
    const cantidad = this.cantidad;

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
          this.chat.enviar("/managebazaarorders");
          await this.esperar(1300);
      }

      if (!this.containerListener.existeItemEnContenedor({ nombreCustom: buyOrderName, tipo: "contenedor" })){
            //console.log(`⚠️No se ha encontrado el item. Muy probablemente ya haya sido procesado`);
              this.finishedCollecting = true;
          }

      //console.log(`📦 [LOG] Comprobando items en contenedor...`);
      let intentos = 0;
      const maxIntentos = 1000;

      while (this.containerListener.existeItemEnContenedor({ nombreCustom: buyOrderName, tipo: "contenedor" }) && intentos < maxIntentos && !this.containerListener.inventarioMayormenteLleno()) {
          intentos++;
          if (this.destroyed) break;
          //console.log(`🔹 [LOG] Intento ${intentos}: Click en "${buyOrderName}"`);

           await this.container.click({ nombreCustom: buyOrderName, tipo: 'contenedor' });
          //await this.esperar(250);
          await this.checkPanic();

          if (this.containerListener.nombreContenedorAbierto() === "order options") {
              console.log(`⚠️ [LOG] Contenedor "Order options" abierto, cancelando orden`);
              await this.esperar(1200);
              await this.container.click({ nombreCustom: "Cancel Order", tipo: 'contenedor' });
              await this.checkPanic();

              this.finishedCollecting = true;
          }
          

          if (this.containerListener.inventarioMayormenteLleno()) {
            console.log(`⚠️ [LOG] Inventario parece mayormente lleno. Comprobando de nuevo en 1 segundo para continuar...`);
            await this.esperar(500);
            if (this.containerListener.inventarioMayormenteLleno()) {
              console.log(`⚠️ [LOG] Comprobación exitosa, Procediendo a vender los objetos...`);
            }
          }

          if (this.containerListener.existeItemEnContenedor({ nombreCustom: "Cancel Order", tipo: "contenedor" })) {
            console.log(`⚠️ [LOG] Contenedor "Order options" abierto, cancelando orden`);
              await this.esperar(1200);
              await this.container.click({ nombreCustom: "Cancel Order", tipo: 'contenedor' });
              await this.checkPanic();

              this.finishedCollecting = true;
          } 
          else if (!this.containerListener.existeItemEnContenedor({ nombreCustom: buyOrderName, tipo: "contenedor" })) {
            console.log(`🔹 [AVISO] Parece que no se ha detectado más objetos, comprobando de nuevo en 1 segundo..`);
            await this.esperar(1200);
            if (!this.containerListener.existeItemEnContenedor({ nombreCustom: buyOrderName, tipo: "contenedor" })) {
              console.log(`🔹 [AVISO] No se ha encontrado nada después de 1 segundo, siguiendo con el proceso..`);
              this.finishedCollecting = true;
            }
            
          }
      }
      if (this.destroyed) break;
      //console.log(`🔹 [LOG] Cerrando contenedor después de procesar buy orders`);
      await this.container.cerrarContenedor();
      await this.esperar(1000);
      //console.log(`🔹 [LOG] Enviando /boostercookie`);
      this.chat.enviar("/boostercookie");
      await this.esperar(1000);

      intentos = 0;
      while (this.containerListener.existeItemEnContenedor({contiene: nombre, tipo: 'inventario'}) && intentos < maxIntentos) {
          intentos++;
          if (this.destroyed) break;
          //console.log(`🔹 [LOG] Intento ${intentos}: Click en inventario para "${nombre}"`);
          await this.container.click({ contiene: nombre, tipo: 'inventario' });
          await this.esperar(500);
          await this.checkPanic();

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

    //console.log(`🔄 [LOG] Preparando reencolado para "${this.customName}"`);
    //console.log(`🔹 [LOG] Datos para el nuevo requester -> cantidad: ${cantidadFinal}, tiempo: ${tiempoFinal}`);

    /*this.emit('readyForFilled', {
      nombre: this.customName,
      cantidad: cantidadFinal,
      tiempo: tiempoFinal,
      task: this.getFilledTask(cantidadFinal, tiempoFinal) // pasamos los valores finales
    }); */

    //console.log(`📤 [LOG] Evento 'readyForFilled' emitido para "${this.customName}"`);
}



  
        // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
      };
    }



    orderReset() {

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