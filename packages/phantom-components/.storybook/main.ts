import { dirname, join } from "path";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../src/docs/stories/**/*.mdx",
    "../src/docs/stories/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../src/lib/**/*.mdx",
    "../src/lib/**/*.stories.@(js|jsx|ts|tsx|mdx)",
  ],

  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("@storybook/addon-coverage"),
    getAbsolutePath("@storybook/addon-mdx-gfm"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {
      builder: {
        viteConfigPath: "packages/phantom-components/vite.config.ts",
      },
    },
  },

  docs: {
    // autodocs: true,
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
