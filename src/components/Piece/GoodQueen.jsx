import PropTypes from "prop-types";

// @mui components
import { IconButton } from "@mui/material";

// @mui icons
import SecurityIcon from "@mui/icons-material/Security";

const GoodQueen = (props) => {
  const { id, started, selectGoodPiece } = props;
  return (
    <IconButton
      sx={{ width: "100%", height: "100%" }}
      disabled={!started}
      id={id}
      onClick={selectGoodPiece}
      color="success"
    >
      <SecurityIcon sx={{ zIndex: 2 }} />
    </IconButton>
  );
};

GoodQueen.propTypes = {
  id: PropTypes.string.isRequired,
  started: PropTypes.bool.isRequired,
  selectGoodPiece: PropTypes.func.isRequired,
};

export default GoodQueen;
