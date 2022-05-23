import "./App.css";

import { useMemo } from "react";

// @mui components
import { ThemeProvider, CssBaseline, IconButton } from "@mui/material";

// @mui icons
import TokenIcon from "@mui/icons-material/Token";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";

// own components
import Cell from "./components/Cell/Cell";
import Container from "./components/Container/Container";

// theme
import dark from "./assets/theme/dark";
import { useReducer } from "react";

function App() {
  const rows = [0, 1, 2, 3, 4, 5, 6, 7];

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

  const GoodPiece = () => {
    return (
      <IconButton color="success">
        <AccessibilityNewIcon />
      </IconButton>
    );
  };

  const BadPiece = () => {
    return (
      <IconButton color="error">
        <TokenIcon />
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
                    {thereIsABadPiece(i, j) && <BadPiece />}
                    {thereIsAGoodPiece(i, j) && <GoodPiece />}
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
