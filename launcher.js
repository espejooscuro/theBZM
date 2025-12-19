const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Lanzando BZM Launcher (ejecutable principal). No ejecutes el bot manualmente.");

const isPkg = typeof process.pkg !== "undefined";
const basePath = isPkg ? path.dirname(process.execPath) : __dirname;
const botPath = path.join(basePath, process.platform === "win32" ? "bzm-bot.exe" : "bzm-bot");

const EXIT_CODES = {
  MENSAJE_CRITICO: 10,
  ERROR_RESET: 11,
  DUPE_RESET: 12
};

let botProcess = null;
let isRestarting = false;
let shortTimeout = null;
let longTimeout = null;
let longRestarting = false; // Flag para reinicio largo activo

const TEST_SHORT = 30 * 1000;       // 30s
const TEST_LONG  = 60 * 1000;       // 1min
const PROD_SHORT = 90 * 60 * 1000;  // 1h 30min
const PROD_LONG  = 16 * 60 * 60 * 1000; // 16h

const isTest = process.env.TEST_TIMER === "1";
const SHORT_INTERVAL = isTest ? TEST_SHORT : PROD_SHORT;
const LONG_INTERVAL  = isTest ? TEST_LONG  : PROD_LONG;

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function startBot() {
  if (isRestarting) return;
  isRestarting = true;

  botProcess = spawn(botPath, [], { stdio: "inherit" });

  botProcess.on("exit", async code => {
    isRestarting = false;

    if (
      code === EXIT_CODES.MENSAJE_CRITICO ||
      code === EXIT_CODES.ERROR_RESET ||
      code === EXIT_CODES.DUPE_RESET
    ) {
      console.log("🔄 Reiniciando bot por evento crítico...");
      await delay(5000); // espera 5s antes de reiniciar
      startBot();
    }
  });
}

function killBot() {
  if (botProcess) {
    botProcess.kill("SIGKILL");
    botProcess = null;
  }
}

// Reinicio corto: espera entre apagar y encender
function programarReinicioCorto() {
  clearTimeout(shortTimeout);
  shortTimeout = setTimeout(async () => {
    if (longRestarting) {
      console.log("⏳ Reinicio corto saltado porque hay reinicio largo activo");
      programarReinicioCorto();
      return;
    }

    console.log(`⏰ Reinicio corto ejecutándose (apagando bot, espera ${isTest ? "5s" : "5s real"})...`);
    killBot();
    await delay(5000);
    startBot();
    programarReinicioCorto();
  }, SHORT_INTERVAL);
}

// Reinicio largo: espera entre apagar y encender
function programarReinicioLargo() {
  clearTimeout(longTimeout);
  longTimeout = setTimeout(async () => {
    longRestarting = true;
    console.log(`⏰ Reinicio largo ejecutándose (apagando bot, espera ${isTest ? "10s" : "8h"})...`);
    killBot();
    await delay(isTest ? 10 * 1000 : 8 * 60 * 60 * 1000);
    startBot();
    longRestarting = false;
    programarReinicioLargo();
  }, LONG_INTERVAL);
}

process.on("SIGINT", () => {
  clearTimeout(shortTimeout);
  clearTimeout(longTimeout);
  killBot();
  process.exit(0);
});

// inicio
startBot();
programarReinicioCorto();
programarReinicioLargo();
