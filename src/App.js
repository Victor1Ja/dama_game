import "./App.css";

import { useEffect, useReducer, useState } from "react";

// @mui components
import {
  ThemeProvider,
  useTheme,
  CssBaseline,
  IconButton,
  Box,
  TextField,
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

  const [selectedPiece, setSelectedPiece] = useState({});
  const [botPlaying, setBotPlaying] = useState(false);

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

  const piecesReducer = (goodPieces, action) => {
    const { type } = action;
    switch (type) {
      case "move": {
        const { newPosition, oldPosition } = action;
        const newArray = [...goodPieces];
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
        const newArray = [...goodPieces];
        let k = 0;
        let found = false;
        while (k < newArray.length && found === false) {
          if (newArray[k].y === position.y && newArray[k].x === position.x)
            found = true;
          else k += 1;
        }
        newArray.splice(k - 1, 1);
        return newArray;
      }
      default:
        break;
    }
  };

  const [goodPieces, setGoodPieces] = useReducer(piecesReducer, [
    { y: 5, x: 6, queen: false },
    { y: 6, x: 7, queen: false },
    { y: 7, x: 6, queen: false },
    { y: 5, x: 4, queen: false },
    { y: 6, x: 5, queen: false },
    { y: 7, x: 4, queen: false },
    { y: 5, x: 2, queen: false },
    { y: 6, x: 3, queen: false },
    { y: 7, x: 2, queen: false },
    { y: 5, x: 0, queen: false },
    { y: 6, x: 1, queen: false },
    { y: 7, x: 0, queen: false },
  ]);

  const [badPieces, setBadPieces] = useReducer(piecesReducer, [
    { y: 1, x: 0, queen: false },
    { y: 0, x: 1, queen: false },
    { y: 2, x: 1, queen: false },
    { y: 1, x: 2, queen: false },
    { y: 0, x: 3, queen: false },
    { y: 2, x: 3, queen: false },
    { y: 1, x: 4, queen: false },
    { y: 0, x: 5, queen: false },
    { y: 2, x: 5, queen: false },
    { y: 1, x: 6, queen: false },
    { y: 2, x: 7, queen: false },
    { y: 0, x: 7, queen: false },
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
    return thereIsAGoodPiece(y, x) || thereIsABadPiece(y, x);
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
    // top - left
    if (nY > 0 && nX > 0) {
      if (!thereIsNotAPiece(nY - 1, nX - 1))
        newField.cells[nY - 1][nX - 1] = "1";
      else if (
        nY - 1 > 0 &&
        nX - 1 > 0 &&
        !thereIsNotAPiece(nY - 2, nX - 2) &&
        thereIsABadPiece(nY - 1, nX - 1)
      )
        newField.cells[nY - 2][nX - 2] = { target: `${nY}:${nX}` };
    }

    // top - right
    if (nY > 0 && nX < newField.cells[0].length - 1) {
      if (!thereIsNotAPiece(nY - 1, nX + 1))
        newField.cells[nY - 1][nX + 1] = "1";
      else if (
        nY - 1 > 0 &&
        nX + 1 < newField.cells[0].length - 1 &&
        !thereIsNotAPiece(nY - 2, nX + 2) &&
        thereIsABadPiece(nY - 1, nX - 1)
      )
        newField.cells[nY - 2][nX + 2] = { target: `${nY}:${nX}` };
    }
    /*
    // bottom - left
    if (
      nY < newField.cells.length - 1 &&
      nX > 0 &&
      !thereIsNotAPiece(nY + 1, nX - 1)
    )
      newField.cells[nY + 1][nX - 1] = "1";
    // bottom - right
    if (
      nY < newField.cells.length - 1 &&
      nX < newField.cells[0].length - 1 &&
      !thereIsNotAPiece(nY + 1, nX + 1)
    )
      newField.cells[nY + 1][nX + 1] = "1";
    */
    setField({ type: "set", array: newField });
    setSelectedPiece({ y: nY, x: nX });
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
    // looking for possibles steps
    /*
    // top - left
    if (nY > 0 && nX > 0 && !thereIsNotAPiece(nY - 1, nX - 1))
      newField.cells[nY - 1][nX - 1] = "0";
    // top - right
    if (
      nY > 0 &&
      nX < newField.cells[0].length - 1 &&
      !thereIsNotAPiece(nY - 1, nX + 1)
    )
      newField.cells[nY - 1][nX + 1] = "0";
    */
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

  const movePiece = (team, y, x, oldPosition) => {
    const newPosition = { y, x };
    setGoodPieces({ type: "move", newPosition, oldPosition });
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
      const [tY, tX] = target.split(":");
      // y,x of cell as number
      const ncY = Number(cY);
      const ncX = Number(cX);
      // y,x of target as number
      const ntY = Number(tY);
      const ntX = Number(tX);
      killPiece("bad", ntY, ntX);
      movePiece("good", ncY, ncX, { ...selectedPiece });
      setBotPlaying(true);
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
      <IconButton id={id} onClick={selectGoodPiece} color="success">
        <AccessibilityNewIcon sx={{ zIndex: 2 }} />
      </IconButton>
    );
  };

  const BadPiece = (props) => {
    const { id } = props;
    return (
      <IconButton id={id} onClick={selectBadPiece} color="error">
        <TokenIcon sx={{ zIndex: 2 }} />
      </IconButton>
    );
  };

  const [maxDeep, setMaxDeep] = useState(10);

  return (
    <ThemeProvider theme={dark}>
      <CssBaseline />
      <Box className="App">
        <Container sx={{ position: "absolute", left: 0, margin: "20px 10px" }}>
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
        </Container>
        <header className="App-header">
          {rows.map((item, i) => {
            return (
              <Container key={i}>
                {rows.map((jtem, j) => (
                  <Cell even={(i + j) % 2 === 0} key={j}>
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
                        onClick={(e) =>
                          possibleKillClick(
                            e.target.id,
                            field.cells[i][j].target
                          )
                        }
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
