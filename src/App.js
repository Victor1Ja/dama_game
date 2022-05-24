import "./App.css";

// @mui components
import {
  ThemeProvider,
  useTheme,
  CssBaseline,
  IconButton,
  Box,
} from "@mui/material";

// @mui icons
import TokenIcon from "@mui/icons-material/Token";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";

// own components
import Cell from "./components/Cell/Cell";
import Container from "./components/Container/Container";

// theme
import dark from "./assets/theme/dark";
import { useEffect, useReducer } from "react";

function App() {
  const theme = useTheme();

  const rows = [0, 1, 2, 3, 4, 5, 6, 7];

  const fieldReducer = (fieldState, action) => {
    const { type, array } = action;
    switch (type) {
      case "init": {
        return {
          cells: array,
        };
      }
      case "set":
        console.log(action.array);
        console.log(fieldState.cells);
        return {
          cells: fieldState.cells,
        };
        break;
      default:
        break;
    }
  };

  const [field, setField] = useReducer(fieldReducer, {});

  const goodPiecesReducer = (goodPieces, action) => {
    const { type } = action;
    switch (type) {
      default:
        break;
    }
  };

  const [goodPieces, setGoodPieces] = useReducer(goodPiecesReducer, [
    { y: 5, x: 6 },
    { y: 6, x: 7 },
    { y: 7, x: 6 },
    { y: 5, x: 4 },
    { y: 6, x: 5 },
    { y: 7, x: 4 },
    { y: 5, x: 2 },
    { y: 6, x: 3 },
    { y: 7, x: 2 },
    { y: 5, x: 0 },
    { y: 6, x: 1 },
    { y: 7, x: 0 },
  ]);

  const badPiecesReducer = (badPieces, action) => {
    const { type } = action;
    switch (type) {
      default:
        break;
    }
  };

  const [badPieces, setBadPieces] = useReducer(badPiecesReducer, [
    { y: 1, x: 0 },
    { y: 0, x: 1 },
    { y: 2, x: 1 },
    { y: 1, x: 2 },
    { y: 0, x: 3 },
    { y: 2, x: 3 },
    { y: 1, x: 4 },
    { y: 0, x: 5 },
    { y: 2, x: 5 },
    { y: 1, x: 6 },
    { y: 2, x: 7 },
    { y: 0, x: 7 },
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
    if (nY > 0 && nX > 0 && !thereIsNotAPiece(nY - 1, nX - 1))
      newField.cells[nY - 1][nX - 1] = "1";
    // top - right
    if (
      nY > 0 &&
      nX < newField.cells[0].length - 1 &&
      !thereIsNotAPiece(nY - 1, nX + 1)
    )
      newField.cells[nY - 1][nX + 1] = "1";
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
    setField({ type: "set", array: newField });
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
    // bottom - left
    if (
      nY < newField.cells.length - 1 &&
      nX > 0 &&
      !thereIsNotAPiece(nY + 1, nX - 1)
    )
      newField.cells[nY + 1][nX - 1] = "0";
    // bottom - right
    if (
      nY < newField.cells.length - 1 &&
      nX < newField.cells[0].length - 1 &&
      !thereIsNotAPiece(nY + 1, nX + 1)
    )
      newField.cells[nY + 1][nX + 1] = "0";
    setField({ type: "set", array: newField });
  };

  useEffect(() => {
    const newField = [];
    rows.forEach((item, i) => {
      newField.push([...rows]);
    });
    setField({ type: "init", array: newField });
  }, []);

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

  return (
    <ThemeProvider theme={dark}>
      <CssBaseline />
      <div className="App">
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
                      ></Box>
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
                      ></Box>
                    )}
                  </Cell>
                ))}
              </Container>
            );
          })}
        </header>
      </div>
    </ThemeProvider>
  );
}

export default App;
