// prop types
import PropTypes from "prop-types";

// @mui components
import { useTheme } from "@mui/material";

// own component
import Container from "../Container/Container";

const Cell = (props) => {
  const { children, even } = props;

  const theme = useTheme();

  return (
    <Container
      justifyContent="center"
      alignItems="center"
      sx={{
        width: "60px",
        height: "60px",
        background: even
          ? theme.palette.primary.main
          : theme.palette.secondary.main,
      }}
    >
      {children}
    </Container>
  );
};

Cell.defaultProps = {
  children: <span></span>,
};

Cell.propTypes = {
  children: PropTypes.node,
};

export default Cell;
