import PropTypes from "prop-types";

// @mui components
import { IconButton } from "@mui/material";

// @mui icons
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";

const GoodPiece = (props) => {
  const { id, started, selectGoodPiece } = props;
  return (
    <IconButton
      sx={{ width: "100%", height: "100%" }}
      disabled={!started}
      id={id}
      onClick={selectGoodPiece}
      color="success"
    >
      <AccessibilityNewIcon sx={{ zIndex: 2 }} />
    </IconButton>
  );
};

GoodPiece.propTypes = {
  id: PropTypes.string.isRequired,
  started: PropTypes.bool.isRequired,
  selectGoodPiece: PropTypes.func.isRequired,
};

export default GoodPiece;
