const { Chess } = require('chess.js');
const c = new Chess();
try {
  c.load("8/8/8/8/8/8/4P3/8 w - - 0 1");
  console.log("Load success");
  console.log("Moves:", c.moves({verbose:true}));
} catch(e) {
  console.error("Load failed:", e.message);
}
