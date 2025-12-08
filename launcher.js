const fs = require("fs");
const path = require("path");
const botModule = require("./bot"); 

const isPkg = typeof process.pkg !== "undefined";
const basePath = isPkg ? path.dirname(process.execPath) : __dirname;
const estadoPath = path.join(basePath, "estado.json");

let botInstance = null;

function inicializarEstado() {
  let estado = { webAbierta: false };

  if (fs.existsSync(estadoPath)) {
    try { estado = JSON.parse(fs.readFileSync(estadoPath, "utf8")); } 
    catch { console.error("Error leyendo estado.json, reiniciando…"); }
  }

  estado.webAbierta = false;
  estado.finished = false;
  fs.writeFileSync(estadoPath, JSON.stringify(estado, null, 2));
  return estado;
}

inicializarEstado();

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

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
    await delay(20000);
    await startBot();
  });
}

async function stopBot() {
  if (!botInstance) return; // ✅ Usar botInstance, no bot

  try {
    const estado = fs.existsSync(estadoPath) ? JSON.parse(fs.readFileSync(estadoPath)) : {};
    estado.finished = true;
    fs.writeFileSync(estadoPath, JSON.stringify(estado, null, 2));
  } catch (err) {
    console.error("Error escribiendo estado.json:", err);
  }

  await botModule.stopBot(); // Delega todo lo interno (chat, panel, listeners) a bot.js
  botInstance = null;

  console.log("Bot detenido.");
}

async function loopHorario() {
  while (true) {
    await delay(5400000);
    console.log("Reinicio horario...");
    await stopBot();
    await delay(40000);
    await startBot();
  }
}

process.on("SIGINT", async () => {
  console.log("Cerrando launcher…");
  await stopBot();
  process.exit(0);
});

(async () => {
  await startBot();
  loopHorario();
})();
