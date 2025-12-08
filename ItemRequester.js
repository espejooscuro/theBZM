const EventEmitter = require('events');
const ChatListener = require('./ChatListener');
const ContainerInteractor = require('./ContainerInteractor');
const SkyBlockItem = require('./SkyBlockItem');
const InventoryListener = require('./InventoryListener');
class ItemRequester extends EventEmitter {
  constructor(bot, customName, cantidad, tiempoAviso = 60, enMinutos = false) {
    super();
    this.bot = bot;
    this.customName = customName;
    this.cantidad = cantidad;
    this.tiempoAviso = enMinutos ? tiempoAviso * 60 : tiempoAviso;

    this.chat = new ChatListener(bot, {
      palabras: ['Connecting to', 'MiniEspe'],
      tipos: ['sistema']
    });

    this.container = new ContainerInteractor(bot);
    this.skyBlock = new SkyBlockItem();
    this.containerListener = new InventoryListener(bot)

    this.precioTotal = null;
    this.detectarMensajes();
  }

  async esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async start() {
    try {
      await this.container.cerrarContenedor();
      await this.esperar(300);
      // Ejecuta la secuencia de clicks sin bloquear la cola
      this.chat.enviar(`/bz ${this.customName}`);
      await this.esperar(1000);

      const itemClick = await this.container.click({ nombreCustom: this.customName });
      if (!itemClick) {
        this.emit('itemSearchFail', { nombre: this.customName });
        this.container.cerrarContenedor();
        await this.esperar(200);
        this.emit('finished'); // ya termina aquí
        return;
      } else {
        this.emit('itemSearchFound', { nombre: this.customName });
      }

      await this.esperar(1000);
      await this.container.click({ nombreCustom: "Create Buy Order", tipo: 'contenedor', slot: 15 });
      await this.esperar(500);
      await this.container.click({ nombreCustom: "Custom Amount", tipo: 'contenedor', slot: 16 });
      await this.esperar(500);
      this.container.interactuarConSeñal(this.cantidad);
      await this.esperar(500);
      await this.container.click({ nombreCustom: "Top Order +0.1", tipo: 'contenedor' });
      await this.esperar(500);
      await this.container.click({ nombreCustom: "Buy Order", tipo: 'contenedor' });

      // ¡Aquí ya no bloqueamos!
      this.emit('finished'); // libera la cola inmediatamente
    } catch (err) {
      console.error(`Error en ItemRequester para "${this.customName}":`, err);
      this.emit('finished'); // libera la cola aunque falle
    }
  }

  detectarMensajes() {
    const nombre = this.customName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexSetup = new RegExp(`Buy Order Setup!.*${nombre}`, 'i');
    const regexComplete = new RegExp(`your buy order.*${nombre}.*was filled!`, 'i');

    this.chat.onMensajeContiene(regexSetup, (msg) => {
      const match = msg.mensaje.match(/for\s*([\d,.]+)\s*coins/i);
      if (match && match[1]) {
        this.precioTotal = match[1];
        this.emit('itemCostDetected', { nombre: this.customName, cost: this.precioTotal });
      }
      this.emit('updateStatus', { nombre: this.customName, estado: 'setup' });
    });

    this.chat.onMensajeContiene(regexComplete, async () => {
  console.log(`🎉 Orden completada para "${this.customName}"`);

  // Calculamos ganancias y total (igual que antes)
  const precioTotalNPC = await this.skyBlock.calcularPrecioTotal(this.customName, this.cantidad);
  const precioNum = Number(String(precioTotalNPC).replace(/,/g, '').replace(/coins/gi, '').trim());
  const precioSetupNum = Number(String(this.precioTotal || 0).replace(/,/g, '').trim());
  const ganancia = precioNum - precioSetupNum;

  // Emitimos info al frontend
  this.emit('itemTotalDetected', {
    nombre: this.customName,
    cantidad: this.cantidad,
    precioTotal: precioNum,
    ganancia
  });

  // Emitimos estado intermedio
  this.emit('updateStatus', { nombre: this.customName, estado: 'setup_complete' });

  // 🚨 En vez de ejecutar la tarea, construimos la tarea y la emitimos para que Panel la encole
  const filledTask = this.getFilledTask();
  // Emitimos el nombre y la función-task. Panel recibirá {nombre, task}
  this.emit('readyForFilled', { nombre: this.customName, task: filledTask });
});

  }





  // Dentro de ItemRequester

// 1) Método que crea la tarea de filled (se ejecutará cuando Panel la llame)
  getFilledTask() {
    const nombre = this.customName;

    // devolvemos una función async que, al invocarla, hará el trabajo
    return async () => {

      // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
      // 👉 AQUÍ dentro puedes cambiar lo que quieras 👈
      // Esta es la parte que controla lo que hace la tarea de "filled".
      // Puedes borrar TODO el contenido entre estas marcas y poner tu propia lógica.
      const buyOrderName = `BUY ${nombre}`;


      console.log(`🚀 Iniciando tarea de filled para ${nombre}`);


      // Espera correctamente
      await this.esperar(1000);

      const contenedorAbierto = this.containerListener.nombreContenedorAbierto() || "";
      if (!contenedorAbierto.includes("your bazaar orders")) {
          await this.container.cerrarContenedor();
          await this.esperar(800);
          this.chat.enviar("/bz");
          await this.esperar(1000);
          console.log("Contenedor abierto:", this.containerListener.nombreContenedorAbierto());
          await this.container.click({ nombreCustom: "Manage Orders", tipo: 'contenedor' });
          console.log("Contenedor abierto:", this.containerListener.nombreContenedorAbierto());
          await this.esperar(1000);
      }

      console.log("Contenedor abierto:", this.containerListener.nombreContenedorAbierto());

      let intentos = 0;
      const maxIntentos = 20;
      while (this.containerListener.existeItemEnContenedor({ nombreCustom: buyOrderName, tipo: "contenedor" }) && intentos < maxIntentos) {
          intentos++;
          await this.container.click({ nombreCustom: buyOrderName, tipo: 'contenedor' });
          await this.esperar(50);

          if (this.containerListener.nombreContenedorAbierto() === "order options") {
              await this.esperar(400);
              await this.container.click({ nombreCustom: "Cancel Order", tipo: 'contenedor' });
              await this.esperar(600);
          }
      }


      

      this.emit('updateItemStatus', { nombre, estado: 'filled' });

      

      // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
      // 👉 No borres nada fuera de este bloque 👈
      // Lo que está por fuera (return async () => { ... }) es lo que
      // permite al Panel ejecutar esta tarea más tarde en la cola.

    };
  }
}

module.exports = ItemRequester;




/* 

POR HACER:

Si esta uno en rojo y todavia no han pasado menos de 1 minuto, el boton esta apagado.
Si esta en rojo despues de 30 segundos se descarta y se manda un error.


Poder usar 2 al mismo tiempo con el mismo item. 

VENDERLO
*/