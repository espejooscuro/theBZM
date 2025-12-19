const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("🚀 BZM Multi Launcher");

const basePath = path.dirname(process.execPath);
const botPath = path.join(basePath, "bzm-bot.exe"); // exe del bot
const cuentasPath = path.join(basePath, "cuentas.json");

if (!fs.existsSync(cuentasPath)) {
  fs.writeFileSync(
    cuentasPath,
    JSON.stringify([{ username: "usuario_microsoft" }], null, 2)
  );
  console.log("📝 cuentas.json creado. Rellénalo y reinicia.");
  process.exit(0);
}

const cuentas = JSON.parse(fs.readFileSync(cuentasPath));
const delay = ms => new Promise(r => setTimeout(r, ms));

class BotController {
  constructor(username, port) {
    this.username = username;
    this.port = port;
    this.process = null;
    this.resetLongActive = false; // Flag para bloqueos de resets cortos durante largos
  }

  async start() {
    return new Promise(resolve => {
      this.process = spawn(botPath, ["--account", this.username], {
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, BOT_PORT: this.port }
      });

      this.process.stdout.on("data", data => {
        const msg = data.toString();
        process.stdout.write(`[${this.username}] ${msg}`);
        if (msg.includes("READY")) resolve();
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

      // Iniciar scheduler de resets automáticos
      this.initScheduler();
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
    await new Promise(r => setTimeout(r, waitMinutes * 60 * 1000));
    await this.start();
    console.log(`♻️ [${this.username}] Bot reiniciado después de ${waitMinutes} minuto(s)`);
  }

  initScheduler() {
    // Reset corto: cada 1,5 horas (90 min), espera 1 min
    setInterval(async () => {
      if (!this.resetLongActive) {
        await this.resetBot(1);
      }
    }, 90 * 60 * 1000);

    // Reset largo: cada 16 horas, espera 8 horas
    setInterval(async () => {
      this.resetLongActive = true;
      await this.resetBot(8 * 60); // espera 8 horas antes de relanzar
      this.resetLongActive = false;
    }, 16 * 60 * 60 * 1000);
  }
}


(async () => {
  const bots = [];
  const startPort = 3000;

  for (let i = 0; i < cuentas.length; i++) {
    const { username } = cuentas[i];
    const controller = new BotController(username, startPort + i); // Cada bot un puerto distinto
    await controller.start();
    bots.push(controller);

    console.log(`🚀 Bot ${username} iniciado, esperando 20s para el siguiente...`);
    await delay(20000);
  }

  process.on("SIGINT", () => {
    bots.forEach(b => b.kill());
    process.exit(0);
  });
})();
