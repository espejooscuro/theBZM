const fs = require('fs');
const { spawn } = require('child_process');

// Buscar todos los tokens
const tokenFiles = fs.readdirSync('.').filter(f => f.startsWith('tokens_') && f.endsWith('.json'));

if (!tokenFiles.length) {
  console.log('No se encontraron archivos tokens_*.json.');
  process.exit(0);
}

// Lanzar cada bot en un proceso independiente
tokenFiles.forEach((file, i) => {
  const tokens = JSON.parse(fs.readFileSync(file, 'utf8'));
  const username = tokens.username;

  const child = spawn('node', ['botRunner.js', file, username], {
    stdio: ['inherit', 'inherit', 'inherit']
  });

  child.on('exit', (code) => {
    console.log(`Proceso del bot ${username} (${file}) ha salido con código ${code}`);
  });
});
