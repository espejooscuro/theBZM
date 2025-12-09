const fs = require("fs");
const path = require("path");
const botModule = require("./bot"); 

const isPkg = typeof process.pkg !== "undefined";
const basePath = isPkg ? path.dirname(process.execPath) : __dirname;
const estadoPath = path.join(basePath, "estado.json");

let botInstance = null;

/**
 * Inicializa el archivo de estado del bot.
 * @returns {Object} El estado inicial.
 */
function inicializarEstado() {
  let estado = { webAbierta: false };

  if (fs.existsSync(estadoPath)) {
    try { 
      estado = JSON.parse(fs.readFileSync(estadoPath, "utf8")); 
    } catch { 
      console.error("Error leyendo estado.json, reiniciando…"); 
    }
  }

  estado.webAbierta = false;
  estado.finished = false;
  fs.writeFileSync(estadoPath, JSON.stringify(estado, null, 2));
  return estado;
}

inicializarEstado();

/**
 * Retorna una promesa que se resuelve después de un tiempo.
 * @param {number} ms - Milisegundos a esperar.
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

/**
 * Inicia el bot.
 */
async function startBot() {
  if (botInstance) {
    console.log("Bot ya está corriendo. Deteniendo antes de iniciar...");
    await stopBot();
  }

  console.log("Iniciando bot…");
  botInstance = await botModule.startBot(); // botInstance ES el bot real

  // Reiniciamos finished en estado.json
  const estado = fs.existsSync(estadoPath) ? JSON.parse(fs.readFileSync(estadoPath)) : {};
  estado.finished = false;
  fs.writeFileSync(estadoPath, JSON.stringify(estado, null, 2));

  // Suscribirse al evento crítico directamente en el bot
  botInstance.on('mensajeCritico', async (registro) => {
    console.log('Launcher recibe aviso de mensaje crítico:', registro.mensaje);
    await stopBot();
    await delay(100000);
    await startBot();
  });


  botInstance.on('DupeReset', async() => {
    await stopBot();
    await delay(100000);
    await startBot();
  });

}

  

/**
 * Detiene el bot.
 */
async function stopBot() {
  if (!botInstance) return;

  try {
    const estado = fs.existsSync(estadoPath) ? JSON.parse(fs.readFileSync(estadoPath)) : {};
    estado.finished = true;
    fs.writeFileSync(estadoPath, JSON.stringify(estado, null, 2));
  } catch (err) {
    console.error("Error escribiendo estado.json:", err);
  }

  await botModule.stopBot();
  botInstance = null;
  console.log("Bot detenido.");
}

/**
 * Reinicia el bot cada 16 horas y lo vuelve a encender después de 8 horas.
 */
async function cicloReinicioProgramado() {
  while (true) {
    console.log("Bot seguirá activo por 16 horas...");
    await delay(16 * 60 * 60 * 1000); // 16 horas
    console.log("Deteniendo bot por ciclo programado...");
    await stopBot();

    console.log("Bot apagado por 8 horas...");
    await delay(8 * 60 * 60 * 1000); // 8 horas
    console.log("Volviendo a iniciar bot tras ciclo programado...");
    await startBot();
  }
}

/**
 * Ciclo para reinicios más cortos o eventos especiales (puede quedar opcional)
 */
async function loopHorario() {
  while (true) {
    await delay(5400000); // 1h30min
    console.log("Reinicio horario...");
    await stopBot();
    await delay(120000);
    await startBot();
  }
}

// Captura de cierre manual
process.on("SIGINT", async () => {
  console.log("Cerrando launcher…");
  await stopBot();
  process.exit(0);
});

// Inicio del bot y de los ciclos
(async () => {
  await startBot();
  cicloReinicioProgramado(); // ciclo 16h/8h
  loopHorario(); // opcional, si quieres reinicios cortos
})();
