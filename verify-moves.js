const { Chess } = require('chess.js');
const fs = require('fs');

const content = fs.readFileSync('lib/curriculum.ts', 'utf8');
const stepsRegex = /fen:\s*"([^"]+)",\s*instruction:[^}]*expectedMove:\s*\{\s*from:\s*"([^"]+)",\s*to:\s*"([^"]+)"/g;

let match;
while ((match = stepsRegex.exec(content)) !== null) {
  const fen = match[1];
  const from = match[2];
  const to = match[3];
  try {
     const c = new Chess();
     c.load(fen);
     const move = c.move({ from, to });
     if (!move) {
        console.error("ILLEGAL MOVE:", fen, "from", from, "to", to);
     } else {
        console.log("OK:", from, "->", to, "in", fen);
     }
  } catch(e) {
     console.error("ERROR/ILLEGAL:", fen, "from", from, "to", to, e.message);
  }
}
