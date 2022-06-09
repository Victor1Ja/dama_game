import PropTypes from "prop-types";

// @mui components
import { IconButton } from "@mui/material";

// @mui icons
import AdbIcon from "@mui/icons-material/Adb";

const BadQueen = (props) => {
  const { id, started, selectBadPiece } = props;

  return (
    <IconButton
      sx={{ width: "100%", height: "100%" }}
      disabled={!started}
      id={id}
      onClick={selectBadPiece}
      color="error"
    >
      <AdbIcon sx={{ zIndex: 2 }} />
    </IconButton>
  );
};

BadQueen.propTypes = {
  id: PropTypes.string.isRequired,
  started: PropTypes.bool.isRequired,
  selectBadPiece: PropTypes.func.isRequired,
};

export default BadQueen;
