const fs = require('fs');

const originalFens = [
  "8/8/8/8/8/8/4P3/8 w - - 0 1",
  "8/8/8/8/8/8/4P3/8 w - - 0 1",
  "8/8/8/8/3p4/4P3/8/8 w - - 0 1",
  "8/8/8/8/4p3/3P4/8/8 w - - 0 1",
  "8/8/8/8/8/8/8/R7 w - - 0 1",
  "8/8/8/8/8/8/4p3/R7 w - - 0 1",
  "8/1r6/8/8/8/8/8/1R6 w - - 0 1",
  "8/8/8/8/8/8/8/2B5 w - - 0 1",
  "8/8/8/8/5p2/8/8/2B5 w - - 0 1",
  "8/1n6/8/8/8/8/8/7B w - - 0 1",
  "8/8/8/8/8/8/8/1N6 w - - 0 1",
  "8/8/8/8/8/2p5/1P1P4/1N6 w - - 0 1",
  "8/8/8/8/4P3/8/5N2/8 w - - 0 1",
  "8/8/8/8/8/8/8/3Q4 w - - 0 1",
  "8/8/8/8/8/8/8/4K3 w - - 0 1",
  "8/8/1p6/8/8/8/8/3Q4 w - - 0 1",
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
  "8/8/8/4n3/8/8/8/4R3 w - - 0 1",
  "8/8/8/8/3p1q2/4P3/8/8 w - - 0 1",
  "8/8/8/4q3/8/8/8/4K3 w - - 0 1",
  "8/8/8/7q/8/8/3P4/4K3 w - - 0 1",
  "8/pk6/8/2Q5/8/8/8/8 w - - 0 1",
  "k7/8/1K6/8/8/8/8/1R6 w - - 0 1",
  "8/8/8/8/8/8/8/4K2R w K - 0 1",
  "8/4P3/8/8/8/8/8/8 w - - 0 1",
  "8/8/8/8/3Pp3/8/8/8 w - - 0 1", // removed d3
  "8/8/8/8/8/8/4P3/8 w - - 0 1"
];

const newFens = originalFens.map(fen => {
  const parts = fen.split(' ');
  const board = parts[0];
  let newBoard = board;
  
  if (!board.includes('k')) {
    // Put black king at a8. The first segment of board is rank 8.
    const ranks = newBoard.split('/');
    let rank8 = ranks[0];
    if (rank8.startsWith('8')) ranks[0] = 'k7';
    // other cases in original FENs: 'rnbqkbnr' (has k), 'k7' (has k). There is NO case starting with anything else but 8! Let's check!
    newBoard = ranks.join('/');
  }
  
  if (!newBoard.includes('K')) {
    // Put white king at h1. The last segment is rank 1.
    const ranks = newBoard.split('/');
    let rank1 = ranks[7];
    
    // cases for rank1:
    // '8' -> '7K'
    // 'R7' -> 'R6K'
    // '1R6' -> '1R5K'
    // '2B5' -> '2B4K'
    // '7B' -> '6BK'  <-- WAIT, I want it to not overwrite. So I can put it at a1 or e1 or h1 depending.
    // Let's just put it smartly: if it ends in number, replace last empty with K and reduce number.
    if (/\d$/.test(rank1)) {
        const lastDigit = parseInt(rank1.slice(-1));
        if (lastDigit === 1) {
            rank1 = rank1.slice(0, -1) + 'K';
        } else {
            rank1 = rank1.slice(0, -1) + (lastDigit - 1) + 'K';
        }
    } else {
        // ends in letter, means piece is at h1. So put K at g1.
        // wait, 7B ends in B, meaning B is at h1!
        // So 7B means 7 empty, 1 Bishop.
        // If we put K at a1, it becomes K6B.
        rank1 = 'K6' + rank1.slice(-1);
    }
    
    ranks[7] = rank1;
    newBoard = ranks.join('/');
  }
  
  return [newBoard, ...parts.slice(1)].join(' ');
});

const content = fs.readFileSync('lib/curriculum.ts', 'utf8');
const lines = content.split('\n');

let fenIndex = 0;
for (let i = 0; i < lines.length; i++) {
   if (lines[i].includes('fen: "')) {
      lines[i] = lines[i].replace(/fen: "[^"]+"/, `fen: "${newFens[fenIndex]}"`);
      fenIndex++;
   }
}

fs.writeFileSync('lib/curriculum.ts', lines.join('\n'));
console.log('Restored and fixed!');
