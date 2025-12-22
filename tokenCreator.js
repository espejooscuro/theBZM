const readline = require('readline')
const mineflayer = require('mineflayer')
const fs = require('fs')
const path = require('path')

// ===== Base path =====
const basePath = process.pkg ? path.dirname(process.execPath) : __dirname

// ===== Sesión =====
function getSessionPath(alias) {
  return path.join(basePath, `session_${alias}.json`)
}

function saveSession(alias, session) {
  fs.writeFileSync(getSessionPath(alias), JSON.stringify(session, null, 2))
}

function loadSession(alias) {
  const p = getSessionPath(alias)
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null
}

// ===== Input =====
function askUsername() {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question('Alias (ENTER para salir): ', v => {
      rl.close()
      resolve(v.trim())
    })
  })
}

// ===== Bot =====
function createBot(alias) {
  return new Promise((resolve, reject) => {
    const token = loadSession(alias)

    const bot = mineflayer.createBot({
      host: 'supercraft.es',
      port: 25565,
      version: '1.19.4',
      auth: 'microsoft',
      session: token
        ? {
            accessToken: token.accessToken,
            clientToken: token.clientToken,
            selectedProfile: {
              id: token.uuid,
              name: token.username,
              keepAlive: false
            }
          }
        : undefined,
      skipValidation: !!token
    })

    bot.once('login', () => {
      console.log(`✅ [${alias}] conectado como ${bot.username}`)

      if (!token) {
        const s = {
          accessToken: bot._client.session.accessToken,
          clientToken: bot._client.session.clientToken,
          uuid: bot._client.session.selectedProfile.id,
          username: bot._client.session.selectedProfile.name
        }
        saveSession(alias, s)
        console.log(`💾 [${alias}] sesión guardada`)
      } else {
        console.log(`♻️ [${alias}] sesión reutilizada`)
      }

      resolve(bot)
    })

    bot.on('message', msg => {
      console.log(`[${alias}|${bot.username}] ${msg.toString()}`)
    })

    bot.on('kicked', r => console.error(`❌ [${alias}] Kick:`, r))
    bot.on('error', e => console.error(`❌ [${alias}] Error:`, e))
  })
}

// ===== Main =====
async function main() {
  const bots = new Map()

  while (true) {
    const alias = await askUsername()
    if (!alias) process.exit(0)

    if (bots.has(alias)) {
      console.log(`⚠️ Ya existe un bot con alias ${alias}`)
      continue
    }

    createBot(alias)
      .then(bot => bots.set(alias, bot))
      .catch(() => {})
  }
}

main()
