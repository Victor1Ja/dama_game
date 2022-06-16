import PropTypes from "prop-types";

// @mui components
import { IconButton } from "@mui/material";

// @mui icons
import TokenIcon from "@mui/icons-material/Token";

const BadPiece = (props) => {
  const { id, started, selectBadPiece } = props;

  return (
    <IconButton
      sx={{ width: "100%", height: "100%" }}
      disabled={!started}
      id={id}
      onClick={selectBadPiece}
      color="error"
    >
      <TokenIcon sx={{ zIndex: 2 }} />
    </IconButton>
  );
};

BadPiece.propTypes = {
  id: PropTypes.string.isRequired,
  started: PropTypes.bool.isRequired,
  selectBadPiece: PropTypes.func.isRequired,
};

export default BadPiece;
