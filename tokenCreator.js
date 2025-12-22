const readline = require('readline');
const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');

// __dirname funciona en CommonJS
const basePath = process.pkg ? path.dirname(process.execPath) : __dirname;

// Funciones de sesión
function getSessionPath(username) {
  return path.join(basePath, `session_${username}.json`);
}

function saveSession(username, session) {
  fs.writeFileSync(getSessionPath(username), JSON.stringify(session, null, 2));
}

function loadSession(username) {
  const sessionPath = getSessionPath(username);
  if (fs.existsSync(sessionPath)) return JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
  return null;
}

// Sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Pedir username
function askUsername() {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Introduce tu nombre de usuario Microsoft (o ENTER para salir): ', username => {
      rl.close();
      resolve(username.trim());
    });
  });
}

// Crear bot con autenticación Microsoft
async function createBot(username) {
  let token = loadSession(username);

  const bot = mineflayer.createBot({
    host: 'supercraft.es',
    port: 25565,
    version: '1.19.4',
    username: username,
    auth: 'microsoft', // <- forzamos Microsoft
    session: token ? {
      accessToken: token.accessToken,
      clientToken: token.clientToken,
      selectedProfile: { id: token.uuid, name: username, keepAlive: false }
    } : undefined,
    skipValidation: !!token
  });

  bot.once('login', () => {
    console.log(`✅ Bot conectado: ${bot.username}`);

    if (!token) {
      const sessionToSave = {
        accessToken: bot._client.session.accessToken,
        clientToken: bot._client.session.clientToken,
        uuid: bot._client.session.selectedProfile.id,
        username: bot._client.session.selectedProfile.name
      };
      saveSession(username, sessionToSave);
      console.log(`💾 Sesión guardada en session_${username}.json`);
    } else {
      console.log('♻️ Usando sesión guardada');
    }

    console.log('🟢 El bot permanecerá conectado. Presiona Ctrl+C para salir.');
  });

  bot.on('error', err => console.error('❌ Error:', err));
  bot.on('kicked', reason => console.error('❌ Kickeado:', reason));
  bot.on('message', msg => console.log(`[${username} Chat] ${msg.toString()}`));
}

// Bucle principal
async function main() {
  while (true) {
    await sleep(1000); // Espera 1 segundo antes de pedir el nombre
    const username = await askUsername();
    if (!username) {
      console.log('Saliendo...');
      process.exit(0);
    }

    createBot(username).catch(err => {
      console.error(`❌ Error creando bot para ${username}:`, err);
    });

    console.log(`⚡ Bot de ${username} iniciado. Puedes ingresar otro nombre.`);
  }
}

main();
