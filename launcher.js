const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { logmc } = require("./logger");

console.log("🚀 BZM Multi Launcher");

const basePath = path.dirname(process.execPath);
const botPath = process.platform === "win32"
  ? path.join(basePath, "bzm-bot.exe")
  : path.join(basePath, "bzm-bot");

const cuentasPath = path.join(basePath, "cuentas.json");
if (!fs.existsSync(cuentasPath)) {
  fs.writeFileSync(cuentasPath, JSON.stringify([], null, 2));
  logmc("📝 cuentas.json creado. Añade tus cuentas y reinicia");
  process.exit(0);
}

const cuentas = JSON.parse(fs.readFileSync(cuentasPath));
const delay = ms => new Promise(r => setTimeout(r, ms));

class BotController {
  constructor({ username, proxy, token }, port) {
    this.username = username;
    this.proxy = proxy || null;
    this.token = token || null;
    this.port = port;
    this.process = null;
    this.resetLongActive = false;
    this.schedulerStarted = false;
    this.pendingReset = false;
  }

  start() {
    return new Promise(resolve => {
      logmc(`▶ Lanzando bot ${this.username} ${this.proxy ? "(proxy)" : ""}`);

      this.process = spawn(botPath, [], {
        stdio: ["ignore", "pipe", "pipe"],
        env: {
          ...process.env,
          BOT_USERNAME: this.username,
          BOT_PORT: String(this.port),
          ...(this.proxy ? { BOT_PROXY: this.proxy } : {}),
          ...(this.token ? { BOT_TOKEN: JSON.stringify(this.token) } : {})
        },
        detached: process.platform !== "win32"
      });

      if (process.platform !== "win32") this.process.unref();

      this.process.stdout.on("data", async data => {
        const msg = data.toString();
        process.stdout.write(`[${this.username}] ${msg}`);

        // Detectar login exitoso
        if (msg.includes("Welcome to Hypixel SkyBlock!")) {
          resolve();
        }

        // Mensajes críticos para reiniciar
        const criticalPatterns = [
          /restart/i,
          /Limbo/i,
          /Sending packets too fast/i,
          /server will restart soon/i,
          /Game Update/i
        ];

        if (criticalPatterns.some(rx => rx.test(msg)) && !this.pendingReset) {
          this.pendingReset = true;
          console.log(`⚠️ [${this.username}] Mensaje crítico detectado, reiniciando bot...`);
          await this.resetBot();
          this.pendingReset = false;
        }
      });

      this.process.stderr.on("data", data =>
        process.stderr.write(`[${this.username} ERROR] ${data}`)
      );

      this.process.on("exit", code => {
        logmc(`🔌 [${this.username}] Proceso terminó con código: ${code}`);
        if ([10, 11, 12].includes(code)) {
          logmc(`🔄 [${this.username}] Reinicio por código ${code}`);
          setTimeout(() => this.start(), 5000);
        }
      });

      if (!this.schedulerStarted) {
        this.initScheduler();
        this.schedulerStarted = true;
      }
    });
  }

  kill() {
    if (this.process) {
      this.process.kill("SIGKILL");
      this.process = null;
    }
  }

  async resetBot() {
  // Delay aleatorio entre 30s y 3min antes de reiniciar
  const randomDelay = 30 * 1000 + Math.random() * (180 * 1000 - 30 * 1000);
  console.log(`⏳ Esperando ${Math.round(randomDelay / 1000)}s antes de resetear bot ${this.username}...`);
  await delay(randomDelay);

  console.log(`♻️ [${this.username}] Reset automático iniciado`);
  this.kill();
  await this.start(); // quitamos waitMinutes
}

initScheduler() {
  // Reset corto cada 1h30min
  setInterval(async () => {
    if (!this.resetLongActive) await this.resetBot();
  }, 5400000);

  // Reset largo cada 16h
  setInterval(async () => {
    this.resetLongActive = true;
    await this.resetBot(); // también sin waitMinutes
    this.resetLongActive = false;
  },57600000);
}

}

(async () => {
  const bots = [];
  let startPort = 3000;

  for (let i = 0; i < cuentas.length; i++) {
    const cuenta = cuentas[i];
    const controller = new BotController({
      username: cuenta.username,
      proxy: cuenta.proxy || null,
      token: cuenta.token || null
    }, startPort + i);

    await controller.start();
    bots.push(controller);

    console.log(`⏳ Esperando 10s antes del siguiente bot...`);
    await delay(10000);
  }

  process.on("SIGINT", () => {
    bots.forEach(b => b.kill());
    process.exit(0);
  });
})();
