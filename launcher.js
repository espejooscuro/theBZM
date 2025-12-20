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

class BotController {
  constructor(username, port, proxy) {
    this.username = username;
    this.port = port;
    this.proxy = proxy;
    this.process = null;
    this.resetLongActive = false;
    this.schedulerStarted = false;
  }

  start() {
    return new Promise(resolve => {
      console.log(`▶ Lanzando bot ${this.username} ${this.proxy ? "(proxy)" : ""}`);

      this.process = spawn(botPath, ["--account", this.username], {
  stdio: ["ignore", "pipe", "pipe"],
  env: {
    ...process.env,
    BOT_PORT: this.port, // cada bot con un puerto distinto
    SOCKS_PROXY: this.proxy || ""
  },
  detached: process.platform !== "win32"
});



      if (process.platform !== "win32") this.process.unref();

      this.process.stdout.on("data", data => {
        const msg = data.toString();
        process.stdout.write(`[${this.username}] ${msg}`);

        // Bot considerado estable
        if (msg.includes("Welcome to Hypixel SkyBlock!")) {
          resolve();
        }
      });

      this.process.stderr.on("data", data =>
        process.stderr.write(`[${this.username} ERROR] ${data}`)
      );

      this.process.on("exit", code => {
        console.log(`🔌 [${this.username}] Proceso terminó con código: ${code}`);
        if ([10, 11, 12].includes(code)) {
          console.log(`🔄 [${this.username}] Reinicio por código ${code}`);
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

  async resetBot(waitMinutes = 1) {
    console.log(`♻️ [${this.username}] Reset automático iniciado`);
    this.kill();
    await delay(waitMinutes * 60 * 1000);
    await this.start();
  }

  initScheduler() {
    setInterval(async () => {
      if (!this.resetLongActive) await this.resetBot(1);
    }, 90 * 60 * 1000);

    setInterval(async () => {
      this.resetLongActive = true;
      await this.resetBot(8 * 60);
      this.resetLongActive = false;
    }, 16 * 60 * 60 * 1000);
  }
}

(async () => {
  const bots = [];
  const startPort = 3000;

  for (let i = 0; i < cuentas.length; i++) {
    const { username, proxy } = cuentas[i];
    const controller = new BotController(username, undefined, proxy);


    await controller.start();
    bots.push(controller);

    console.log(`⏳ Esperando 10s antes del siguiente bot...`);
    await delay(10 * 1000);
  }

  process.on("SIGINT", () => {
    bots.forEach(b => b.kill());
    process.exit(0);
  });
})();
