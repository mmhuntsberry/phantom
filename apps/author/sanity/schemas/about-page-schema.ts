import { Rule } from "sanity";

const aboutPage = {
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "About",
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          title: "Alt Text",
          type: "string",
          validation: (Rule: Rule) =>
            Rule.required().error("Alt text is required for accessibility"),
        },
      ],
    },
    {
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
      validation: (Rule: Rule) => Rule.required(),
    },
  ],
};

export default aboutPage;
