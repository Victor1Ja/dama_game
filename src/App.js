/* eslint-disable no-loop-func */
import "./App.css";

import { useEffect, useReducer, useState } from "react";

// functions
import { MinMax, MiniMaxMove, InitMinMax } from "./utils/functions";

// @mui components
import {
  ThemeProvider,
  useTheme,
  CssBaseline,
  Box,
  TextField,
  Button,
  Checkbox,
} from "@mui/material";

// own components
import Cell from "./components/Cell/Cell";
import Container from "./components/Container/Container";
import BadPiece from "./components/Piece/BadPiece";
import BadQueen from "./components/Piece/BadQueen";
import GoodPiece from "./components/Piece/GoodPiece";
import GoodQueen from "./components/Piece/GoodQueen";

// theme
import dark from "./assets/theme/dark";
import { isIn } from "./utils/utils";

function App() {
  const theme = useTheme();

  const rows = [0, 1, 2, 3, 4, 5, 6, 7];

  const [turns, setTurns] = useState(0);
  const [playerMove, setPlayerMove] = useState({});
  const [movedPiece, setMovedPiece] = useState({});
  const [botPlaying, setBotPlaying] = useState(false);
  const [playerMoves, setPlayerMoves] = useState([]);
  const [trajectories, setTrajectories] = useState([]);

  const [startBot, setStartBot] = useState(true);
  const [started, setStarted] = useState(false);
  const start = () => {
    setStarted(true);
    if (startBot) {
      // is the turn of the bot
      InitMinMax();
      const [, botAction, playerMoves] = MinMax(0, 0, 2, 1);
      console.log(botAction, playerMoves);
      movePiece("bad", botAction[2], botAction[3], {
        y: botAction[0],
        x: botAction[1],
      });
      setPlayerMoves(playerMoves);
      setBotPlaying(false);
      setTurns(turns + 1);
    }
  };

  useEffect(() => {
    if (turns === 1) {
      if (botPlaying) {
        // turn board to number after player move
        const newField = [];
        for (let i = 0; i < field.cells.length; i += 1) {
          const localRow = [];
          for (let j = 0; j < field.cells[0].length; j += 1) {
            if (thereIsABadPiece(i, j)) localRow.push(-1);
            else if (thereIsAGoodPiece(i, j)) localRow.push(1);
            else localRow.push(0);
          }
          newField.push(localRow);
        }
        // is the turn of the player now
        if (botPlaying) InitMinMax(newField);
      }
    }
    if (turns > 1 && botPlaying) {
      let forBot = [];
      if (trajectories.length === 1)
        if (trajectories[0].length > 0) {
          forBot.push(movedPiece.y);
          forBot.push(movedPiece.x);
          trajectories[0].forEach((item) => {
            forBot.push(item.y);
            forBot.push(item.x);
          });
        } else
          forBot = [movedPiece.y, movedPiece.x, playerMove.y, playerMove.x];
      else if (trajectories.length > 2) {
        const killed = pieceCrossed(
          "bad",
          {
            y: movedPiece.y,
            x: movedPiece.x,
          },
          {
            y: playerMove.y,
            x: playerMove.x,
          }
        );
        if (killed.length) {
          forBot.push(movedPiece.y);
          forBot.push(movedPiece.x);
          let found = false;
          let i = 0;
          while (!found && i < trajectories.length) {
            if (
              trajectories[i].y === playerMove.y &&
              trajectories[i].x === playerMove.x
            )
              found = true;
            forBot.push(trajectories[i].y);
            forBot.push(trajectories[i].x);
            i += 1;
          }
        } else
          forBot = [movedPiece.y, movedPiece.x, playerMove.y, playerMove.x];
      } else forBot = [movedPiece.y, movedPiece.x, playerMove.y, playerMove.x];
      setTimeout(() => {
        const [botAction, playerMoves] = MiniMaxMove(forBot, 2, 1);
        let killed;
        if (botAction.length === 4) {
          killed = pieceCrossed(
            "good",
            { y: botAction[0], x: botAction[1] },
            { y: botAction[2], x: botAction[3] }
          );
          if (killed.length)
            killed.forEach((item) => {
              killPiece(item.y, item.x);
            });
        } else {
          let preview = { y: botAction[0], x: botAction[1] };
          for (let i = 2; i < botAction.length; i += 2) {
            const item = { y: botAction[i], x: botAction[i + 1] };
            if (i > 2) preview = { y: botAction[i - 2], x: botAction[i - 1] };
            killed = pieceCrossed("good", preview, item, i - 2 + 1);
            if (killed.length) {
              killed.forEach((item) => {
                killPiece(item.y, item.x);
              });
            }
          }
        }
        movePiece(
          "bad",
          botAction[botAction.length - 2],
          botAction[botAction.length - 1],
          {
            y: botAction[0],
            x: botAction[1],
          }
        );
        promoteQueen("bad");
        setBotPlaying(false);
        setTurns(turns + 1);
        console.log(playerMoves);
        setPlayerMoves(playerMoves);
      }, 500);
    }
  }, [turns]);

  const [selectedPiece, setSelectedPiece] = useState({});

  const piecesReducer = (pieceState, action) => {
    switch (action.type) {
      case "promotion": {
        const newPieceState = pieceState;
        const { team } = action;
        if (team === "good") {
          for (let j = 0; j < newPieceState[0].length; j += 1)
            if (newPieceState[0][j] === 1) newPieceState[0][j] = 2;
        } else
          for (let j = 0; j < newPieceState[7].length; j += 1)
            if (newPieceState[7][j] === -1) newPieceState[7][j] = -2;

        return newPieceState;
      }
      case "kill": {
        const newPieceState = pieceState;
        const { position } = action;
        newPieceState[position.y][position.x] = 0;
        return newPieceState;
      }
      case "move": {
        const newPieceState = pieceState;
        const { team, newPosition, oldPosition } = action;

        if (newPieceState[oldPosition.y][oldPosition.x] !== 0) {
          let value = 1;
          if (team === "good")
            value = newPieceState[oldPosition.y][oldPosition.x] === 1 ? 1 : 2;
          else
            value =
              newPieceState[oldPosition.y][oldPosition.x] === -1 ? -1 : -2;
          newPieceState[oldPosition.y][oldPosition.x] = 0;
          newPieceState[newPosition.y][newPosition.x] = value;
        }
        return newPieceState;
      }
      case "return": {
        const newPieceState = pieceState;
        for (let i = 0; i < newPieceState.length; i += 1)
          for (let j = 0; j < newPieceState[i].length; j += 1) {
            if (newPieceState[i][j] > 2) newPieceState[i][j] -= 2;
            else if (newPieceState[i][j] < -2) newPieceState[i][j] += 2;
          }
        return newPieceState;
      }
      default:
        return [
          [-1, 0, -1, 0, -1, 0, -1, 0],
          [0, -1, 0, -1, 0, -1, 0, -1],
          [-1, 0, -1, 0, -1, 0, -1, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0],
          [0, 1, 0, 1, 0, 1, 0, 1],
        ];
    }
  };

  const [pieces, setPieces] = useReducer(piecesReducer, [
    [-1, 0, -1, 0, -1, 0, -1, 0],
    [0, -1, 0, -1, 0, -1, 0, -1],
    [-1, 0, -1, 0, -1, 0, -1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    /*[0, 0, 2, 0, 0, 0, -1, 0],
    [0, -1, 0, 0, 0, -1, 0, -1],
    [-1, 0, -1, 0, 0, 0, -1, 0],
    [0, -2, 0, 0, 0, 1, 0, 1],
    [-1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1],*/
  ]);

  useEffect(() => {
    if (playerMoves.length === 1)
      selectGoodPiece({
        target: { id: `${playerMoves[0].move[0]}:${playerMoves[0].move[1]}` },
        unique: true,
      });
  }, [playerMoves]);

  const fieldReducer = (fieldState, action) => {
    const { type, array } = action;
    switch (type) {
      case "init": {
        return {
          cells: array,
        };
      }
      case "set":
        return {
          cells: fieldState.cells,
        };
      default:
        break;
    }
  };

  const [field, setField] = useReducer(fieldReducer, {});

  const validPosition = (y, x) => {
    if (y >= field.cells.length || y < 0) return false;
    if (x >= field.cells[0].length || x < 0) return false;
    return true;
  };

  const thereIsABadPiece = (y, x) => {
    return pieces[y][x] === -1 || pieces[y][x] === -2;
  };

  const thereIsAGoodPiece = (y, x) => {
    return pieces[y][x] === 1 || pieces[y][x] === 2;
  };

  const thereIsNotAPiece = (y, x) => {
    return !thereIsAGoodPiece(y, x) && !thereIsABadPiece(y, x);
  };

  const selectGoodPiece = (e) => {
    if (playerMoves.length > 1 || e.unique) {
      let node = e.target;
      if (node.nodeName)
        while (node.nodeName.toLowerCase() !== "button") node = node.parentNode;
      const { id } = node;
      const [y, x] = id.split(":");
      const nY = Number(y);
      const nX = Number(x);
      cleanField();
      // checking for valid move
      const filter = playerMoves.filter((item) => {
        if (item.move[0] === nY && item.move[1] === nX) return item;
        return null;
      });
      if (filter.length) {
        // looking for possibles steps
        const newField = field;
        const victims = lookForMove({ y: nY, x: nX });
        victims.forEach((item) => {
          if (item.length) {
            const last = item[item.length - 1];
            newField.cells[last.y][last.x] = { target: `${last.y}:${last.x}` };
          } else
            newField.cells[item.y][item.x] = { target: `${item.y}:${item.x}` };
        });
        setTrajectories(victims);
        setField({ type: "set", array: newField });
        setSelectedPiece({ y: nY, x: nX });
      } else {
        selectGoodPiece({
          target: { id: `${playerMoves[0].move[0]}:${playerMoves[0].move[1]}` },
          unique: true,
        });
      }
    }
  };

  const selectBadPiece = (e) => {
    let node = e.target;
    if (node.nodeName === "path") node = node.parentNode;
    if (node.nodeName === "svg") node = node.parentNode;
    const { id } = node;
    const [y, x] = id.split(":");
    const nY = Number(y);
    const nX = Number(x);
    const newField = field;
    for (let i = 0; i < field.cells.length; i += 1)
      for (let j = 0; j < field.cells[0].length; j += 1)
        newField.cells[i][j] = i;
    // bottom - left
    if (nY < newField.cells.length - 1 && nX > 0) {
      if (!thereIsNotAPiece(nY + 1, nX - 1))
        newField.cells[nY + 1][nX - 1] = "0";
      else if (
        nY + 1 < newField.cells.length - 1 &&
        nX - 1 > 0 &&
        !thereIsNotAPiece(nY + 2, nX - 2)
      )
        newField.cells[nY + 2][nX - 2] = "0";
    }

    // bottom - right
    if (nY < newField.cells.length - 1 && nX < newField.cells[0].length - 1) {
      if (!thereIsNotAPiece(nY + 1, nX + 1))
        newField.cells[nY + 1][nX + 1] = "0";
      else if (
        nY + 1 < newField.cells.length - 1 &&
        nX + 1 < newField.cells[0].length - 1 &&
        !thereIsNotAPiece(nY + 2, nX + 2)
      )
        newField.cells[nY + 2][nX + 2] = "0";
    }

    setField({ type: "set", array: newField });
  };

  const lookForMove = (
    position,
    chain = 0,
    isAQueen = undefined,
    directions = {
      "bottom-left": true,
      "bottom-right": true,
      "top-left": true,
      "top-right": true,
    },
    anotherCall = undefined
  ) => {
    let localY = position.y;
    let localX = position.x;
    const result = [];
    if (validPosition(localY, localX))
      if (pieces[position.y][position.x] === 2 || isAQueen) {
        if (directions["bottom-left"])
          if (position.y < field.cells.length - 1 && position.x > 0) {
            // bottom-left
            localY = position.y + 1;
            localX = position.x - 1;
            let pieceFound = false;
            while (localY <= field.cells.length - 1 && localX >= 0) {
              if (thereIsNotAPiece(localY, localX)) {
                if (pieceFound) {
                  result.push({
                    y: localY,
                    x: localX,
                    kill: true,
                    chain: chain + 1,
                  });
                  pieces[localY - 1][localX + 1] -= 2;
                  console.log(pieces);
                  lookForMove(
                    { y: localY, x: localX },
                    chain + 1,
                    true,
                    {
                      "bottom-right": true,
                      "bottom-left": true,
                      "top-left": true,
                    },
                    true
                  ).forEach((item) => {
                    if (!isIn(result, item)) result.push(item);
                  });
                }
                if (chain === 0 && !isIn(result, { y: localY, x: localX }))
                  result.push({ y: localY, x: localX });
                else break;
              } else {
                if (pieceFound) break;
                if (thereIsABadPiece(localY, localX)) pieceFound = true;
                else break;
              }
              localY = localY + 1;
              localX = localX - 1;
            }
          }
        if (directions["bottom-right"])
          if (
            position.y < field.cells.length - 1 &&
            position.x < field.cells[0].length - 1
          ) {
            // bottom-right
            localY = position.y + 1;
            localX = position.x + 1;
            let pieceFound = false;
            while (
              localY <= field.cells.length - 1 &&
              localX <= field.cells[0].length - 1
            ) {
              if (thereIsNotAPiece(localY, localX)) {
                if (pieceFound) {
                  result.push({
                    y: localY,
                    x: localX,
                    kill: true,
                    chain: chain + 1,
                  });
                  pieces[localY - 1][localX - 1] -= 2;
                  console.log(pieces);
                  lookForMove(
                    { y: localY, x: localX },
                    chain + 1,
                    true,
                    {
                      "bottom-right": true,
                      "bottom-left": true,
                      "top-right": true,
                    },
                    true
                  ).forEach((item) => {
                    if (!isIn(result, item)) result.push(item);
                  });
                }
                if (chain === 0 && !isIn(result, { y: localY, x: localX }))
                  result.push({ y: localY, x: localX });
                else break;
              } else {
                if (pieceFound) break;
                if (thereIsABadPiece(localY, localX)) pieceFound = true;
                else break;
              }
              localY = localY + 1;
              localX = localX + 1;
            }
          }
        if (directions["top-left"])
          if (position.y > 0 && position.x > 0) {
            // top - left
            localY = position.y - 1;
            localX = position.x - 1;
            let pieceFound = false;
            while (localY >= 0 && localX >= 0) {
              if (thereIsNotAPiece(localY, localX)) {
                if (pieceFound) {
                  result.push({
                    y: localY,
                    x: localX,
                    kill: true,
                    chain: chain + 1,
                  });
                  pieces[localY + 1][localX + 1] -= 2;
                  console.log(pieces);
                  lookForMove(
                    { y: localY, x: localX },
                    chain + 1,
                    true,
                    {
                      "bottom-left": true,
                      "top-left": true,
                      "top-right": true,
                    },
                    true
                  ).forEach((item) => {
                    if (!isIn(result, item)) result.push(item);
                  });
                }
                if (chain === 0 && !isIn(result, { y: localY, x: localX }))
                  result.push({ y: localY, x: localX });
                else break;
              } else {
                if (pieceFound) break;
                if (thereIsABadPiece(localY, localX)) pieceFound = true;
                else break;
              }
              localY = localY - 1;
              localX = localX - 1;
            }
          }
        if (directions["top-right"])
          if (position.y > 0 && position.x < field.cells[0].length - 1) {
            // top - right
            localY = position.y - 1;
            localX = position.x + 1;
            let pieceFound = false;
            while (localY >= 0 && localX <= field.cells[0].length - 1) {
              if (thereIsNotAPiece(localY, localX)) {
                if (pieceFound) {
                  result.push({
                    y: localY,
                    x: localX,
                    kill: true,
                    chain: chain + 1,
                  });
                  pieces[localY + 1][localX - 1] -= 2;
                  console.log(pieces);
                  lookForMove(
                    { y: localY, x: localX },
                    chain + 1,
                    true,
                    {
                      "bottom-right": true,
                      "top-left": true,
                      "top-right": true,
                    },
                    true
                  ).forEach((item) => {
                    if (!isIn(result, item)) result.push(item);
                  });
                }
                if (chain === 0 && !isIn(result, { y: localY, x: localX }))
                  result.push({ y: localY, x: localX });
                else break;
              } else {
                if (pieceFound) break;
                if (thereIsABadPiece(localY, localX)) pieceFound = true;
                else break;
              }
              localY = localY - 1;
              localX = localX + 1;
            }
          }
      } else {
        if (directions["top-left"]) {
          // top - left
          if (position.y > 0 && position.x > 0) {
            localY = position.y - 1;
            localX = position.x - 1;
            if (thereIsNotAPiece(localY, localX))
              result.push({ y: localY, x: localX });
            else {
              if (thereIsABadPiece(localY, localX)) {
                localY = localY - 1;
                localX = localX - 1;
                if (localY >= 0 && localX >= 0)
                  if (thereIsNotAPiece(localY, localX)) {
                    result.push({
                      y: localY,
                      x: localX,
                      kill: true,
                      chain: chain + 1,
                    });
                    lookForMove(
                      { y: localY, x: localX },
                      chain + 1,
                      false,
                      {
                        "bottom-left": true,
                        "top-left": true,
                        "top-right": true,
                      },
                      true
                    ).forEach((item) => {
                      if (!isIn(result, item)) result.push(item);
                    });
                  }
              }
            }
          }
        }
        if (directions["top-right"])
          if (position.y > 0 && position.x < field.cells[0].length - 1) {
            // top - right
            localY = position.y - 1;
            localX = position.x + 1;
            if (thereIsNotAPiece(localY, localX))
              result.push({ y: localY, x: localX });
            else {
              if (thereIsABadPiece(localY, localX)) {
                localY = localY - 1;
                localX = localX + 1;
                if (localY >= 0 && localX <= field.cells[0].length - 1)
                  if (thereIsNotAPiece(localY, localX)) {
                    result.push({
                      y: localY,
                      x: localX,
                      kill: true,
                      chain: chain + 1,
                    });
                    lookForMove(
                      { y: localY, x: localX },
                      chain + 1,
                      false,
                      {
                        "bottom-right": true,
                        "top-left": true,
                        "top-right": true,
                      },
                      true
                    ).forEach((item) => {
                      if (!isIn(result, item)) result.push(item);
                    });
                  }
              }
            }
          }
      }
    if (!anotherCall) {
      setPieces({ type: "return" });
      // getting just kill chains
      const chains = result.filter((item) => {
        if (item.chain) return item;
        return null;
      });
      // looking for best chain
      let auxiliary = [];
      let bestChain = [];
      let currentChain = [];
      chains.forEach((item) => {
        if (item.chain === 1 && currentChain.length) {
          if (currentChain.length > bestChain.length) {
            auxiliary = [];
            bestChain = currentChain;
          }
          if (currentChain.length === bestChain.length)
            auxiliary.push(currentChain);
          currentChain = [];
        } else if (
          currentChain.length &&
          item.chain === currentChain[currentChain.length - 1].chain
        ) {
          const temp = [];
          for (let i = 0; i < currentChain.length - 1; i += 1)
            temp.push(currentChain[i]);
          temp.push(item);
          auxiliary.push(temp);
        } else currentChain.push(item);
      });
      if (chains.length === 0)
        chains.forEach((item) => {
          if (item.kill && currentChain.length) {
            if (currentChain.length > bestChain.length) {
              auxiliary = [];
              bestChain = currentChain;
            }
            if (currentChain.length === bestChain.length)
              auxiliary.push(currentChain);
            currentChain = [];
          }
          currentChain.push(item);
        });
      if (currentChain.length && bestChain.length === currentChain.length)
        auxiliary.push(currentChain);
      if (auxiliary.length > 0) {
        if (bestChain.length === 0 && currentChain.length) {
          const temp = [];
          currentChain.forEach((item) => {
            temp.push(item);
          });
          auxiliary.push(temp);
        }
        return auxiliary;
      }
      if (bestChain.length === 0 && currentChain.length > 0)
        return [currentChain];
      if (currentChain.length === 0) return result;
      return [bestChain];
    }
    return result;
  };

  const getPiece = (position, team = undefined) => {
    if (!team) return pieces[position.y][position.x];
    const piece = pieces[position.y][position.x];
    if (team === "good" && piece > 0) return piece;
    else if (team === "bad" && piece < -2) return 0;
  };

  const pieceCrossed = (team, oldPosition, newPosition, chain = 0) => {
    const piece = getPiece(oldPosition);
    const toKill = [];
    let localY = oldPosition.y;
    let localX = oldPosition.x;
    if (piece !== 0 || chain > 0) {
      // direction
      // top - left
      localY -= 1;
      localX -= 1;
      while (localY > newPosition.y && localX > newPosition.x) {
        const pieceKilled = getPiece({
          y: localY,
          x: localX,
        });

        if (pieceKilled !== 0) toKill.push({ y: localY, x: localX });
        localY -= 1;
        localX -= 1;
      }
      // top - right
      localY = oldPosition.y - 1;
      localX = oldPosition.x + 1;
      while (localY > newPosition.y && localX < newPosition.x) {
        const pieceKilled = getPiece(
          {
            y: localY,
            x: localX,
          },
          team
        );

        if (pieceKilled !== 0) toKill.push({ y: localY, x: localX });
        localY -= 1;
        localX += 1;
      }
      // bottom - left
      localY = oldPosition.y + 1;
      localX = oldPosition.x - 1;
      while (localY < newPosition.y && localX > newPosition.x) {
        const pieceKilled = getPiece({
          y: localY,
          x: localX,
        });
        if (pieceKilled !== 0) toKill.push({ y: localY, x: localX });
        localY += 1;
        localX -= 1;
      }
      // bottom - right
      localY = oldPosition.y + 1;
      localX = oldPosition.x + 1;
      while (localY < newPosition.y && localX < newPosition.x) {
        const pieceKilled = getPiece({
          y: localY,
          x: localX,
        });
        if (pieceKilled !== 0) toKill.push({ y: localY, x: localX });
        localY += 1;
        localX += 1;
      }
    }
    return toKill;
  };

  const movePiece = (team, y, x, oldPosition) => {
    const newPosition = { y, x };
    setPieces({ type: "move", team, newPosition, oldPosition });
  };

  const killPiece = (y, x) => {
    setPieces({ type: "kill", position: { y, x } });
  };

  const cleanField = () => {
    // clean board
    const newField = field;
    for (let i = 0; i < field.cells.length; i += 1)
      for (let j = 0; j < field.cells[0].length; j += 1)
        newField.cells[i][j] = i;
    setField({ type: "set", array: newField });
  };

  const possibleKillClick = (cell) => {
    setSelectedPiece({});
    if (!botPlaying) {
      const [cY, cX] = cell.split(":");
      // y,x of target as number
      const nTargetY = Number(cY);
      const nTargetX = Number(cX);
      // y,x of origin as number
      const nPieceY = Number(selectedPiece.y);
      const nPieceX = Number(selectedPiece.x);
      let Abreak = false;
      for (let i = 0; i < trajectories.length && !Abreak; i += 1) {
        const item = trajectories[i];
        if (item.length) {
          const filter = item.filter((jtem) => {
            if (jtem.y === nTargetY && jtem.x === nTargetX) return jtem;
            return null;
          });
          if (filter.length) {
            let preview = { y: nPieceY, x: nPieceX };
            item.forEach((jtem, j) => {
              if (j > 0) preview = item[j - 1];
              const killed = pieceCrossed("bad", preview, jtem, j);
              if (killed.length) {
                killed.forEach((ktem) => {
                  killPiece(ktem.y, ktem.x);
                });
                Abreak = true;
              }
            });
          }
        } else {
          const killed = pieceCrossed("bad", selectedPiece, item);
          if (killed.length) {
            killed.forEach((ktem) => {
              killPiece(ktem.y, ktem.x);
            });
            Abreak = true;
          }
        }
      }
      movePiece("good", nTargetY, nTargetX, { ...selectedPiece });
      setBotPlaying(true);
      setMovedPiece({ ...selectedPiece });
      setPlayerMove({ y: nTargetY, x: nTargetX });
      setTurns(turns + 1);
    }
    cleanField();
  };

  const possibleStepClick = (e) => {
    setSelectedPiece({});
    if (!botPlaying) {
      const { id } = e.target;
      const [y, x] = id.split(":");
      const nY = Number(y);
      const nX = Number(x);
      movePiece("good", nY, nX, { ...selectedPiece });
      setBotPlaying(true);
      setMovedPiece({ ...selectedPiece });
      setPlayerMove({ y: nY, x: nX });
      setTurns(turns + 1);
    }
    cleanField();
  };

  useEffect(() => {
    const newField = [];
    rows.forEach((item, i) => {
      newField.push([...rows]);
    });
    setField({ type: "init", array: newField });
  }, []);

  const promoteQueen = (team) => {
    setPieces({ type: "promotion", team });
  };

  useEffect(() => {
    if (playerMove.y === 0) promoteQueen("good");
  }, [movedPiece]);

  // components

  const [maxDeep, setMaxDeep] = useState(10);

  useEffect(() => {}, [pieces]);

  return (
    <ThemeProvider theme={dark}>
      <CssBaseline />
      <Box className="App">
        <Container
          alignItems="start "
          flexDirection="column"
          sx={{ position: "absolute", left: 0, margin: "20px 10px" }}
        >
          <TextField
            label="Máxima profundida"
            value={maxDeep}
            onChange={(e) => {
              if (Number(e.target.value) >= 2 && Number(e.target.value) <= 20)
                if (Number(e.target.value) > maxDeep)
                  setMaxDeep(Number(e.target.value) + 1);
                else setMaxDeep(Number(e.target.value) - 1);
            }}
            type="number"
            max={10}
            min={1}
          />
          <Container alignItems="center">
            <Checkbox
              checked={startBot}
              onChange={(e) => setStartBot(e.target.checked)}
            />
            <label>Bot primero </label>
          </Container>
          <Button
            sx={{ cursor: "pointer !important" }}
            variant="contained"
            onClick={start}
          >
            Comenzar
          </Button>
        </Container>
        <header className="App-header">
          {pieces.map((item, i) => {
            return (
              <Container key={i}>
                {item.map((jtem, j) => (
                  <Cell even={(i + j) % 2 !== 0} key={j}>
                    {jtem === -1 && (
                      <BadPiece
                        id={`${i}:${j}`}
                        started={started}
                        selectBadPiece={selectBadPiece}
                      />
                    )}
                    {jtem === -2 && (
                      <BadQueen
                        id={`${i}:${j}`}
                        started={started}
                        selectBadPiece={selectBadPiece}
                      />
                    )}
                    {jtem === 1 && (
                      <GoodPiece
                        id={`${i}:${j}`}
                        started={started}
                        selectGoodPiece={selectGoodPiece}
                      />
                    )}
                    {jtem === 2 && (
                      <GoodQueen
                        id={`${i}:${j}`}
                        started={started}
                        selectGoodPiece={selectGoodPiece}
                      />
                    )}
                    {field.cells &&
                      i === selectedPiece.y &&
                      j === selectedPiece.x && (
                        <Box
                          sx={{
                            background: theme.palette.success.main,
                            width: "60px",
                            height: "60px",
                            zIndex: 1,
                            position: "absolute",
                            cursor: "pointer",
                          }}
                        />
                      )}
                    {field.cells && field.cells[i][j] === "0" && (
                      <Box
                        sx={{
                          background: theme.palette.error.main,
                          width: "60px",
                          height: "60px",
                          zIndex: 1,
                          position: "absolute",
                          cursor: "pointer",
                        }}
                      />
                    )}
                    {field.cells && field.cells[i][j] === "1" && (
                      <Box
                        sx={{
                          background: theme.palette.warning.main,
                          width: "60px",
                          height: "60px",
                          zIndex: 1,
                          position: "absolute",
                          cursor: "pointer",
                        }}
                        id={`${i}:${j}`}
                        onClick={possibleStepClick}
                      />
                    )}
                    {field.cells && field.cells[i][j].target && (
                      <Box
                        sx={{
                          background: theme.palette.warning.main,
                          width: "60px",
                          height: "60px",
                          zIndex: 1,
                          position: "absolute",
                          cursor: "pointer",
                        }}
                        id={`${i}:${j}`}
                        onClick={(e) => possibleKillClick(e.target.id)}
                      />
                    )}
                  </Cell>
                ))}
              </Container>
            );
          })}
        </header>
      </Box>
    </ThemeProvider>
  );
}

export default App;
