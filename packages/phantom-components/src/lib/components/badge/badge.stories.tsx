import { Badge } from "./badge";

export default {
  component: Badge,
  parameters: {
    docs: {
      source: {
        code: null,
      },
    },
  },
  argTypes: {
    children: {
      type: {
        required: true,
      },
      control: {
        type: "text",
      },
      description:
        "The 'Children' prop allows for dynamic content customization, supporting text, icons, or a combination of both to create versatile and visually engaging buttons.",
      table: {
        type: { summary: "string | ReactNode" },
        defaultValue: { summary: "Button Text" },
      },
    },
  },
};

export const Demo = {
  args: {
    children: "Label",
  },
};
