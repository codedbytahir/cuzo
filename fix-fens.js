const fs = require('fs');
const { Chess } = require('chess.js');

let content = fs.readFileSync('lib/curriculum.ts', 'utf8');

// Regex to find all fen strings
const fenRegex = /fen:\s*"([^"]+)"/g;

content = content.replace(fenRegex, (match, fen) => {
  // Check if fen has K and k
  const parts = fen.split(' ');
  const board = parts[0];
  let newBoard = board;
  
  if (!board.includes('k')) {
    // Put black king at a8. The first segment of board is rank 8.
    const ranks = newBoard.split('/');
    let rank8 = ranks[0];
    // if '8', it becomes 'k7'
    // if '1r6', it becomes 'kr6' (wait, '1' means 1 empty, so 'k' replaces the empty square)
    // To simplify: let's put k at a8.
    let expanded = '';
    for (let char of rank8) {
      if (!isNaN(char)) {
        for (let i = 0; i < parseInt(char); i++) expanded += '1';
      } else {
        expanded += char;
      }
    }
    expanded = 'k' + expanded.substring(1); // Set a8 to k
    let newRank8 = '';
    let count = 0;
    for (let char of expanded) {
      if (char === '1') count++;
      else {
        if (count > 0) newRank8 += count;
        count = 0;
        newRank8 += char;
      }
    }
    if (count > 0) newRank8 += count;
    ranks[0] = newRank8;
    newBoard = ranks.join('/');
  }
  
  if (!newBoard.includes('K')) {
    // Put white king at h1. The last segment is rank 1.
    const ranks = newBoard.split('/');
    let rank1 = ranks[7];
    let expanded = '';
    for (let char of rank1) {
      if (!isNaN(char)) {
        for (let i = 0; i < parseInt(char); i++) expanded += '1';
      } else {
        expanded += char;
      }
    }
    expanded = expanded.substring(0, 7) + 'K'; // Set h1 to K
    let newRank1 = '';
    let count = 0;
    for (let char of expanded) {
      if (char === '1') count++;
      else {
        if (count > 0) newRank1 += count;
        count = 0;
        newRank1 += char;
      }
    }
    if (count > 0) newRank1 += count;
    ranks[7] = newRank1;
    newBoard = ranks.join('/');
  }
  
  const finalFen = [newBoard, ...parts.slice(1)].join(' ');
  
  try {
    const c = new Chess();
    c.load(finalFen);
    console.log(`Original: ${fen} -> Fixed: ${finalFen}`);
    return `fen: "${finalFen}"`;
  } catch (e) {
    console.warn(`STILL INVALID: ${finalFen} (${e.message})`);
    return `fen: "${finalFen}"`;
  }
});

fs.writeFileSync('lib/curriculum.ts', content, 'utf8');
console.log('Done.');
