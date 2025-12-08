const mineflayer = require('mineflayer')
const InventoryListener = require('./InventoryListener')
const ContainerInteractor = require('./ContainerInteractor')
const ScoreboardListener = require('./ScoreboardListener')
const ChatListener = require('./ChatListener')
const InventoryGUI = require('./InventoryGUI')
const Panel = require('./Panel')  
const ItemRequester = require('./ItemRequester')


/*
msl.extremecraft.net
tumira.net

/boostercookie
*/

const bot = mineflayer.createBot({
  host: 'mc.hypixel.net', // cambia esto por la IP del servidor
  port: 25565,              // puerto del servidor
  auth: 'microsoft',        // inicia sesión con tu cuenta oficial de Microsoft
  username: 'marcos.gemmeker@gmail.com', // tu correo de Minecraft
  version: '1.8.9'
})

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

bot.on('error', err => console.error(err))
bot.on('end', () => console.log('Bot desconectado'))



const invListener = new InventoryListener(bot)
const interactor = new ContainerInteractor(bot, 150, 350) // delay entre 150 y 350ms
const scoreboard = new ScoreboardListener(bot)



const chat = new ChatListener(bot, {
  palabras : [ 'Connecting to' , 'MiniEspe' ],
  tipos: ['sistema'],
  excluirPalabras: ['APPEARING OFFLINE', '✎ Mana']
})






async function _init() {

    //const gui = new InventoryGUI(bot, 3000)
    
    new Panel(bot)


      delay(4000)
      chat.enviar("/skyblock")
      delay(5000)
      chat.enviar("/warp garden")
      delay(5000)

    console.log('✅ ¡Bot conectado con tu cuenta premium!')

    await delay(1500)
    console.log('Inventario inicial:')

    const inventarioSinColores = invListener.obtenerInventarioPlain()
    //console.log(inventarioSinColores)

    /*
    await interactor.click({ tipo: 'inventario', slot: 36 })
    console.log('Shift-click realizado en slot 10')
    await delay(1500)
    console.log(inventario.obtenerInventario())
    await delay(1500)
    console.log('Leyendo scoreboard...')
    setTimeout(() => {
    console.log(scoreboard.obtenerScoreboard())
  }, 2000)

  await interactor.click({ tipo: 'contenedor', nombreCustom: "Survival" })
  console.log("Se ha teletransportado... Leyendo nuevo inventario en 3 segundos")
  await delay(3000)
  console.log(inventario.obtenerInventario())*/
}   

bot.once('spawn', _init)

