// TODO ifLose
// TODO cuando come no solo cojer la mejor, si hay varias con igual cantidad valor
// player 0 are black pieces and 1 white pieces

const edge = {
  nodeId: 0,
  move: [-1, -1, -1, -1],
};
const EdgeToStr = (move) => {
  return `${move[0]} ${move[1]}\\${move[2]} ${move[3]}`;
};
const node = {
  board: [],
  value: 0,
  edges: [],
  nodeId: 0,
};
const _newEdge = {
  board: [],
  parent: 0,
  moves: [],
  value: 0,
};
const Nodes = [];
var N = 0;
var LastNode = 0,
  GoodGuy = -1;
//move on the board
const Mf = [1, 1, -1, -1];
const Mc = [1, -1, 1, -1];

const copyBoard = (board) => {
  let newBoard = [];
  for (let i = 0; i < 8; i++) {
    newBoard.push([]);
    newBoard[i] = [...board[i]];
  }
  return newBoard;
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
};
const possibleMove = (board, i, j, k, cantMoves = 1) => {
  let piece = board[i][j];
  if (
    i + Mf[k] * cantMoves >= 8 ||
    j + Mc[k] * cantMoves >= 8 ||
    i + Mf[k] * cantMoves < 0 ||
    j + Mc[k] * cantMoves < 0
  )
    return 0;
  //empty space
  if (board[i + Mf[k] * cantMoves][j + Mc[k] * cantMoves] == 0) return 1;
  //friendly piece
  if (board[i + Mf[k] * cantMoves][j + Mc[k] * cantMoves] * piece > 0) return 0;
  //  enemy piece
  if (board[i + Mf[k] * cantMoves][j + Mc[k] * cantMoves] * piece < 0) {
    //if next step out of the board
    if (
      i + Mf[k] * (cantMoves + 1) < 8 &&
      j + Mc[k] * (cantMoves + 1) < 8 &&
      i + Mf[k] * (cantMoves + 1) >= 0 &&
      j + Mc[k] * (cantMoves + 1) >= 0
    )
      return 0;
    //if next step is taked
    if (board[i + Mf[k] * (cantMoves + 1)][j + Mc[k] * (cantMoves + 1)] != 0)
      return 0;
    return 1;
  }
};
const areMoves = (board) => {
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++) {
      if (Math.abs(board[i][j]) == 1) {
        // if piece is white use second pair of move, first pair otherwise
        let moves = board[i][j] == 1 ? 2 : 0;
        for (let k = moves; k < moves * 2; k++) {
          // [areMove, , , ,] = //canMove(board, i, j, board[i][j], k);
          if (possibleMove(board, i, j, k)) return 1;
        }
      }
      if (Math.abs(board[i][j]) == 2) {
        for (let k = 0; k < 4; k++) {
          let areMove;
          // [areMove, , , ,] = d//canMove(board, i, j, board[i][j], k);
          if (possibleMove(board, i, j, k)) return 1;
        }
      }
    }
  return 0;
};
const calcValue = (nodeId) => {
  let trt = 0;
  if (!areMoves(Nodes[nodeId].board)) return 99999 * GoodGuy;
  // heuristic is the sum of the pieces value 1 to simple pieces and 8 to queens, white have positive value and blackhave negative
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++)
      trt =
        trt +
        Nodes[nodeId].board[i][j] *
          Nodes[nodeId].board[i][j] *
          Nodes[nodeId].board[i][j];
  return trt * GoodGuy;
};

const isQueen = (board, i, j) => {
  if (board[i][j] < 0 && i == 7) board[i][j] = board[i][j] * 2;
  if (board[i][j] > 0 && i == 0) board[i][j] = board[i][j] * 2;
};

/****
  @param board {Array} Array of Arrays with the game board
  @param i {Number} row position
  @param j {Number} column position
  @param k {Number} direction of the move
  @param piece {Number} 1 or -1 the value of the piece are goin to move
  @param cantMoves {Number} amount of stpes
  @returns {Array} [band, i,j,value] band = 0 when no moves, 1 simple move, 2 eating move, value is the value of the eaten piece 
*/
const canMove = (board, i, j, piece, k, cantMoves = 1) => {
  // out of the board
  if (
    i + Mf[k] * cantMoves >= 8 ||
    j + Mc[k] * cantMoves >= 8 ||
    i + Mf[k] * cantMoves < 0 ||
    j + Mc[k] * cantMoves < 0
  )
    return [0, -1, -1, 0];
  //empty space
  if (board[i + Mf[k] * cantMoves][j + Mc[k] * cantMoves] == 0) {
    board[i + Mf[k] * cantMoves][j + Mc[k] * cantMoves] = board[i][j];
    board[i][j] = 0;
    return [1, i + Mf[k] * cantMoves, j + Mc[k] * cantMoves, 0];
  }
  //friendly piece
  if (board[i + Mf[k] * cantMoves][j + Mc[k] * cantMoves] * piece > 0)
    return [0, -1, -1, 0];
  //opponent piece
  if (board[i + Mf[k] * cantMoves][j + Mc[k] * cantMoves] * piece < 0) {
    //if next step out of the board or not empty space for eat
    if (
      i + Mf[k] * (cantMoves + 1) < 8 &&
      j + Mc[k] * (cantMoves + 1) < 8 &&
      i + Mf[k] * (cantMoves + 1) >= 0 &&
      j + Mc[k] * (cantMoves + 1) >= 0
    ) {
      if (board[i + Mf[k] * (cantMoves + 1)][j + Mc[k] * (cantMoves + 1)] != 0)
        return [0, -1, -1, 0];
      else {
        let value = board[i + Mf[k] * cantMoves][j + Mc[k] * cantMoves];
        board[i + Mf[k] * cantMoves][j + Mc[k] * cantMoves] = 0;
        board[i + Mf[k] * (cantMoves + 1)][j + Mc[k] * (cantMoves + 1)] =
          board[i][j];
        board[i][j] = 0;
        return [
          2,
          i + Mf[k] * (cantMoves + 1),
          j + Mc[k] * (cantMoves + 1),
          value,
        ];
      }
    } else return [0, -1, -1, 0];
  } else {
    assert(false, "WTF ERROR on canMove");
  }
};
/**
 *
 * @param {*} currentNode
 * @param {*} i
 * @param {*} j
 * @param {*} board
 * @param {*} moves
 * @param {*} value
 * @param {*} storeNodes
 */
const eatPieces = (currentNode, i, j, board, moves, value, storeNodes) => {
  let piece = board[i][j];
  let eat = false,
    moveIterator,
    moveMax,
    newBoard,
    newValue;
  let kMax;
  // piece is white moves for going up
  if (piece == 1) {
    moveIterator = 2;
    kMax = 4;
  }
  // piece is black moves for going down
  if (piece == -1) {
    moveIterator = 0;
    kMax = 2;
  }
  if (piece * piece == 4) {
    moveIterator = 0;
    kMax = 4;
  }

  let newI, newJ, band;
  for (; moveIterator < moveMax; moveIterator++) {
    newBoard = copyBoard(board);
    [band, newI, newJ, newValue] = canMove(newBoard, i, j, piece, moveIterator);
    if (band != 2) continue;
    eat = true;
    moves.push(newI);
    moves.push(newJ);
    eatPieces(
      currentNode,
      newI,
      newJ,
      newBoard,
      moves,
      newValue + value,
      storeNodes
    ); //!fix
    moves.pop();
    moves.pop();
  }
  newBoard = copyBoard(board);
  if (!eat) {
    isQueen(newBoard, i, j);
    let newEdge = { ..._newEdge };
    newEdge.board = newBoard;
    newEdge.moves = [...moves];
    newEdge.parent = currentNode;
    newEdge.value = value < 0 ? value * -1 : value;
    storeNodes.push(newEdge);
    //! console.log(newEdge)
  }
};

/**
 *
 * @param {Number} currentNode Current node
 * @param {Number} level Lever of the Game tree
 * @param {Number} maxDeep Max Deep of the Game tree
 * @param {Boolean} player 0 White pieces , 1 Black pieces
 */
const createEdges = (currentNode, level, maxDeep, player) => {
  let board = Nodes[currentNode].board;
  let piece = player == 0 ? 1 : -1;
  let hasEaten = false;
  let PossibleNode = [];

  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++) {
      if (board[i][j] == piece) {
        // if piece is white use second pair of move, first pair otherwise
        let moves = piece == 1 ? 2 : 0;
        for (let k = moves; k < 2 + moves; k++) {
          let newBoard = copyBoard(board);
          let band, newI, newJ, value;
          //new pos and new board created
          [band, newI, newJ, value] = canMove(newBoard, i, j, piece, k);
          if (band == 0) continue;

          if (band == 1) {
            let newEdge = { ..._newEdge };
            newEdge.board = newBoard;
            newEdge.moves = [i, j, newI, newJ];
            newEdge.parent = currentNode;
            newEdge.value = value;
            PossibleNode.push(newEdge);
          }

          if (band == 2) {
            hasEaten = true;
            // console.log([band, newI, newJ, value]);
            eatPieces(
              currentNode,
              newI,
              newJ,
              newBoard,
              [i, j, newI, newJ],
              value,
              PossibleNode
            );
            // console.log(newBoard);
            continue;
          }
        }
      }
      if (board[i][j] == piece * 2) {
        for (let k = 0; k < 4; k++) {
          let newBoard = copyBoard(board);
          let band, newI, newJ, value;
          let steps = 1;
          do {
            //new pos and new board created
            [band, newI, newJ, value] = canMove(
              newBoard,
              i,
              j,
              piece,
              k,
              steps
            );
            steps++;
            if (band == 0) break;
            if (band == 1) {
              let newEdge = { ..._newEdge };
              newEdge.board = newBoard;
              newEdge.moves = [i, j, newI, newJ];
              newEdge.parent = currentNode;
              PossibleNode.push(newEdge);
            }
            if (band == 2) {
              hasEaten = true;
              // console.log([band, newI, newJ, value]);
              eatPieces(
                currentNode,
                newI,
                newJ,
                newBoard,
                [i, j, newI, newJ],
                value,
                PossibleNode
              );
              // console.log(newBoard);
              break;
            }
          } while (band == 1);
        }
      }
    }
  //cambiar chosenone por theChosensOne y hacer un arreglo de los que tengan el mismo cantidad valor
  let chosenOnes = [],
    maxSize = 0,
    maxValue = 0;
  for (const item of PossibleNode) {
    if (hasEaten && item.value == 0) continue;
    if (!hasEaten) {
      let newEdge = { ...edge };
      newEdge.nodeId = N;
      newEdge.move = [...item.moves];
      Nodes[currentNode].edges.push(newEdge);
      //create node
      let newNode = { ...node };
      newNode.nodeId = N;
      newNode.edges = [];
      newNode.board = copyBoard(item.board);
      N++;
      Nodes.push(newNode);
      MinMax(N - 1, level + 1, maxDeep, !player);
      continue;
    }
    if (maxSize == item.moves.length && maxValue < item.value) {
      maxValue = item.value;
      chosenOnes = [item];
      continue;
    }
    if (maxSize < item.moves.length) {
      maxSize = item.moves.length;
      maxValue = item.value;
      chosenOnes = [item];
      continue;
    }
    if (maxSize == item.moves.length && maxValue == item.value) {
      chosenOnes.push(item);
    }
  }
  if (!hasEaten) return;

  for (const chosenOne of chosenOnes) {
    let newEdge = { ...edge };
    newEdge.nodeId = N;
    newEdge.move = [...chosenOne.moves];
    Nodes[currentNode].edges.push(newEdge);
    //create node
    let newNode = { ...node };
    newNode.nodeId = N;
    newNode.edges = [];
    newNode.board = copyBoard(chosenOne.board);
    N++;
    Nodes.push(newNode);
    MinMax(N - 1, level + 1, maxDeep, !player);
  }
};

/**
 *
 * @param {Number} currentNode Current node
 * @param {Number} level Lever of the Game tree
 * @param {Number} maxDeep Max Deep of the Game tree
 * @param {Boolean} player 0 White pieces , 1 Black pieces
 * @param {*} alfa not used
 * @param {*} beta  not used
 * @returns {Array} Return a Array with the next node and the next move [NextNode,[i,j,newI,newJ]]
 */
export const MinMax = (
  currentNode,
  level,
  maxDeep = 4,
  player = false,
  alfa = 0,
  beta = 0
) => {
  // Create Edges
  if (level < maxDeep) {
    if (Nodes[currentNode].edges.length == 0) {
      createEdges(currentNode, level, maxDeep, player);
    } else {
      //move through children
      for (let newEdge of Nodes[currentNode].edges) {
        MinMax(newEdge.nodeId, level + 1, maxDeep, !player);
      }
    }
  } else {
    Nodes[currentNode].value = calcValue(currentNode);
    return;
  }

  let value = -9999;
  let move = [],
    nodeMove;
  if (level % 2 == 1) value = 9999;
  for (let newEdge of Nodes[currentNode].edges) {
    let newNode = newEdge.nodeId;
    if (newNode >= N) console.log("here");
    //Max
    if (level % 2 == 0) {
      if (value < Nodes[newNode].value) {
        value = Nodes[newNode].value;
        move = newEdge.move;
        nodeMove = newEdge.nodeId;
      }
    }
    //Min
    else if (value > Nodes[newNode].value) {
      value = Nodes[newNode].value;
      move = newEdge.move;
    }
  }
  Nodes[currentNode].value = value;
  LastNode = nodeMove;

  return [nodeMove, move];
};

/**
 *
 * @param {Number} i row position of the piece
 * @param {Number} j column position of the piece
 * @param {Number} moveI new row position of the piece
 * @param {Number} moveJ new column position of the piece
 * @param {Number} maxDeep Max Deep of the Game tree
 * @param {Boolean} player 0 White pieces , 1 Black pieces
 * @returns {Array} Returns an Array with the next move
 */

export const MiniMaxMove = (i, j, moveI, moveJ, maxDeep = 4, player = 0) => {
  let band = false,
    move;
  for (const newEdge of Nodes[LastNode].edges) {
    let str = EdgeToStr(newEdge.move);
    if (`${i} ${j}\\${moveI} ${moveJ}` == str) {
      LastNode = newEdge.nodeId;
      band = true;
      break;
    }
  }
  //for testing only
  if (!band) {
    console.log(Nodes[LastNode].edges);
  }
  assert(band == true, "Not edge found");
  [LastNode, move] = MinMax(LastNode, 0, maxDeep, player);
  console.log(Nodes[LastNode].value);
  return move;
};

/**
 * @description Initialize Minimax
 * @param {Number[][]} initialBoard
 */
export const InitMinMax = (
  initialBoard = [
    [-1, 0, -1, 0, -1, 0, -1, 0],
    [0, -1, 0, -1, 0, -1, 0, -1],
    [-1, 0, -1, 0, -1, 0, -1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
  ],
  goodGuy = -1
) => {
  //2 1/ 3 0
  GoodGuy = goodGuy;
  let startNode = { ...node };
  startNode.board = initialBoard;
  startNode.edges = [];
  startNode.nodeId = N;
  Nodes.push(startNode);
  N++;
};
// ! remove  when end testing
// InitMinMax()
// //primera jugada
// console.log(MinMax(0, 0, 2, 1));
// console.log(Nodes[LastNode].board);
// //N siguientes jugadas
// console.log("play 1", MiniMaxMove(5, 1, 4, 0, 2, 1));
// console.log(Nodes[LastNode].board);

// console.log("play 2", MiniMaxMove(5, 3, 4, 2, 2, 1));
// console.log(Nodes[LastNode].board);
// // hasta aqui ^-^ bien

// console.log("play 3", MiniMaxMove(6, 4, 4, 2, 2, 1));
// console.log(Nodes[LastNode].board);

// console.log("play 4", MiniMaxMove(6, 2, 5, 1, 2, 1));
// console.log(Nodes[LastNode].board);

// console.log("play 5", MiniMaxMove(5, 5, 4, 6, 2, 1));
// console.log(Nodes[LastNode].board);

// console.log("play 6", MiniMaxMove(7, 3, 6, 2, 2, 1));
// console.log(Nodes[LastNode].board);
