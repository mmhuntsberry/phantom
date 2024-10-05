import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { codeInput } from "@sanity/code-input";

import schemas from "./sanity/schemas";

const config = defineConfig({
  projectId: "rkn5h0ji",
  dataset: "production",
  title: "My Personal Website",
  apiVersion: "2023-03-09",
  basePath: "/admin",
  plugins: [structureTool(), codeInput()],
  schema: { types: schemas },
  useCdn: false,
});

export default config;
