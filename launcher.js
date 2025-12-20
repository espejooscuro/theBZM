const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("🚀 BZM Multi Launcher");

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
    this.running = false;      // Bloquea múltiples starts
    this.resetInProgress = false;
  }

  async start() {
    if (this.running || activeAccounts.has(this.username)) {
      console.log(`[${this.username}] ⚠️ Bot ya activo, evitando duplicado`);
      return;
    }

    this.running = true;
    activeAccounts.add(this.username);
    this._readyResolved = false;

    console.log(`▶ Lanzando bot ${this.username} ${this.proxy ? "(proxy)" : ""}`);

    this.process = spawn(botPath, ["--account", this.username], {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, BOT_PORT: this.port, SOCKS_PROXY: this.proxy || "" },
      detached: false
    });

    this.process.stdout.on("data", data => {
      const msg = data.toString();
      process.stdout.write(`[${this.username}] ${msg}`);
      if (msg.includes("READY") && !this._readyResolved) {
        this._readyResolved = true;
      }
    });

    this.process.stderr.on("data", data =>
      process.stderr.write(`[${this.username} ERROR] ${data}`)
    );

    this.process.on("exit", code => {
      console.log(`🔌 [${this.username}] Proceso terminó con código: ${code}`);
      activeAccounts.delete(this.username);
      this.running = false;
    });
  }

  kill() {
    if (this.process) {
      this.process.kill("SIGKILL");
      this.process = null;
      this.running = false;
      activeAccounts.delete(this.username);
    }
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
    await delay(30 * 1000);
  }

  process.on("SIGINT", () => {
    bots.forEach(b => b.kill());
    process.exit(0);
  });
})();
