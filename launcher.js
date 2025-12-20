const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("🚀 BZM Multi Launcher");

// Paths
const basePath = path.dirname(process.execPath);
const botPath = process.platform === "win32"
  ? path.join(basePath, "bzm-bot.exe")
  : path.join(basePath, "bzm-bot");

const cuentasPath = path.join(basePath, "cuentas.json");
if (!fs.existsSync(cuentasPath)) {
  fs.writeFileSync(cuentasPath, JSON.stringify([], null, 2));
  console.log("📝 cuentas.json creado. Añade tus cuentas y reinicia.");
  process.exit(0);
}

const cuentas = JSON.parse(fs.readFileSync(cuentasPath));
const delay = ms => new Promise(r => setTimeout(r, ms));

const activeAccounts = new Set(); // Evita duplicados

class BotController {
  constructor(username, port, proxy) {
    this.username = username;
    this.port = port;
    this.proxy = proxy;
    this.process = null;
    this.resetLongActive = false;
    this.resetInProgress = false;
  }

  async start() {
    if (activeAccounts.has(this.username)) {
      console.log(`[${this.username}] ⚠️ Bot ya activo, evitando duplicado`);
      return;
    }

    activeAccounts.add(this.username);

    return new Promise(resolve => {
      console.log(`▶ Lanzando bot ${this.username} ${this.proxy ? "(proxy)" : ""}`);

      this.process = spawn(botPath, ["--account", this.username], {
        stdio: ["ignore", "pipe", "pipe"],
        env: {
          ...process.env,
          BOT_PORT: this.port,
          SOCKS_PROXY: this.proxy || ""
        },
        detached: process.platform !== "win32"
      });

      if (process.platform !== "win32") this.process.unref();

      this.process.stdout.on("data", data => {
        const msg = data.toString();
        process.stdout.write(`[${this.username}] ${msg}`);
        if (msg.includes("READY") && !this._readyResolved) {
          this._readyResolved = true;
          resolve();
        }
      });

      this.process.stderr.on("data", data =>
        process.stderr.write(`[${this.username} ERROR] ${data}`)
      );

      this.process.on("exit", code => {
        activeAccounts.delete(this.username);
        console.log(`🔌 [${this.username}] Proceso terminó con código: ${code}`);

        // Reinicio automático solo si no es un duplicado
        if ([10, 11, 12].includes(code)) {
          console.log(`🔄 [${this.username}] Reinicio por código ${code}`);
          setTimeout(() => this.start(), 5000);
        }
      });

      this.initScheduler();
    });
  }

  kill() {
    if (this.process) {
      this.process.kill("SIGKILL");
      this.process = null;
      activeAccounts.delete(this.username);
    }
  }

  async resetBot(waitMinutes = 1) {
    if (this.resetInProgress) return; // Evita reinicio paralelo
    this.resetInProgress = true;

    console.log(`♻️ [${this.username}] Reset automático iniciado`);
    this.kill();
    await delay(waitMinutes * 60 * 1000);
    await this.start();

    this.resetInProgress = false;
    console.log(`♻️ [${this.username}] Bot reiniciado después de ${waitMinutes} minuto(s)`);
  }

  initScheduler() {
    // Reset corto cada 90 minutos
    setInterval(async () => {
      if (!this.resetLongActive) await this.resetBot(1);
    }, 90 * 60 * 1000);

    // Reset largo cada 16h
    setInterval(async () => {
      this.resetLongActive = true;
      await this.resetBot(8 * 60); // 8 horas
      this.resetLongActive = false;
    }, 16 * 60 * 60 * 1000);
  }
}

(async () => {
  const bots = [];
  const startPort = 3000;

  for (let i = 0; i < cuentas.length; i++) {
    const { username, proxy } = cuentas[i];
    const controller = new BotController(username, startPort + i, proxy);
    await controller.start();
    bots.push(controller);

    console.log(`🚀 Bot ${username} iniciado, esperando 30s para el siguiente...`);
    await delay(30 * 1000); // Retardo seguro entre bots para Hypixel
  }

  process.on("SIGINT", () => {
    bots.forEach(b => b.kill());
    process.exit(0);
  });
})();
