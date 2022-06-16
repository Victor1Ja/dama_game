// prop types
import PropTypes from "prop-types";

// @mui components
import { Typography, Button } from "@mui/material";

// @mui icons
import AutorenewIcon from "@mui/icons-material/Autorenew";

// own components
import Container from "../Container/Container";

const Loading = (props) => {
  const { visible } = props;

  return (
    <Container
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      sx={{
        transform: visible ? "scale(1)" : "scale(0)",
        transition: "all 500ms ease",
        left: 0,
        width: "100px",
        height: "100px",
      }}
    >
      <AutorenewIcon className="App-logo" color="primary" />
      <Typography variant="body1">Pensando</Typography>
    </Container>
  );
};

Loading.propTypes = {
  visible: PropTypes.bool,
};

export default Loading;
