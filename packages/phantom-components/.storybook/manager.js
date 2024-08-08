import { create } from "@storybook/theming";
import { addons } from "@storybook/addons";

import logo from "./Logo/resin_black.svg";

window.STORYBOOK_GA_ID = "UA-308574295";
window.STORYBOOK_REACT_GA_OPTIONS = {};

const theme = create({
  base: "light",
  brandImage: logo,
  brandUrl: "",
  // colorPrimary: "blue",
  barSelectedColor: "#3d53f5",
  brandTitle: "Resin Design",
  background: {
    hoverable: "rgba(#3d53f5, 0.1)",
  },
  hoverable: "rgba(#3d53f5, 0.1)",
});

addons.setConfig({
  theme,
});
