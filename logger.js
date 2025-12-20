const { createLogger, format, transports } = require('winston');
const { combine, printf, colorize } = format;
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const directoryPath = './logs';

if (!fs.existsSync(directoryPath)) fs.mkdirSync(directoryPath);

const colors = {
  '1': '\x1b[34m', '2': '\x1b[32m', '3': '\x1b[36m', '4': '\x1b[31m',
  '6': '\x1b[33m', '9': '\x1b[94m', 'a': '\x1b[92m', 'b': '\x1b[96m',
  'c': '\x1b[91m', 'd': '\x1b[95m', 'e': '\x1b[93m', '7': '\x1b[37m',
  '8': '\x1b[90m', 'f': '\x1b[97m', '0': '\x1b[30m', '5': '\x1b[35m'
};
const badColors = new Set(['§0', '§5', '§f', '§8', '§7', '§2', '§9']);
const colorKeys = Object.keys(colors);

let currentIgns = [];
let ignColors = {};

function updateIgns(ign) {
  if (!currentIgns.includes(ign)) currentIgns.push(ign);
}

function removeIgn(ign) {
  currentIgns = currentIgns.filter(i => i !== ign);
}

function customIGNColor(ign, attempt = 0) {
  if (ignColors[ign]) return ignColors[ign];
  const randomColor = "§" + colorKeys[Math.floor(Math.random() * colorKeys.length)];
  if ((Object.values(ignColors).includes(randomColor) || badColors.has(randomColor)) && attempt < 8) {
    return customIGNColor(ign, attempt + 1);
  }
  ignColors[ign] = randomColor;
  return randomColor;
}

function getPrefix(ign) {
  if (currentIgns.length <= 1) return "";
  return `${customIGNColor(ign)}${ign}: `;
}

function formatDate() {
  const date = new Date();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2);
  return `${month}-${day}-${year}_${hh}-${mm}`;
}

const latestLogPath = path.join(directoryPath, 'latest.log');
const datedLogPath = path.join(directoryPath, `${formatDate()}.log`);
if (!fs.existsSync(latestLogPath)) fs.writeFileSync(latestLogPath, '');

const plainFormat = printf(({ message }) => message.replace(/\x1b\[[0-9;]*m/g, ''));
const normalFormat = printf(({ message }) => message);

const logger = createLogger({
  level: 'silly',
  transports: [
    new transports.Console({ level: 'info', format: combine(colorize(), normalFormat) }),
    new transports.File({ filename: latestLogPath, format: plainFormat }),
    new transports.File({ filename: datedLogPath, format: plainFormat })
  ]
});

async function logmc(msg) {
  if (!msg) return;
  const stripped = msg.replace(/§./g, '');
  if (currentIgns.length) logger.info(`${getPrefix(currentIgns[0])}${stripped}`);
  else logger.info(stripped);
}

module.exports = {
  logmc,
  customIGNColor,
  updateIgns,
  removeIgn,
  getPrefix,
  getIgns: () => currentIgns
};
