const { Chess } = require('chess.js');
const fs = require('fs');

const content = fs.readFileSync('lib/curriculum.ts', 'utf8');
const fenRegex = /fen:\s*"([^"]+)"/g;
let match;
while ((match = fenRegex.exec(content)) !== null) {
  const fen = match[1];
  try {
     const c = new Chess();
     c.load(fen);
     console.log("OK:", fen);
  } catch(e) {
     console.error("FAIL:", fen, e.message);
  }
}
