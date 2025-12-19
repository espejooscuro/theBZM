const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("🚀 BZM Multi Launcher");

const basePath = path.dirname(process.execPath);
let botPath;

if (process.platform === "win32") {
  botPath = path.join(basePath, "bzm-bot.exe");
} else if (process.platform === "linux" || process.platform === "darwin") {
  botPath = path.join(basePath, "bzm-bot"); // sin extensión en Linux/macOS
} else {
  console.error("❌ Sistema operativo no soportado");
  process.exit(1);
}

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

// Colores ANSI manuales
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};
const colorList = ['red','green','yellow','blue','magenta','cyan','white'];
const userColors = {};

function getUserColor(username) {
  if (!userColors[username]) {
    const available = colorList.filter(c => !Object.values(userColors).includes(c));
    userColors[username] = available[0] || 'white';
  }
  return userColors[username];
}

class BotController {
  constructor(username, port) {
    this.username = username;
    this.port = port;
    this.process = null;
    this.resetLongActive = false;
  }

  async start() {
    return new Promise(resolve => {
      this.process = spawn(botPath, ["--account", this.username], {
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, BOT_PORT: this.port },
        detached: process.platform !== "win32"
      });

      if (process.platform !== "win32") {
        this.process.unref();
      }

      // Colorear logs por usuario
      this.process.stdout.on("data", data => {
        const msg = data.toString();
        const color = getUserColor(this.username);
        process.stdout.write(`${colors[color]}[${this.username}]${colors.reset} ${msg}`);
        if (msg.includes("READY")) resolve();
      });

      this.process.stderr.on("data", data => {
        const color = getUserColor(this.username);
        process.stderr.write(`${colors[color]}[${this.username} ERROR]${colors.reset} ${data}`);
      });

      this.process.on("exit", code => {
        console.log(`🔌 [${this.username}] Proceso terminó con código: ${code}`);
        if ([10,11,12].includes(code)) {
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
    setInterval(async () => {
      if (!this.resetLongActive) await this.resetBot(1);
    }, 90 * 60 * 1000);

    setInterval(async () => {
      this.resetLongActive = true;
      await this.resetBot(8*60);
      this.resetLongActive = false;
    }, 16*60*60*1000);
  }
}

(async () => {
  const bots = [];
  const startPort = 3000;

  for (let i = 0; i < cuentas.length; i++) {
    const { username } = cuentas[i];
    const controller = new BotController(username, startPort + i);
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
