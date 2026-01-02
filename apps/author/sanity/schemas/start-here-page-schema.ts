import { Rule } from "sanity";

const startHerePage = {
  name: "startHerePage",
  title: "Start Here Page",
  type: "document",
  fields: [
    {
      name: "brandPromise",
      title: "Brand Promise",
      type: "text",
      rows: 3,
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "entryPoints",
      title: "Entry Points",
      type: "array",
      of: [
        {
          name: "entryPoint",
          title: "Entry Point",
          type: "object",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: "description",
              title: "Description",
              type: "text",
              rows: 3,
            },
            {
              name: "ctaLabel",
              title: "CTA Label",
              type: "string",
            },
            {
              name: "customHref",
              title: "Custom Link (Optional)",
              type: "string",
              description:
                "Optional override. Use for off-site or custom paths.",
            },
            {
              name: "link",
              title: "Linked Content",
              type: "reference",
              to: [{ type: "writing" }, { type: "series" }, { type: "book" }],
            },
          ],
        },
      ],
      validation: (Rule: Rule) => Rule.min(1).max(3),
    },
    {
      name: "expectations",
      title: "What to Expect",
      type: "array",
      of: [{ type: "string" }],
    },
  ],
};

export default startHerePage;
