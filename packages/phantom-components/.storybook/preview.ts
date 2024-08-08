import { Preview } from "@storybook/react";
import "@mmhuntsberry/tokens";

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        method: "",
        order: ["getting-started", "foundations", "components"],
        locales: "",
      },
    },
  },
};

export default preview;
