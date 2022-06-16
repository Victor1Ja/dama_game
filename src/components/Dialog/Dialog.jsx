// prop types
import PropTypes from "prop-types";

// @mui components
import { Typography, Button } from "@mui/material";

// own components
import Container from "../Container/Container";

const Dialog = (props) => {
  const { which, visible, onClose } = props;

  return (
    <Container
      sx={{
        zIndex: visible ? 99 : -1,
        position: "absolute",
        width: "100vw",
        height: "100vh",
        background: "#222222ec",
        backdropFilter: "blur(4px)",
      }}
      justifyContent="center"
      alignItems="center"
    >
      <Container
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        sx={{
          transform: visible ? "scale(1)" : "scale(0)",
          transition: "all 500ms ease",
          width: "400px",
          height: "400px",
          background: "#222333",
        }}
      >
        <Typography variant="h3">
          {which ? "Has ganado" : "Has perdido"}
        </Typography>
        <Button
          onClick={onClose}
          sx={{ marginTop: "20px" }}
          variant="contained"
        >
          Cerrar
        </Button>
      </Container>
    </Container>
  );
};

Dialog.propTypes = {
  which: PropTypes.bool,
  visible: PropTypes.bool,
  onClose: PropTypes.func,
};

export default Dialog;
