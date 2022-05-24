/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/function-component-definition */
/* eslint-disable react/prop-types */
import { forwardRef } from "react";

// @mui components
import { Box } from "@mui/material";

// prop-types
import PropTypes from "prop-types";

const Container = forwardRef((props, ref) => {
  const {
    extraProps,
    component,
    children,
    display,
    alignItems,
    justifyContent,
    flexDirection,
    className,
    sx,
    id,
    name,
    style,
  } = props;

  const newSx = {
    flexDirection: flexDirection,
    display,
    alignItems: alignItems,
    justifyContent: justifyContent,
    ...sx,
  };

  const normalProps = {
    ref,
    component,
    style,
    id,
    name,
    sx: newSx,
    className,
  };

  return (
    <Box {...normalProps} {...extraProps}>
      {children}
    </Box>
  );
});

Container.defaultProps = {
  component: "div",
  display: "flex",
  alignItems: "left",
  justifyContent: "left",
  flexDirection: "row",
  className: "",
  id: "",
  name: "",
  sx: {},
  style: {},
  extraProps: {},
  children: <span>This is a container</span>,
};

Container.propTypes = {
  children: PropTypes.node.isRequired,
  display: PropTypes.string,
  component: PropTypes.string,
  flexDirection: PropTypes.string,
  className: PropTypes.string,
  alignItems: PropTypes.string,
  justifyContent: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  sx: PropTypes.objectOf(PropTypes.any),
  style: PropTypes.objectOf(PropTypes.any),
  extraProps: PropTypes.objectOf(PropTypes.any),
};

export default Container;
