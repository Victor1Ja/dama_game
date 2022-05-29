import "./App.css";

import { useEffect, useReducer, useState } from "react";

// functions
import { MinMax, MiniMaxMove, InitMinMax } from "./utils/functions";

// @mui components
import {
  ThemeProvider,
  useTheme,
  CssBaseline,
  IconButton,
  Box,
  TextField,
  Button,
  Checkbox,
} from "@mui/material";

// @mui icons
import TokenIcon from "@mui/icons-material/Token";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";

// own components
import Cell from "./components/Cell/Cell";
import Container from "./components/Container/Container";

// theme
import dark from "./assets/theme/dark";

function App() {
  const theme = useTheme();

  const rows = [0, 1, 2, 3, 4, 5, 6, 7];

  const [turns, setTurns] = useState(0);
  const [playerMove, setPlayerMove] = useState({});
  const [movedPiece, setMovedPiece] = useState({});
  const [botPlaying, setBotPlaying] = useState(false);

  const [startBot, setStartBot] = useState(true);
  const [started, setStarted] = useState(false);
  const start = () => {
    setStarted(true);
    if (startBot) {
      // is the turn of the bot
      InitMinMax();
      const [team, botAction] = MinMax(0, 0, 2, 1);
      movePiece("bad", botAction[2], botAction[3], {
        y: botAction[0],
        x: botAction[1],
      });
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
      setTimeout(() => {
        const botAction = MiniMaxMove(
          movedPiece.y,
          movedPiece.x,
          playerMove.y,
          playerMove.x,
          2,
          1
        );
        const killed = pieceCrossed(
          "good",
          { y: botAction[0], x: botAction[1] },
          { y: botAction[2], x: botAction[3] }
        );

        if (killed.length)
          killed.forEach((item) => {
            killPiece("good", item.y, item.x);
          });

        movePiece("bad", botAction[2], botAction[3], {
          y: botAction[0],
          x: botAction[1],
        });
        setBotPlaying(false);
        setTurns(turns + 1);
      }, 500);
    }
  }, [turns]);

  const [selectedPiece, setSelectedPiece] = useState({});

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
        break;
      default:
        break;
    }
  };

  const [field, setField] = useReducer(fieldReducer, {});

  const piecesReducer = (teamPieces, action) => {
    const { type } = action;
    switch (type) {
      case "move": {
        const { newPosition, oldPosition } = action;
        const newArray = [...teamPieces];
        let k = 0;
        let found = false;
        while (k < newArray.length && found === false) {
          if (
            newArray[k].y === oldPosition.y &&
            newArray[k].x === oldPosition.x
          )
            found = true;
          else k += 1;
        }
        if (found) {
          newArray[k].y = newPosition.y;
          newArray[k].x = newPosition.x;
        }
        return newArray;
      }
      case "kill": {
        const { position } = action;
        const newArray = [];
        let k = 0;
        while (k < teamPieces.length) {
          if (
            !(teamPieces[k].y === position.y && teamPieces[k].x === position.x)
          )
            newArray.push(teamPieces[k]);
          k += 1;
        }
        return newArray;
      }
      default:
        break;
    }
  };

  const [goodPieces, setGoodPieces] = useReducer(piecesReducer, [
    { y: 5, x: 7, queen: false },
    { y: 6, x: 6, queen: false },
    { y: 7, x: 7, queen: false },
    { y: 5, x: 5, queen: false },
    { y: 6, x: 4, queen: false },
    { y: 7, x: 5, queen: false },
    { y: 5, x: 3, queen: false },
    { y: 6, x: 2, queen: false },
    { y: 7, x: 3, queen: false },
    { y: 5, x: 1, queen: false },
    { y: 6, x: 0, queen: false },
    { y: 7, x: 1, queen: false },
  ]);

  const [badPieces, setBadPieces] = useReducer(piecesReducer, [
    { y: 0, x: 0, queen: false },
    { y: 2, x: 0, queen: false },
    { y: 1, x: 1, queen: false },
    { y: 0, x: 2, queen: false },
    { y: 2, x: 2, queen: false },
    { y: 1, x: 3, queen: false },
    { y: 0, x: 4, queen: false },
    { y: 2, x: 4, queen: false },
    { y: 1, x: 5, queen: false },
    { y: 0, x: 6, queen: false },
    { y: 2, x: 6, queen: false },
    { y: 1, x: 7, queen: false },
  ]);

  const thereIsABadPiece = (y, x) => {
    for (const piece of badPieces)
      if (piece.y === y && piece.x === x) return true;
    return false;
  };

  const thereIsAGoodPiece = (y, x) => {
    for (const piece of goodPieces)
      if (piece.y === y && piece.x === x) return true;
    return false;
  };

  const thereIsNotAPiece = (y, x) => {
    return !thereIsAGoodPiece(y, x) && !thereIsABadPiece(y, x);
  };

  const selectGoodPiece = (e) => {
    let node = e.target;
    if (node.nodeName.toLowerCase() === "svg") node = node.parentNode;
    if (node.nodeName.toLowerCase() === "path") node = node.parentNode;
    const { id } = node;
    const [y, x] = id.split(":");
    const nY = Number(y);
    const nX = Number(x);
    const newField = field;
    for (let i = 0; i < field.cells.length; i += 1)
      for (let j = 0; j < field.cells[0].length; j += 1)
        newField.cells[i][j] = i;

    // looking for possibles steps

    const piece = getPiece("good", { y: nY, x: nX });
    if (piece.y) {
      const victims = lookForVictims(piece);
      victims.forEach((item) => {
        newField.cells[item.y][item.x] = {
          target: `${item.y}:${item.x}`,
        };
      });
      setField({ type: "set", array: newField });
      setSelectedPiece({ y: nY, x: nX });
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

  const lookForVictims = (position) => {
    let localY = position.y - 1;
    let localX = position.x - 1;
    const result = [];
    if (position.queen) {
      // bottom-left
      // bottom-right
    }
    // top - left
    if (position.y > 0 && position.x > 0) {
      if (thereIsNotAPiece(position.y - 1, position.x - 1))
        result.push({ y: position.y - 1, x: position.x - 1 });
      else {
        localY = position.y - 2;
        localX = position.x - 2;
        while (
          localY >= 0 &&
          localX >= 0 &&
          thereIsNotAPiece(localY, localX) &&
          thereIsABadPiece(localY + 1, localX + 1)
        ) {
          result.push({
            y: localY,
            x: localX,
          });
          localY = localY - 2;
          localX = localX - 2;
        }
      }
    }
    // top - right
    if (position.y > 0 && position.x < field.cells[0].length - 1) {
      if (thereIsNotAPiece(position.y - 1, position.x + 1))
        result.push({ y: position.y - 1, x: position.x + 1 });
      else {
        localY = position.y - 2;
        localX = position.x + 2;
        while (
          localY >= 0 &&
          localX < field.cells[0].length - 1 &&
          thereIsNotAPiece(localY, localX) &&
          thereIsABadPiece(localY + 1, localX - 1)
        ) {
          result.push({
            y: localY,
            x: localX,
          });
          localY = localY - 2;
          localX = localX + 2;
        }
      }
    }
    return result;
  };

  const getPiece = (team, position) => {
    let piece = {};
    if (team === "good") {
      let i = 0;
      while (!piece.y && i < goodPieces.length) {
        if (goodPieces[i].y === position.y && goodPieces[i].x === position.x)
          piece = { ...goodPieces[i] };
        i += 1;
      }
    } else {
      let i = 0;
      while (!piece.y && i < badPieces.length) {
        if (badPieces[i].y === position.y && badPieces[i].x === position.x)
          piece = { ...badPieces[i] };
        i += 1;
      }
    }
    return piece;
  };

  const pieceCrossed = (team, oldPosition, newPosition) => {
    const piece = getPiece(team === "good" ? "bad" : "good", oldPosition);
    const toKill = [];
    let localY = oldPosition.y;
    let localX = oldPosition.x;
    if (piece.y) {
      // direction
      // top - left
      localY -= 1;
      localX -= 1;
      while (localY > newPosition.y && localX > newPosition.x) {
        const pieceKilled = getPiece(team, {
          y: localY,
          x: localX,
        });

        if (pieceKilled.y) toKill.push(pieceKilled);
        localY -= 1;
        localX -= 1;
      }
      // top - right
      localY = oldPosition.y - 1;
      localX = oldPosition.x + 1;
      while (localY > newPosition.y && localX < newPosition.x) {
        const pieceKilled = getPiece(team, {
          y: localY,
          x: localX,
        });

        if (pieceKilled.y) toKill.push(pieceKilled);
        localY -= 1;
        localX += 1;
      }
      // bottom - left
      localY = oldPosition.y + 1;
      localX = oldPosition.x - 1;
      while (localY < newPosition.y && localX > newPosition.x) {
        const pieceKilled = getPiece(team, {
          y: localY,
          x: localX,
        });
        if (pieceKilled.y) toKill.push(pieceKilled);
        localY += 1;
        localX -= 1;
      }
      // bottom - right
      localY = oldPosition.y + 1;
      localX = oldPosition.x + 1;
      while (localY < newPosition.y && localX < newPosition.x) {
        const pieceKilled = getPiece(team, {
          y: localY,
          x: localX,
        });
        if (pieceKilled.y) toKill.push(pieceKilled);
        localY += 1;
        localX += 1;
      }
    }
    return toKill;
  };

  const movePiece = (team, y, x, oldPosition) => {
    const newPosition = { y, x };
    if (team === "good")
      setGoodPieces({ type: "move", newPosition, oldPosition });
    else setBadPieces({ type: "move", newPosition, oldPosition });
  };

  const killPiece = (team, y, x) => {
    if (team === "good") setGoodPieces({ type: "kill", position: { y, x } });
    else setBadPieces({ type: "kill", position: { y, x } });
  };

  const cleanField = () => {
    // clean board
    const newField = field;
    for (let i = 0; i < field.cells.length; i += 1)
      for (let j = 0; j < field.cells[0].length; j += 1)
        newField.cells[i][j] = i;
    setField({ type: "set", array: newField });
  };

  const possibleKillClick = (cell, target) => {
    if (!botPlaying) {
      const [cY, cX] = cell.split(":");
      // y,x of cell as number
      const ncY = Number(cY);
      const ncX = Number(cX);
      // y,x of target as number
      const ntY = Number(selectedPiece.y);
      const ntX = Number(selectedPiece.x);
      const killed = pieceCrossed(
        "bad",
        { y: ntY, x: ntX },
        { y: ncY, x: ncX }
      );

      if (killed.length)
        killed.forEach((item) => {
          killPiece("bad", item.y, item.x);
        });
      movePiece("good", ncY, ncX, { ...selectedPiece });
      setBotPlaying(true);
      setMovedPiece({ ...selectedPiece });
      setPlayerMove({ y: ncY, x: ncX });
      setTurns(turns + 1);
    }
    cleanField();
  };

  const possibleStepClick = (e) => {
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

  // components

  const GoodPiece = (props) => {
    const { id } = props;
    return (
      <IconButton
        disabled={!started}
        id={id}
        onClick={selectGoodPiece}
        color="success"
      >
        <AccessibilityNewIcon sx={{ zIndex: 2 }} />
      </IconButton>
    );
  };

  const BadPiece = (props) => {
    const { id } = props;
    return (
      <IconButton
        disabled={!started}
        id={id}
        onClick={selectBadPiece}
        color="error"
      >
        <TokenIcon sx={{ zIndex: 2 }} />
      </IconButton>
    );
  };

  const [maxDeep, setMaxDeep] = useState(10);

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
          {rows.map((item, i) => {
            return (
              <Container key={i}>
                {rows.map((jtem, j) => (
                  <Cell even={(i + j) % 2 !== 0} key={j}>
                    {thereIsABadPiece(i, j) && <BadPiece id={`${i}:${j}`} />}
                    {thereIsAGoodPiece(i, j) && <GoodPiece id={`${i}:${j}`} />}
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
