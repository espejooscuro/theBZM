const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

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
let nextTimeout = null;

const TEST_SHORT = 30 * 1000;
const TEST_LONG  = 60 * 1000;
const PROD_SHORT = 90 * 60 * 1000;
const PROD_LONG  = 16 * 60 * 60 * 1000;

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
      await delay(5000);
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

function programarReinicio() {
  const isTest = process.env.TEST_TIMER === "1";
  const shortInterval = isTest ? TEST_SHORT : PROD_SHORT;
  const longInterval  = isTest ? TEST_LONG  : PROD_LONG;

  const now = Date.now();

  // Elegimos cuál intervalo usar: largo prioriza sobre corto
  const nextInterval = longInterval < shortInterval ? longInterval : shortInterval;

  nextTimeout = setTimeout(async () => {
    console.log("⏰ Reiniciando bot por temporizador...");
    killBot();
    startBot();
    programarReinicio(); // reprograma el siguiente reinicio
  }, nextInterval);
}

process.on("SIGINT", () => {
  clearTimeout(nextTimeout);
  killBot();
  process.exit(0);
});

// inicio
startBot();
programarReinicio();
