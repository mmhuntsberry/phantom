import { Preview } from "@storybook/react";
import "@mmhuntsberry/phantom-tokens";

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
