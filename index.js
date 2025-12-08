// index.js
// Este archivo se usará como "bin" para pkg
require('./launcher.js');

// Forzar que pkg incluya todos los módulos necesarios
try { require('sqlite3'); } catch(e) {}
try { require('./bot.js'); } catch(e) {}
try { require('./ChatListener.js'); } catch(e) {}
try { require('./ContainerInteractor.js'); } catch(e) {}
try { require('./InventoryListener.js'); } catch(e) {}
try { require('./ItemRequester.js'); } catch(e) {}
try { require('./Panel.js'); } catch(e) {}
try { require('./ScoreboardListener.js'); } catch(e) {}
try { require('./SkyBlockItem.js'); } catch(e) {}
