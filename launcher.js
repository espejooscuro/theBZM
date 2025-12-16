const fs = require("fs");
const path = require("path");
const botModule = require("./bot");

const isPkg = typeof process.pkg !== "undefined";
const basePath = isPkg ? path.dirname(process.execPath) : __dirname;
const estadoPath = path.join(basePath, "estado.json");

let botInstance = null;
let shortTimer = null;
let longTimer = null;
let isRestarting = false; // evita reinicios simultáneos

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ---------- constantes de timer ---------- */
const TEST_SHORT = 30 * 1000;
const TEST_LONG  = 60 * 1000;
const PROD_SHORT = 90 * 60 * 1000;
const PROD_LONG  = 16 * 60 * 60 * 1000;

/* ---------- estado ---------- */
function cargarEstado() {
  let estado = {};
  if (fs.existsSync(estadoPath)) {
    try { estado = JSON.parse(fs.readFileSync(estadoPath, "utf8")); } catch {}
  }
  estado.finished = false;
  fs.writeFileSync(estadoPath, JSON.stringify(estado, null, 2));
  return estado;
}

function guardarEstado(estado) {
  fs.writeFileSync(estadoPath, JSON.stringify(estado, null, 2));
}

/* ---------- bot ---------- */
async function startBot() {
  if (isRestarting) return;
  isRestarting = true;

  if (botInstance) {
    console.log("Bot ya corriendo, deteniéndolo antes de reiniciar...");
    await stopBot();
    await delay(5000); // espera mínima de 5 segundos
  }

  console.log("Iniciando bot…");
  botInstance = await botModule.startBot();

  botInstance.on("mensajeCritico", async () => {
    console.log("Evento crítico → reinicio bot");
    await startBot(); // reinicia solo el bot
  });

  botInstance.on("errorReset", async () => {
    console.log("Error detectado en bot.js → reinicio bot");
    await delay(10000);
    await startBot(); // reinicia solo el bot
  });

  botInstance.on("DupeReset", async () => {
    console.log("DupeReset → reinicio bot");
    await startBot(); // reinicia solo el bot
  });

  isRestarting = false;
}

async function stopBot() {
  if (!botInstance) return;

  botInstance.removeAllListeners();
  await botModule.stopBot();
  botInstance = null;
  console.log("Bot detenido completamente.");
}

/* ---------- timers ---------- */
function programarReinicios() {
  const estado = cargarEstado();
  const now = Date.now();
  const isTest = process.env.TEST_TIMER === "1"; // solo si TEST_TIMER="1"


  clearTimeout(shortTimer);
  clearTimeout(longTimer);

  const shortInterval = isTest ? TEST_SHORT : PROD_SHORT;
  const longInterval  = isTest ? TEST_LONG  : PROD_LONG;

  estado.nextShortRestart = now + shortInterval;
  estado.nextLongRestart  = now + longInterval;
  guardarEstado(estado);

  console.log("Reinicio corto en", shortInterval / 1000, "segundos (modo " + (isTest ? "TEST" : "PROD") + ")");
  console.log("Reinicio largo en", longInterval / 1000, "segundos (modo " + (isTest ? "TEST" : "PROD") + ")");

  shortTimer = setTimeout(() => {
  if (!isRestarting) startBot();
}, shortInterval);

longTimer = setTimeout(() => {
  if (!isRestarting) startBot();
}, longInterval);

}

/* ---------- signals ---------- */
process.on("SIGINT", async () => {
  console.log("Cerrando launcher…");
  await stopBot();
  process.exit(0);
});

/* ---------- main ---------- */
(async () => {
  await startBot();
  programarReinicios();
})();
